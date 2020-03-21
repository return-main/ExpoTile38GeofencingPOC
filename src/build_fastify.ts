import fastify, {FastifyInstance} from 'fastify'
import {deleteHelper} from './delete_helper'
import FluentSchema from 'fluent-schema'
import {addHelper} from './add_helper'
import {getHelpers} from './get_helpers'
import Redis from 'redis'
import {EXPONENT_PUSH_TOKEN, LATITUDE, LONGITUDE, MESSAGE} from './constants'
import util from 'util'
import {notifyHelpers} from './notify_helpers'
import fs from 'fs'
import path from 'path'
import {Helpee} from './Helpee'
import {Helper} from './helper'

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
  const send_command: (command: string, args?: any[]) => Promise<any> = util.promisify(tile38Client.send_command).bind(tile38Client);

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
    const helper: Helper = {
      exponentPushToken: request.body[EXPONENT_PUSH_TOKEN],
      latitude: request.body[LATITUDE],
      longitude: request.body[LONGITUDE]
    }
    await addHelper(send_command, helper);
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
    await deleteHelper(send_command, request.body[EXPONENT_PUSH_TOKEN])
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
    const helpee: Helpee = {
      latitude: request.body[LATITUDE],
      longitude: request.body[LONGITUDE],
      message: request.body[MESSAGE]
    }
    const helpers = await getHelpers(send_command, helpee.latitude, helpee.longitude);
    await notifyHelpers(helpers, helpee);
    reply.code(200).send();
  });

  server.addHook('onClose', async (instance, done) => {
    await tile38Client.quit()
    done()
  })

  return server;
}
