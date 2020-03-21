"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var build_fastify_1 = require("./src/build_fastify");
var server = build_fastify_1.buildFastify();
// Run the server!
server.listen(3000, '0.0.0.0', function (err, address) {
    if (err)
        throw err;
    server.log.info("server listening on " + address);
});
