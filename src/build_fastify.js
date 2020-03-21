"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fastify_1 = __importDefault(require("fastify"));
var _a = require('./constants'), EXPONENT_PUSH_TOKEN = _a.EXPONENT_PUSH_TOKEN, LATITUDE = _a.LATITUDE, LONGITUDE = _a.LONGITUDE, MESSAGE = _a.MESSAGE;
var FluentSchema = require('fluent-schema');
var addHelper = require('./add_helper');
var deleteHelper = require('./delete_helper');
var getHelpers = require('./get_helpers');
var Redis = require("redis");
var util = require('util');
var notifyHelpers = require('./notify_helpers');
var fs = require('fs');
var path = require('path');
function buildFastify() {
    var _this = this;
    // Require the server framework and instantiate it
    var server = fastify_1.default({
        logger: true,
    });
    var tile38Client = Redis.createClient(9851, process.env.DOCKER ? "tile38" : "localhost");
    var send_command = util.promisify(tile38Client.send_command).bind(tile38Client);
    var helpersRouteBodySchema = FluentSchema.object()
        .prop(EXPONENT_PUSH_TOKEN, FluentSchema.string()).required()
        .prop(LATITUDE, FluentSchema.number()).required()
        .prop(LONGITUDE, FluentSchema.number()).required();
    // Helpers route
    server.post('/helpers', {
        schema: {
            body: helpersRouteBodySchema,
        },
    }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('Adding helper', request.body);
                    return [4 /*yield*/, addHelper(send_command, request.body[EXPONENT_PUSH_TOKEN], request.body[LATITUDE], request.body[LONGITUDE])];
                case 1:
                    _a.sent();
                    reply.code(200).send();
                    return [2 /*return*/];
            }
        });
    }); });
    var deleteHelpersRouteBodySchema = FluentSchema.object()
        .prop(EXPONENT_PUSH_TOKEN, FluentSchema.string()).required();
    // This route deletes the helper prematurely from the database
    server.delete('/helpers', {
        schema: {
            body: deleteHelpersRouteBodySchema,
        },
    }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('Deleting helper', request.body);
                    return [4 /*yield*/, deleteHelper(send_command, request.body[EXPONENT_PUSH_TOKEN])];
                case 1:
                    _a.sent();
                    reply.code(200).send();
                    return [2 /*return*/];
            }
        });
    }); });
    var helpeeRouteBodySchema = FluentSchema.object()
        .prop(LATITUDE, FluentSchema.number()).required()
        .prop(LONGITUDE, FluentSchema.number()).required()
        .prop(MESSAGE, FluentSchema.string()).required();
    // Helpee route
    server.post('/helpee', {
        schema: {
            body: helpeeRouteBodySchema,
        },
    }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
        var helpers;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getHelpers(send_command, request.body[LATITUDE], request.body[LONGITUDE])];
                case 1:
                    helpers = _a.sent();
                    return [4 /*yield*/, notifyHelpers(helpers, request.body[MESSAGE])];
                case 2:
                    _a.sent();
                    reply.code(200).send();
                    return [2 /*return*/];
            }
        });
    }); });
    return server;
}
exports.buildFastify = buildFastify;
