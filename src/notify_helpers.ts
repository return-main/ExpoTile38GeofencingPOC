import axios from 'axios'
import {createExpoPushMessages} from './create_expo_push_messages'
import {Helper} from './helper'
import {Helpee} from './Helpee'
import { Expo } from 'expo-server-sdk';

/// Takes a list of Helpers and the data of the Helpee and sends push notifications to them
export async function notifyHelpers(helpers: Helper[], helpee: Helpee) {
  const messages = createExpoPushMessages(helpers, helpee);
  // The Expo push notification service accepts batches of notifications so
  // that you don't need to send 1000 requests to send 1000 notifications. We
  // recommend you batch your notifications to reduce the number of requests
  // and to compress them (notifications with similar content will get
  // compressed).
  const expo = new Expo();
  const chunks = expo.chunkPushNotifications(messages);
  for (let chunk of chunks) {
    await axios.post('https://exp.host/--/api/v2/push/send', chunk, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }
}
