const {HELPERS} = require('./constants');

async function getHelpers(send_command, latitude, longitude, radius = 500) {
  const reply = await send_command('NEARBY', [HELPERS, 'POINT', latitude, longitude, radius]);
  return reply[1].map(array => ({token: array[0], latitude, longitude}));
}

module.exports = getHelpers;
