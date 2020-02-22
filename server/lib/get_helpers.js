const {HELPERS} = require('./constants');

async function getHelpers(tile38client, latitude, longitude) {
  await tile38client.send_command('NEARBY', [HELPERS, 'POINT', latitude, longitude], function(err, reply){
    if (err){
      console.log(err);
    }else{
      console.log(reply);
    }
  })
  // Expire the helper after 1 minute
  //.then(tile38client.expire(HELPERS, id, 60));
}

module.exports = getHelpers;
