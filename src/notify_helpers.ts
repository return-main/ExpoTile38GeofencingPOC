import axios from 'axios'
import {convertPushTokenListToMessageObject} from './convert_push_token_list_to_message_object'
import {Helper} from './helper'

/// Takes a list of ExponentPushToken and sends push notifications to them
export async function notifyHelpers(helpers: Helper[], message: string) {
  const body = convertPushTokenListToMessageObject(helpers, message);
  return await axios.post('https://exp.host/--/api/v2/push/send', body, {headers :{
      'Content-Type': 'application/json'
    }})
}
