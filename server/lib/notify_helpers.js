const axios = require('axios')

/// Takes a list of ExponentPushToken and converts them to a message object
/// See: https://docs.expo.io/versions/latest/guides/push-notifications/
function convertToMessageObject(helpers) {
  return helpers.map(value => ({to: value, title: "hello", body: "world"}));
}

/// Takes a list of ExponentPushToken and sends push notifications to them
async function notifyHelpers(helpers) {
  const body = convertToMessageObject(helpers);
  return await axios.post('https://exp.host/--/api/v2/push/send', body, {headers :{
      'Content-Type': 'application/json'
    }})
}

module.exports = notifyHelpers;

