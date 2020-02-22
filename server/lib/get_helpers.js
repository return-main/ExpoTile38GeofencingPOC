const {HELPERS} = require('./constants');

async function getHelpers(send_command, latitude, longitude, radius = 500) {
  return await send_command('NEARBY', [HELPERS, 'POINT', latitude, longitude, radius]);
}

module.exports = getHelpers;
