const buildFastify = require('./lib/build_fastify');
const fastify = buildFastify();
// Run the server!
fastify.listen(3000, '0.0.0.0', (err, address) => {
  if (err) throw err;
  fastify.log.info(`server listening on ${address}`);
});
