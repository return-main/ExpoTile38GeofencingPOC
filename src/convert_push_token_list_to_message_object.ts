/// Takes a list of ExponentPushToken and converts them to a message object
/// See: https://docs.expo.io/versions/latest/guides/push-notifications/
import {ExpoPushMessage} from 'expo-server-sdk'

function convertPushTokenListToMessageObject(helpers: Helper[], message: string): ExpoPushMessage[]{
  return helpers.map(helper => ({
    to: helper.token,
    title: 'Demande d\'aide !',
    body: message,
    data: {
      latitude: helper.latitude,
      longitude: helper.longitude
    },
  }));
}

module.exports = convertPushTokenListToMessageObject;
