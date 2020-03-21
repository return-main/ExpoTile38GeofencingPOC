"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function convertPushTokenListToMessageObject(helpers, message) {
    return helpers.map(function (helper) { return ({
        to: helper.token,
        title: 'Demande d\'aide !',
        body: message,
        data: {
            latitude: helper.latitude,
            longitude: helper.longitude
        },
    }); });
}
module.exports = convertPushTokenListToMessageObject;
