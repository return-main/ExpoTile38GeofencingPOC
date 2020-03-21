"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function createExpoPushMessages(helpers, helpee) {
    return helpers.map(function (helper) { return ({
        to: helper.exponentPushToken,
        title: 'Demande d\'aide !',
        body: helpee.message,
        data: {
            latitude: helpee.latitude,
            longitude: helpee.longitude
        },
    }); });
}
exports.createExpoPushMessages = createExpoPushMessages;
