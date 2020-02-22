const {HELPERS} = require('./constants');

async function addHelper(tile38client, id, latitude, longitude) {
  await tile38client.set(HELPERS, id, latitude.toString(), longitude)
    // Expire the helper after 1 minute
    //.then(tile38client.expire(HELPERS, id, 60));
}

module.exports = addHelper;
