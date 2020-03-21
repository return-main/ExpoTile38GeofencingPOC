import fastify, {FastifyInstance} from 'fastify'
const {EXPONENT_PUSH_TOKEN, LATITUDE, LONGITUDE, MESSAGE} = require('./constants');
const FluentSchema = require('fluent-schema');
const addHelper = require('./add_helper');
const deleteHelper = require('./delete_helper');
const getHelpers = require('./get_helpers');
const Redis = require("redis");
const util = require('util');
const notifyHelpers = require('./notify_helpers');
const fs = require('fs')
const path = require('path')

export function buildFastify(): FastifyInstance {
  // Require the server framework and instantiate it
  const server = fastify({
    logger: true,
	  // https: {
		//   key: fs.readFileSync(path.join(__dirname, 'file.key')),
		//   cert: fs.readFileSync(path.join(__dirname, 'file.cert'))
	  // }
  });
  const tile38Client = Redis.createClient(9851, process.env.DOCKER ? "tile38" : "localhost");
  const send_command = util.promisify(tile38Client.send_command).bind(tile38Client);

  const helpersRouteBodySchema = FluentSchema.object()
    .prop(EXPONENT_PUSH_TOKEN, FluentSchema.string()).required()
    .prop(LATITUDE, FluentSchema.number()).required()
    .prop(LONGITUDE, FluentSchema.number()).required();
  // Helpers route
  server.post('/helpers', {
    schema: {
      body: helpersRouteBodySchema,
    },
  }, async (request, reply) => {
    console.log('Adding helper', request.body);
    await addHelper(send_command, request.body[EXPONENT_PUSH_TOKEN], request.body[LATITUDE], request.body[LONGITUDE]);
    reply.code(200).send();
  });

  const deleteHelpersRouteBodySchema = FluentSchema.object()
    .prop(EXPONENT_PUSH_TOKEN, FluentSchema.string()).required();
  // This route deletes the helper prematurely from the database
  server.delete('/helpers', {
    schema: {
      body: deleteHelpersRouteBodySchema,
    },
  }, async (request, reply) => {
    console.log('Deleting helper', request.body);
    await deleteHelper(send_command, request.body[EXPONENT_PUSH_TOKEN]);
    reply.code(200).send();
  });

  const helpeeRouteBodySchema = FluentSchema.object()
    .prop(LATITUDE, FluentSchema.number()).required()
    .prop(LONGITUDE, FluentSchema.number()).required()
    .prop(MESSAGE, FluentSchema.string()).required();
  // Helpee route
  server.post('/helpee', {
    schema: {
      body: helpeeRouteBodySchema,
    },
  }, async (request, reply) => {
    const helpers = await getHelpers(send_command, request.body[LATITUDE], request.body[LONGITUDE]);
    await notifyHelpers(helpers, request.body[MESSAGE]);
    reply.code(200).send();
  });

  server.addHook('onClose', async (instance, done) => {
    await tile38Client.quit()
    done()
  })

  return server;
}
