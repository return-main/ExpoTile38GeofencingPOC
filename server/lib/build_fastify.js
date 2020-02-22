const Fastify = require('fastify');
const Tile38 = require('tile38');
const {EXPONENT_PUSH_TOKEN, LATITUDE, LONGITUDE} = require('./constants');
const FluentSchema = require('fluent-schema');
const addHelper = require('./add_helper');

function buildFastify() {
  // Require the server framework and instantiate it
  const fastify = Fastify({
    logger: true,
  });
  // A redis client custom built for Tile38
  const tile38client = new Tile38({debug: true });

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
    await addHelper(tile38client, request.body[EXPONENT_PUSH_TOKEN], request.body[LATITUDE], request.body[LONGITUDE]);
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
