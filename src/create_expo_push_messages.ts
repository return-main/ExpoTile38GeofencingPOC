import {ExpoPushMessage} from 'expo-server-sdk'
import {Helper} from './helper'
import {Helpee} from './Helpee'

/**
 * Prends une liste de ExponentPushToken
 * et la convertis en objet de message Expo
 * Voir: https://docs.expo.io/versions/latest/guides/push-notifications/
 * @param helpers
 * @param helpee
 */
export function createExpoPushMessages(helpers: Helper[], helpee: Helpee): ExpoPushMessage[]{
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
