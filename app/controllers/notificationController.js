"use strict";
const HELPERS = require("../helpers");
const { MESSAGES, ERROR_TYPES, NORMAL_PROJECTION, LOGIN_TYPES, EMAIL_TYPES, TOKEN_TYPE, STATUS, USER_TYPES, CHALLENGES_TYPES, TRANSACTION_STATUS } = require('../utils/constants');
const SERVICES = require('../services');
const CONSTANTS = require('../utils/constants');

/**************************************************
 ***************** Notification controller ***************
 **************************************************/
let notificationController = {};


/**
 * Function to update notification status
 */
notificationController.updateStatus = async (payload) => {
    // update notifications status from unerad to read
    await SERVICES.notificationService.updateNotifications({userId: payload.user._id}, {status: CONSTANTS.NOTIFICATION_STATUS.READ});
    return HELPERS.responseHelper.createSuccessResponse(MESSAGES.STATUS_UPDATED_SUCCESSFULLY);
};

/**
 * get notification list
 * @param {*} payload 
 */
notificationController.getNotifications = async (payload) => {
    let query = [
        { $match: { userId: payload.user._id } },
        { $sort: { 'createdAt': -1 }},
        { $skip: payload.skip },
        { $limit: payload.limit},
        {
            $project: {
                userId: 1,
                messageId: 1,
                title: 1,
                body: 1,
                createdAt: 1,
                status: 1

            }
        }
    ]
    let data = await SERVICES.notificationService.notificationAggregate(query);
    let dataCount = await SERVICES.notificationService.count({ userId: payload.user._id });
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.DATA_FETCHED_SUCCESSFULLY), { data: data ,dataCount });
}
/* export notificationController */
module.exports = notificationController;