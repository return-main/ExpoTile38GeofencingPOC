const buildFastify = require('../lib/build_fastify');
const {HELPERS} = require('../lib/constants');
const Redis = require('redis');
const util = require('util');
const addHelper = require('../lib/add_helper');
const getHelpers = require('../lib/get_helpers');

describe('server test', () => {
  const fastify = buildFastify();
  const tile38Client = Redis.createClient(9851, 'localhost');
  const send_command = util.promisify(tile38Client.send_command).bind(tile38Client);

  afterEach(async () => send_command('DROP', [HELPERS]));

  afterAll(async () => {
    await fastify.close();
  });

  test('404 on unknown route', async (done) => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/',
    });
    expect(response.statusCode).toBe(404);
    done();
  });
  test('Adding a helper using the route /helpers', async (done) => {
    const exponentPushToken = 'ExponentPushToken[VKwxROOrqdRmu5OtXdpgoJ]';
    const body = {
      exponentPushToken,
      'latitude': 48.81903,
      'longitude': 2.41197,
    };
    const response = await fastify.inject({
      method: 'POST',
      url: '/helpers',
      body: body,
    });
    expect(response.statusCode).toBe(200);
    send_command('GET', [HELPERS, exponentPushToken]).then((reply) => {
      expect(JSON.parse(reply)).toStrictEqual({'type': 'Point', 'coordinates': [2.41197, 48.81903]});
      done();
    });
  });
  test('addHelpers function', async (done) => {
    const exponentPushToken = 'ExponentPushToken[VKwxROOrqdRmu5OtXdpgoJ]';
    const latitude = 48.81903;
    const longitude = 2.41197;
    await addHelper(send_command, exponentPushToken, latitude, longitude);
    const reply = await send_command('GET', [HELPERS, exponentPushToken]);
    expect(JSON.parse(reply)).toStrictEqual({'type': 'Point', 'coordinates': [longitude, latitude]});
    done();
  });
  test('Sending weird stuff to /helpers', async (done) => {
    const body = {
      'exponentPushToken': 'ExponentPushToken[VKwxROOrqdRmu5OtXdpgoJ]',
      'latitude': 'AAA',
      'longitude': 2.41197,
    };
    const response = await fastify.inject({
      method: 'POST',
      url: '/helpers',
      body: body,
    });
    expect(response.statusCode).toBe(400);
    done();
  });
  test('Missing parameters /helpers', async (done) => {
    const body = {
      'exponentPushToken': 'ExponentPushToken[VKwxROOrqdRmu5OtXdpgoJ]',
      'longitude': 2.41197,
    };
    const response = await fastify.inject({
      method: 'POST',
      url: '/helpers',
      body: body,
    });
    expect(response.statusCode).toBe(400);
    done();
  });
  test('getHelpers function on same position', async (done) => {
    const exponentPushToken = 'ExponentPushToken[VKwxROOrqdRmu5OtXdpgoJ]';
    const latitude = 48.81903;
    const longitude = 2.41197;
    await addHelper(send_command, exponentPushToken, latitude, longitude);
    const helpers = await getHelpers(send_command, latitude, longitude);
    expect(helpers).toStrictEqual(['ExponentPushToken[VKwxROOrqdRmu5OtXdpgoJ]']);
    done();
  });
  test('getHelpers function on close position', async (done) => {
    const exponentPushToken = 'ExponentPushToken[VKwxROOrqdRmu5OtXdpgoJ]';
    const latitude = 48.81903;
    const longitude = 2.41197;
    await addHelper(send_command, exponentPushToken, latitude, longitude);
    // It's about 500 meters away
    var helpers = await getHelpers(send_command, 48.81697, 2.40658);
    expect(helpers).toStrictEqual(['ExponentPushToken[VKwxROOrqdRmu5OtXdpgoJ]']);
    // 400 meters is too short
    helpers = await getHelpers(send_command, 48.81697, 2.40658, 400);
    expect(helpers).toStrictEqual([]);
    done();
  });
  test('getHelpers function too far', async (done) => {
    const exponentPushToken = 'ExponentPushToken[VKwxROOrqdRmu5OtXdpgoJ]';
    const latitude = 48.81903;
    const longitude = 2.41197;
    await addHelper(send_command, exponentPushToken, latitude, longitude);
    const helpers = await getHelpers(send_command, 12.11111, longitude);
    expect(helpers).toStrictEqual([]);
    done();
  });
});
