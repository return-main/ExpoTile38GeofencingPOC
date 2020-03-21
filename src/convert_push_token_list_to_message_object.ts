/// Takes a list of ExponentPushToken and converts them to a message object
/// See: https://docs.expo.io/versions/latest/guides/push-notifications/
import {ExpoPushMessage} from 'expo-server-sdk'
import {Helper} from './helper'
import {Helpee} from './Helpee'

export function convertPushTokenListToMessageObject(helpers: Helper[], helpee: Helpee): ExpoPushMessage[]{
  return helpers.map(helper => ({
    to: helper.exponentPushToken,
    title: 'Demande d\'aide !',
    body: helpee.message,
    data: {
      latitude: helpee.latitude,
      longitude: helpee.longitude
    },
  }));
}
