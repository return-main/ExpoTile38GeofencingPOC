const Fastify = require('fastify');
const {EXPONENT_PUSH_TOKEN, LATITUDE, LONGITUDE} = require('./constants');
const FluentSchema = require('fluent-schema');
const addHelper = require('./add_helper');
const Redis = require("redis");
const util = require('util');

function buildFastify() {
  // Require the server framework and instantiate it
  const fastify = Fastify({
    logger: true,
  });
  const tile38Client = Redis.createClient(9851, "localhost");
  const send_command = util.promisify(tile38Client.send_command).bind(tile38Client);

  const helpersRouteBodySchema = FluentSchema.object()
    .prop(EXPONENT_PUSH_TOKEN, FluentSchema.string()).required()
    .prop(LATITUDE, FluentSchema.number()).required()
    .prop(LONGITUDE, FluentSchema.number()).required();
  // Helpers route
  fastify.post('/helpers', {
    schema: {
      body: helpersRouteBodySchema,
    },
  }, async (request, reply) => {
    console.log('Adding helper', request.body);
    await addHelper(send_command, request.body[EXPONENT_PUSH_TOKEN], request.body[LATITUDE], request.body[LONGITUDE]);
    reply.code(200).send();
  });

  const helpeeRouteBodySchema = FluentSchema.object()
    .prop(LATITUDE, FluentSchema.number()).required()
    .prop(LONGITUDE, FluentSchema.number()).required();
  // Helpee route
  fastify.post('/helpee', {
    schema: {
      body: helpeeRouteBodySchema,
    },
  }, (request, reply) => {
    console.log('Request body', request.body);
    reply.code(200).send();
  });

  return fastify;
}

module.exports = buildFastify;
