import {buildFastify} from '../build_fastify'
import {deleteHelper} from '../delete_helper'
import Redis from 'redis'
import util from 'util'
import {addHelper} from '../add_helper'
import {getHelpers} from '../get_helpers'
import {convertPushTokenListToMessageObject} from '../convert_push_token_list_to_message_object'
import {notifyHelpers} from '../notify_helpers'
import moxios from 'moxios'
import sinon from 'sinon'
import {HELPERS} from '../constants'
import {Helper} from '../helper'
import {Helpee} from '../Helpee'
import {ExpoPushMessage} from 'expo-server-sdk'

describe('server test', () => {
  const fastify = buildFastify()
  const tile38Client = Redis.createClient(9851, process.env.DOCKER ? 'tile38' : 'localhost')
  const send_command: (command: string, args?: any[]) => Promise<any> = util.promisify(tile38Client.send_command).bind(tile38Client)

  beforeEach(function () {
    moxios.install()
  })

  afterEach(async () => {
    moxios.uninstall()
    await send_command('DROP', [HELPERS])
  })

  afterAll(async () => {
    await fastify.close()
    await tile38Client.quit()
  })

  const MOCK_PUSH_TOKEN = 'ExponentPushToken[VKwxROOrqdRmu5OtXdpgoJ]'
  const MOCK_HELPER: Helper = {
    exponentPushToken: MOCK_PUSH_TOKEN,
    latitude: 48.81903,
    longitude: 2.41197,
  }
  const MOCK_HELPERS: Helper[] = [
    MOCK_HELPER, {
      exponentPushToken: 'ExponentPushToken[Xlno3HBWUEINRLg2gx0bMl]',
      latitude: 48.81697,
      longitude: 2.40658,
    }]
  const MOCK_MESSAGE = 'I\'ve fallen and I can\'t get up !'
  const MOCK_HELPEE: Helpee = {
    latitude: 48.81903,
    longitude: 2.41197,
    message: MOCK_MESSAGE
  }
  const MOCK_EXPO_PUSH_MESSAGES: ExpoPushMessage[] = [
    {
      body: MOCK_HELPEE.message,
      data: {
        latitude: MOCK_HELPEE.latitude,
        longitude: MOCK_HELPEE.longitude
      },
      title: "Demande d'aide !",
      to: MOCK_HELPERS[0].exponentPushToken
    },
    {
      body: MOCK_HELPEE.message,
      data: {
        latitude: MOCK_HELPEE.latitude,
        longitude: MOCK_HELPEE.longitude
      },
      title: "Demande d'aide !",
      to: MOCK_HELPERS[1].exponentPushToken
    },
  ]
  test('404 on unknown route', async (done) => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/',
    })
    expect(response.statusCode).toBe(404)
    done()
  })
  test('Adding a helper using the route /helpers', async (done) => {
    const body = {
      exponentPushToken: MOCK_PUSH_TOKEN,
      latitude: 48.81903,
      longitude: 2.41197,
    }
    const response = await fastify.inject({
      method: 'POST',
      url: '/helpers',
      payload: body,
    })
    expect(response.statusCode).toBe(200)
    send_command('GET', [HELPERS, MOCK_PUSH_TOKEN]).then((reply: string) => {
      expect(JSON.parse(reply)).toStrictEqual({'type': 'Point', 'coordinates': [2.41197, 48.81903]})
      done()
    })
  })
  test('addHelper function', async (done) => {
    await addHelper(send_command, MOCK_HELPER)
    const reply = await send_command('GET', [HELPERS, MOCK_HELPER.exponentPushToken])
    expect(JSON.parse(reply)).toStrictEqual({'type': 'Point', 'coordinates': [MOCK_HELPER.longitude, MOCK_HELPER.latitude]})
    done()
  })
  test('Deleting helper using the route /helpers', async (done) => {
    const body = {
      exponentPushToken: MOCK_PUSH_TOKEN,
      'latitude': 48.81903,
      'longitude': 2.41197,
    }
    let response = await fastify.inject({
      method: 'POST',
      url: '/helpers',
      payload: body,
    })
    expect(response.statusCode).toBe(200)
    send_command('GET', [HELPERS, MOCK_PUSH_TOKEN]).then((reply: string) => {
      expect(JSON.parse(reply)).toStrictEqual({'type': 'Point', 'coordinates': [2.41197, 48.81903]})
    })
    response = await fastify.inject({
      method: 'DELETE',
      url: '/helpers',
      payload: {exponentPushToken: MOCK_PUSH_TOKEN},
    })
    expect(response.statusCode).toBe(200)
    send_command('GET', [HELPERS, MOCK_PUSH_TOKEN]).then((reply: string) => {
      expect(JSON.parse(reply)).toBe(null)
      done()
    })
  })
  test('Deleting unknown helper using the route /helpers', async (done) => {
    const response = await fastify.inject({
      method: 'DELETE',
      url: '/helpers',
      payload: {exponentPushToken: MOCK_PUSH_TOKEN},
    })
    expect(response.statusCode).toBe(200)
    send_command('GET', [HELPERS, MOCK_PUSH_TOKEN]).then((reply: string) => {
      expect(JSON.parse(reply)).toBe(null)
      done()
    })
  })
  test('deleteHelper function', async (done) => {
    await addHelper(send_command, MOCK_HELPER)
    let reply = await send_command('GET', [HELPERS, MOCK_HELPER.exponentPushToken])
    expect(JSON.parse(reply)).toStrictEqual({'type': 'Point', 'coordinates': [MOCK_HELPER.longitude, MOCK_HELPER.latitude]})
    await deleteHelper(send_command, MOCK_HELPER.exponentPushToken)
    reply = await send_command('GET', [HELPERS, MOCK_HELPER.exponentPushToken])
    expect(JSON.parse(reply)).toBe(null)
    done()
  })
  test('Sending weird stuff to /helpers', async (done) => {
    const body = {
      'exponentPushToken': 'ExponentPushToken[VKwxROOrqdRmu5OtXdpgoJ]',
      'latitude': 'AAA',
      'longitude': 2.41197,
    }
    const response = await fastify.inject({
      method: 'POST',
      url: '/helpers',
      payload: body,
    })
    expect(response.statusCode).toBe(400)
    done()
  })
  test('Missing parameters /helpers', async (done) => {
    const body = {
      'exponentPushToken': 'ExponentPushToken[VKwxROOrqdRmu5OtXdpgoJ]',
      'longitude': 2.41197,
    }
    const response = await fastify.inject({
      method: 'POST',
      url: '/helpers',
      payload: body,
    })
    expect(response.statusCode).toBe(400)
    done()
  })
  test('getHelpers function on same position', async (done) => {
    await addHelper(send_command, MOCK_HELPER)
    const helpers = await getHelpers(send_command, MOCK_HELPER.latitude, MOCK_HELPER.longitude)
    expect(helpers).toStrictEqual([MOCK_HELPER])
    done()
  })
  test('getHelpers function on close position', async (done) => {
    await addHelper(send_command, MOCK_HELPER)
    // It's about 500 meters away
    let helpers = await getHelpers(send_command, 48.81697, 2.40658)
    expect(helpers).toStrictEqual([MOCK_HELPER])
    // 400 meters is too short
    helpers = await getHelpers(send_command, 48.81697, 2.40658, 400)
    expect(helpers).toStrictEqual([])
    done()
  })
  test('getHelpers function too far', async (done) => {
    await addHelper(send_command, MOCK_HELPER)
    const helpers = await getHelpers(send_command, 12.11111, 12.11111)
    expect(helpers).toStrictEqual([])
    done()
  })
  test('convertPushTokenListToMessageObject', () => {
    const messageObject = convertPushTokenListToMessageObject(MOCK_HELPERS, MOCK_HELPEE)
    expect(messageObject).toStrictEqual(MOCK_EXPO_PUSH_MESSAGES)
  })
  test('notifyHelpers', (done) => {
    moxios.stubOnce('POST', 'https://exp.host/--/api/v2/push/send', {
      status: 200,
    })
    let onFulfilled = sinon.spy()
    notifyHelpers(MOCK_HELPERS, MOCK_HELPEE).then(onFulfilled)
    moxios.wait(function () {
      expect(onFulfilled.called).toBe(true)
      expect(JSON.parse(onFulfilled.getCall(0).args[0].config.data)).toStrictEqual(convertPushTokenListToMessageObject(MOCK_HELPERS, MOCK_HELPEE))
      expect(onFulfilled.getCall(0).args[0].config.headers['Content-Type']).toBe('application/json')
      done()
    })
  })
  test('e2e /helpers + /helpee', async (done) => {
    const body = {
      exponentPushToken: MOCK_PUSH_TOKEN,
      latitude: 48.81903,
      longitude: 2.41197,
    }
    let response = await fastify.inject({
      method: 'POST',
      url: '/helpers',
      payload: body,
    })
    expect(response.statusCode).toBe(200)
    send_command('GET', [HELPERS, MOCK_PUSH_TOKEN]).then((reply: string) => {
      expect(JSON.parse(reply)).toStrictEqual({'type': 'Point', 'coordinates': [2.41197, 48.81903]})
    })

    /// Ask for help less than 500 meters away
    await moxios.stubOnce('POST', 'https://exp.host/--/api/v2/push/send', {
      status: 200,
    })
    response = await fastify.inject({
      method: 'POST',
      url: '/helpee',
      payload: {
        latitude: 48.81697,
        longitude: 2.40658,
      },
    })
    expect(response.statusCode).toBe(200)
    moxios.wait(function () {
      const request = moxios.requests.mostRecent()
      expect(JSON.parse(request.config.data)).toStrictEqual(convertPushTokenListToMessageObject([MOCK_HELPERS[0]], MOCK_HELPEE))
      expect(request.config.headers['Content-Type']).toBe('application/json')
      done()
    })
  })
  test('e2e /helpers + /helpee too far away', async (done) => {
    const body = {
      exponentPushToken: MOCK_PUSH_TOKEN,
      latitude: 48.81903,
      longitude: 2.41197,
    }
    let response = await fastify.inject({
      method: 'POST',
      url: '/helpers',
      payload: body,
    })
    expect(response.statusCode).toBe(200)
    send_command('GET', [HELPERS, MOCK_PUSH_TOKEN]).then((reply: string) => {
      expect(JSON.parse(reply)).toStrictEqual({'type': 'Point', 'coordinates': [2.41197, 48.81903]})
    })

    /// Ask for help more than 500 meters away
    await moxios.stubOnce('POST', 'https://exp.host/--/api/v2/push/send', {
      status: 200,
    })
    response = await fastify.inject({
      method: 'POST',
      url: '/helpee',
      payload: {
        message: MOCK_MESSAGE,
        latitude: 48.8584,
        longitude: 2.2945,
      },
    })
    expect(response.statusCode).toBe(200)
    moxios.wait(function () {
      const request = moxios.requests.mostRecent()
      // notifies 0 people
      expect(JSON.parse(request.config.data)).toStrictEqual([])
      expect(request.config.headers['Content-Type']).toBe('application/json')
      done()
    })
  })
})
