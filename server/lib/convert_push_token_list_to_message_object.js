/// Takes a list of ExponentPushToken and converts them to a message object
/// See: https://docs.expo.io/versions/latest/guides/push-notifications/
function convertPushTokenListToMessageObject(helpers) {
  return helpers.map(helper => ({
    to: helper.token,
    title: 'Demande d\'aide !',
    body: 'Cliquez pour voir l\'emplacement',
    data: {
      latitude: helper.latitude,
      longitude: helper.longitude
    },
  }));
}

module.exports = convertPushTokenListToMessageObject;
