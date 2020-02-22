const buildFastify = require('../lib/build_fastify');

describe('server test', () => {
  const fastify = buildFastify();

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
  test('adding a helper', async (done) => {
    const body = {
      'exponentPushToken': 'ExponentPushToken[VKwxROOrqdRmu5OtXdpgoJ]',
      'latitude': 48.81903,
      'longitude': 2.41197,
    };
    const response = await fastify.inject({
      method: 'POST',
      url: '/helpers',
      body: body,
    });
    expect(response.statusCode).toBe(200);
    done();
  });
  test('Sending weird stuff to /helpers', async (done) => {
    const body = {
      'exponentPushToken': 'ExponentPushToken[VKwxROOrqdRmu5OtXdpgoJ]',
      'latitude': "AAA",
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
