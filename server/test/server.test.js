const buildFastify = require('../lib/build_fastify');
const {HELPERS} = require('../lib/constants');
const Redis = require('redis');

describe('server test', () => {
  const fastify = buildFastify();
  const tile38Client = Redis.createClient(9851, 'localhost');

  afterAll(async () => {
    await fastify.close();
    //await tile38Client.drop(HELPERS);
  });

  test('404 on unknown route', async (done) => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/',
    });
    expect(response.statusCode).toBe(404);
    done();
  });
  test('adding a helper', async (done) => {
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
    tile38Client.send_command('GET', [HELPERS, exponentPushToken],
      function(err, reply){
        if (err){
          expect(false).toBe(true);
        }else{
          expect(JSON.parse(reply)).toStrictEqual({"type":"Point","coordinates":[2.41197,48.81903]});
          done();
        }
      }
    );

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
});
