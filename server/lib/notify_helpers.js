const axios = require('axios')
const convertPushTokenListToMessageObject = require('./convert_push_token_list_to_message_object');

/// Takes a list of ExponentPushToken and sends push notifications to them
async function notifyHelpers(helpers) {
  const body = convertPushTokenListToMessageObject(helpers);
  return await axios.post('https://exp.host/--/api/v2/push/send', body, {headers :{
      'Content-Type': 'application/json'
    }})
}

module.exports = notifyHelpers;

