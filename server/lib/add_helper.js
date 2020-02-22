const {HELPERS} = require('./constants');

async function addHelper(send_command, id, latitude, longitude) {
  await send_command('SET', [HELPERS, id, 'POINT', latitude, longitude])
  // Expire the helper after 1 minute
  await send_command('EXPIRE', [HELPERS, id, 60])
}

module.exports = addHelper;
