import axios from 'axios'
import {convertPushTokenListToMessageObject} from './convert_push_token_list_to_message_object'
import {Helper} from './helper'
import {Helpee} from './Helpee'

/// Takes a list of ExponentPushToken and sends push notifications to them
export async function notifyHelpers(helpers: Helper[], helpee: Helpee) {
  const body = convertPushTokenListToMessageObject(helpers, helpee);
  return await axios.post('https://exp.host/--/api/v2/push/send', body, {headers :{
      'Content-Type': 'application/json'
    }})
}
