import {buildFastify} from '../build_fastify'
import { deleteHelper } from '../delete_helper';
const {HELPERS} = require('../constants');
const Redis = require('redis');
const util = require('util');
const addHelper = require('../add_helper');
const getHelpers = require('../get_helpers');
const convertPushTokenListToMessageObject = require('../convert_push_token_list_to_message_object');
const notifyHelpers = require('../notify_helpers');
const moxios = require('moxios');
const sinon = require('sinon');

describe('server test', () => {
  const fastify = buildFastify();
  const tile38Client = Redis.createClient(9851, process.env.DOCKER ? "tile38" : "localhost");
  const send_command = util.promisify(tile38Client.send_command).bind(tile38Client);

  beforeEach(function () {
    moxios.install();
  });

  afterEach(async () => {
    moxios.uninstall();
    await send_command('DROP', [HELPERS]);
  });

  afterAll(async () => {
    await fastify.close();
    await tile38Client.quit();
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
      payload: body,
    });
    expect(response.statusCode).toBe(200);
    send_command('GET', [HELPERS, exponentPushToken]).then((reply: string) => {
      expect(JSON.parse(reply)).toStrictEqual({'type': 'Point', 'coordinates': [2.41197, 48.81903]});
      done();
    });
  });
  test('addHelper function', async (done) => {
    const exponentPushToken = 'ExponentPushToken[VKwxROOrqdRmu5OtXdpgoJ]';
    const latitude = 48.81903;
    const longitude = 2.41197;
    await addHelper(send_command, exponentPushToken, latitude, longitude);
    const reply = await send_command('GET', [HELPERS, exponentPushToken]);
    expect(JSON.parse(reply)).toStrictEqual({'type': 'Point', 'coordinates': [longitude, latitude]});
    done();
  });
  test('Deleting helper using the route /helpers', async (done) => {
    const exponentPushToken = 'ExponentPushToken[VKwxROOrqdRmu5OtXdpgoJ]';
    const body = {
      exponentPushToken,
      'latitude': 48.81903,
      'longitude': 2.41197,
    };
    let response = await fastify.inject({
      method: 'POST',
      url: '/helpers',
      payload: body,
    });
    expect(response.statusCode).toBe(200);
    send_command('GET', [HELPERS, exponentPushToken]).then((reply: string) => {
      expect(JSON.parse(reply)).toStrictEqual({'type': 'Point', 'coordinates': [2.41197, 48.81903]});
    });
    response = await fastify.inject({
      method: 'DELETE',
      url: '/helpers',
      payload: {exponentPushToken},
    });
    expect(response.statusCode).toBe(200);
    send_command('GET', [HELPERS, exponentPushToken]).then((reply: string) => {
      expect(JSON.parse(reply)).toBe(null);
      done();
    });
  });
  test('Deleting unknown helper using the route /helpers', async (done) => {
    const exponentPushToken = 'ExponentPushToken[VKwxROOrqdRmu5OtXdpgoJ]';
    const response = await fastify.inject({
      method: 'DELETE',
      url: '/helpers',
      payload: {exponentPushToken},
    });
    expect(response.statusCode).toBe(200);
    send_command('GET', [HELPERS, exponentPushToken]).then((reply: string) => {
      expect(JSON.parse(reply)).toBe(null);
      done();
    });
  });
  test('deleteHelper function', async (done) => {
    const exponentPushToken = 'ExponentPushToken[VKwxROOrqdRmu5OtXdpgoJ]';
    const latitude = 48.81903;
    const longitude = 2.41197;
    await addHelper(send_command, exponentPushToken, latitude, longitude);
    let reply = await send_command('GET', [HELPERS, exponentPushToken]);
    expect(JSON.parse(reply)).toStrictEqual({'type': 'Point', 'coordinates': [longitude, latitude]});
    await deleteHelper(send_command, exponentPushToken)
    reply = await send_command('GET', [HELPERS, exponentPushToken]);
    expect(JSON.parse(reply)).toBe(null);
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
      payload: body,
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
      payload: body,
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
    expect(helpers).toStrictEqual([{
      latitude: 48.81903,
      longitude: 2.41197,
      token: 'ExponentPushToken[VKwxROOrqdRmu5OtXdpgoJ]',
    }]);
    done();
  });
  test('getHelpers function on close position', async (done) => {
    const exponentPushToken = 'ExponentPushToken[VKwxROOrqdRmu5OtXdpgoJ]';
    const latitude = 48.81903;
    const longitude = 2.41197;
    await addHelper(send_command, exponentPushToken, latitude, longitude);
    // It's about 500 meters away
    var helpers = await getHelpers(send_command, 48.81697, 2.40658);
    expect(helpers).toStrictEqual([{
      latitude: 48.81697,
      longitude: 2.40658,
      token: 'ExponentPushToken[VKwxROOrqdRmu5OtXdpgoJ]',
    }]);
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
  test('convertPushTokenListToMessageObject', () => {
    const helpers = ['ExponentPushToken[VKwxROOrqdRmu5OtXdpgoJ]', 'ExponentPushToken[Xlno3HBWUEINRLg2gx0bMl]'];
    const messageObject = convertPushTokenListToMessageObject(helpers);
    expect(messageObject).toStrictEqual([{
      'body': 'world',
      'title': 'hello',
      'to': 'ExponentPushToken[VKwxROOrqdRmu5OtXdpgoJ]',
    }, {'body': 'world', 'title': 'hello', 'to': 'ExponentPushToken[Xlno3HBWUEINRLg2gx0bMl]'}]);
  });
  test('notifyHelpers', (done) => {
    moxios.stubOnce('POST', 'https://exp.host/--/api/v2/push/send', {
      status: 200,
    });
    let onFulfilled = sinon.spy();
    const helpers = ['ExponentPushToken[VKwxROOrqdRmu5OtXdpgoJ]', 'ExponentPushToken[Xlno3HBWUEINRLg2gx0bMl]'];
    notifyHelpers(helpers).then(onFulfilled);
    moxios.wait(function () {
      expect(onFulfilled.called).toBe(true);
      expect(JSON.parse(onFulfilled.getCall(0).args[0].config.data)).toStrictEqual(convertPushTokenListToMessageObject(helpers));
      expect(onFulfilled.getCall(0).args[0].config.headers['Content-Type']).toBe('application/json');
      done();
    });
  });
  test('e2e /helpers + /helpee', async (done) => {
    const exponentPushToken = 'ExponentPushToken[VKwxROOrqdRmu5OtXdpgoJ]';
    const body = {
      exponentPushToken,
      latitude: 48.81903,
      longitude: 2.41197,
    };
    var response = await fastify.inject({
      method: 'POST',
      url: '/helpers',
      payload: body,
    });
    expect(response.statusCode).toBe(200);
    send_command('GET', [HELPERS, exponentPushToken]).then((reply: string) => {
      expect(JSON.parse(reply)).toStrictEqual({'type': 'Point', 'coordinates': [2.41197, 48.81903]});
    });

    /// Ask for help less than 500 meters away
    moxios.stubOnce('POST', 'https://exp.host/--/api/v2/push/send', {
      status: 200,
    });
    response = await fastify.inject({
      method: 'POST',
      url: '/helpee',
      payload: {
        latitude: 48.81697,
        longitude: 2.40658,
      },
    });
    expect(response.statusCode).toBe(200);
    moxios.wait(function () {
      const request = moxios.requests.mostRecent();
      expect(JSON.parse(request.config.data)).toStrictEqual(convertPushTokenListToMessageObject([exponentPushToken]));
      expect(request.config.headers['Content-Type']).toBe('application/json');
      done();
    });
  });
  test('e2e /helpers + /helpee too far away', async (done) => {
    const exponentPushToken = 'ExponentPushToken[VKwxROOrqdRmu5OtXdpgoJ]';
    const body = {
      exponentPushToken,
      latitude: 48.81903,
      longitude: 2.41197,
    };
    var response = await fastify.inject({
      method: 'POST',
      url: '/helpers',
      payload: body,
    });
    expect(response.statusCode).toBe(200);
    send_command('GET', [HELPERS, exponentPushToken]).then((reply: string) => {
      expect(JSON.parse(reply)).toStrictEqual({'type': 'Point', 'coordinates': [2.41197, 48.81903]});
    });

    /// Ask for help more than 500 meters away
    moxios.stubOnce('POST', 'https://exp.host/--/api/v2/push/send', {
      status: 200,
    });
    response = await fastify.inject({
      method: 'POST',
      url: '/helpee',
      payload: {
        latitude: 48.8584,
        longitude: 2.2945,
      },
    });
    expect(response.statusCode).toBe(200);
    moxios.wait(function () {
      const request = moxios.requests.mostRecent();
      // notifies 0 people
      expect(JSON.parse(request.config.data)).toStrictEqual([]);
      expect(request.config.headers['Content-Type']).toBe('application/json');
      done();
    });
  });
});
