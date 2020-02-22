/// Takes a list of ExponentPushToken and converts them to a message object
/// See: https://docs.expo.io/versions/latest/guides/push-notifications/
function convertPushTokenListToMessageObject(helpers) {
  return helpers.map(value => ({to: value, title: "hello", body: "world"}));
}

module.exports = convertPushTokenListToMessageObject;
