const {HELPERS} = require('./constants');

async function addHelper(send_command, id, latitude, longitude, expiration = 60) {
  await send_command('SET', [HELPERS, id, 'POINT', latitude, longitude])
  // Expire the helper after 1 minute
  await send_command('EXPIRE', [HELPERS, id, expiration])
}

module.exports = addHelper;
