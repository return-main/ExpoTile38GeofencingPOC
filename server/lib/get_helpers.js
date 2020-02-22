const {HELPERS} = require('./constants');

async function getHelpers(send_command, latitude, longitude) {
  return await send_command('NEARBY', [HELPERS, 'POINT', latitude, longitude, 500]);
}

module.exports = getHelpers;
