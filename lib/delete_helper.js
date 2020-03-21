const {HELPERS} = require('./constants');

async function deleteHelper(send_command, id) {
  await send_command('DEL', [HELPERS, id])
}

module.exports = deleteHelper;
