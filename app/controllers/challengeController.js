"use strict";
const HELPERS = require("../helpers");
const { MESSAGES, ERROR_TYPES, NORMAL_PROJECTION, LOGIN_TYPES, NOTIFICATION_STATUS, DISTANCE_TYPE, STATUS, USER_TYPES, CHALLENGES_TYPES, TRANSACTION_STATUS, LEADERBOARD_CATEGORY, NOTIFICATION_TYPE } = require('../utils/constants');
const SERVICES = require('../services');
const { sendMultiNotifications } = require('../utils/utils');
const CONSTANTS = require('../utils/constants');
const _ = require('lodash');

const moment = require('moment-timezone');
/**************************************************
 ***************** challenges controller ***************
 **************************************************/
let challengeController = {};

/**
 * function to create a chaalenge.
 */
challengeController.createChallenge = async (payload) => {
  //check if challenge exists with same name or not
  let isChallengeExists = await SERVICES.challengeService.getChallenge({ distance: payload.distance, distanceType: payload.distanceType, isDeleted: false });
  if (isChallengeExists) {
    throw HELPERS.responseHelper.createErrorResponse(MESSAGES.CHALLENGE_ALREADY_EXISTS, ERROR_TYPES.BAD_REQUEST);
  }
  if (payload.type === CHALLENGES_TYPES.UNPAID) {
    payload.amount = 0;
  }
  //create challenge
  let data = await SERVICES.challengeService.create(payload);
  // get sessions data i.e device token
  let tokens = await SERVICES.sessionService.getSessions({ userType: CONSTANTS.USER_TYPES.USER });
  tokens = tokens.filter(item => !!item.deviceToken).map(item => item.deviceToken);
  if (tokens.length) {
    //create notification and send to specified user
    let messageObj = await sendMultiNotifications({ tokens: tokens, distance: payload.distance, distanceType: _.invert(DISTANCE_TYPE)[payload.distanceType] }, NOTIFICATION_TYPE.CHALLENGE_CREATED);
    // fetch all userID from sessions model
    let query = [{ $match: { 'deviceToken': { $in: tokens } } }, { $group: { _id: '$userId' } }, { $project: { _id: 1 } }];
    let sessionData = await SERVICES.sessionService.sessionAggregate(query);
    // check if notifications send successfully or not
    if (messageObj && messageObj.messageId) {
      let dataToInsert = [];
      sessionData.forEach(userData => {
        dataToInsert.push({ userId: userData._id, status: NOTIFICATION_STATUS.UNREAD, type: NOTIFICATION_TYPE.CHALLENGE_CREATED, ...messageObj });
      })
      // store all users notifications data in model
      await SERVICES.notificationService.createNotifications(dataToInsert);
    }
  }
  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.CHALLENGE_CREATED_SUCCESSFULLY), { data });
};

/**
 * function to get a dashboard data.
 */
challengeController.dashBoardData = async (payload) => {
  //get count of total challenges
  let totalChallenge = await SERVICES.challengeService.listCount({ isDeleted: false });
  //get count of total user
  let totalUser = await SERVICES.userService.getCountOfUsers({ userType: USER_TYPES.USER });
  // get count of paid challenges
  let paidChallenge = await SERVICES.challengeService.listCount({ isDeleted: false, type: CHALLENGES_TYPES.PAID });
  // get count of block user
  let blockUser = await SERVICES.userService.getCountOfUsers({ userType: USER_TYPES.USER, status: STATUS.BLOCK });
  let data = { totalChallenge, totalUser, paidChallenge, blockUser }
  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.DASHBOARD_DATA_FETCHED), { data });

};

/**
 * function to update a challenge.
 */
challengeController.updateChallenge = async (payload) => {
  //check if challengeId is valid  or not
  let challenge = await SERVICES.challengeService.getChallenge({ _id: payload.challengeId,distanceType: payload.distanceType, isDeleted: false });
  if (!challenge) {
    throw HELPERS.responseHelper.createErrorResponse(MESSAGES.NOT_FOUND, ERROR_TYPES.DATA_NOT_FOUND);
  }
  //check if challenge Name already exists or not
  let isChallengeExists = await SERVICES.challengeService.getChallenge({ distance: payload.distance, _id: { $ne: payload.challengeId } });
  if (isChallengeExists) {
    throw HELPERS.responseHelper.createErrorResponse(MESSAGES.CHALLENGE_ALREADY_EXISTS, ERROR_TYPES.DATA_NOT_FOUND);
  }
  if (payload.type === CHALLENGES_TYPES.UNPAID) {
    payload.amount = 0;
  }
  await SERVICES.challengeService.update({ _id: payload.challengeId }, payload);
  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.CHALLENGE_UPDATED_SUCCESSFULLY));
};

/**
 * Function to delete a challenge.
 */
challengeController.deleteChallenge = async (payload) => {
  // check if challenge id is valid or not
  let challenge = await SERVICES.challengeService.getChallenge({ _id: payload.challengeId, isDeleted: false });
  if (!challenge) {
    throw HELPERS.responseHelper.createErrorResponse(MESSAGES.NOT_FOUND, ERROR_TYPES.DATA_NOT_FOUND);
  }
  let paidChallenge = await SERVICES.paymentService.getPayment({ challengeId: payload.challengeId, status: { $ne: TRANSACTION_STATUS.REJECT } })
  // challenge with completed field and payments cannot be deleted
  if ((challenge && !challenge.completedByUser) && !paidChallenge) {
    await SERVICES.challengeService.update({ _id: payload.challengeId }, { isDeleted: true });
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.CHALLENGE_DELETED_SUCCESSFULLY));
  }
  throw HELPERS.responseHelper.createErrorResponse(MESSAGES.CHALLENGE_CANNOT_DELETED, ERROR_TYPES.BAD_REQUEST);
}

/**
 * Function to fetch list of chaalenges
 */
challengeController.list = async (payload) => {
  let sort = {};
  if (payload.sortKey) {
    sort[payload.sortKey] = payload.sortDirection;
  } else {
    sort['createdAt'] = -1;
  }
 if (payload.user.userType == CONSTANTS.USER_TYPES.ADMIN) {
    if (payload.isRecentKey) {
      let query = [
        {
          $match: { isDeleted: false }
        },
        {
          $sort: sort
        },
        {
          $skip: payload.skip
        },
        {
          $limit: payload.limit
        }
      ]
      let recentChallenges = await SERVICES.challengeService.challengeAggregate(query);
      let totalCounts = await SERVICES.challengeService.listCount({ isDeleted: false });
      return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.CHALLENGE_FETCHED_SUCCESSFULLY), { data: { recentChallenges, totalCounts } });
    }
    else {
      let query = [
        {
          $addFields: {
            challengeNameString: {
              $toString: '$distance'
            }
          },
        },
        {
          $match: { isDeleted: false, ...(payload.searchKey && { challengeNameString: { $regex: payload.searchKey, $options: 'i' } }) },
        },
        {
          $sort: sort
        },
        {
          $skip: payload.skip
        },
        {
          $limit: payload.limit
        },
      ]
      let challenges = await SERVICES.challengeService.challengeAggregate(query);
      let countQuery = [
        {
          $addFields: {
            challengeNameString: {
              $toString: '$distance'
            }
          },
        },
        {
          $match: { isDeleted: false, ...(payload.searchKey && { challengeNameString: { $regex: payload.searchKey, $options: 'i' } }) },
        }
      ]
      let totalCounts = await SERVICES.challengeService.challengeAggregate(countQuery);
      return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.CHALLENGE_FETCHED_SUCCESSFULLY), { data: { challenges, totalCounts: totalCounts.length } });
    }
  } else {
    let query = [
      {
        $match: { isDeleted: false },
      },
      {
        $sort: sort
      },
      {
        $addFields: {
          completed: 0
        }
      }

    ]
    let challenges = await SERVICES.challengeService.challengeAggregate(query);
    let totalCounts = await SERVICES.challengeService.listCount({ isDeleted: false });
    let walletData = await SERVICES.userService.getAddress({}, NORMAL_PROJECTION);
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.CHALLENGE_FETCHED_SUCCESSFULLY), { data: { challenges, totalCounts, walletData } });
  }
};



/**
 * Function to fetch list of users completed task
 */
challengeController.getChallengeById = async (payload) => {
  let challenge = await SERVICES.challengeService.getChallenge({ _id: payload.challengeId, isDeleted: false });
  if (!challenge) {
    throw HELPERS.responseHelper.createErrorResponse(MESSAGES.NOT_FOUND, ERROR_TYPES.DATA_NOT_FOUND);
  }

  // get challenge data for admin
  if ((payload.user && payload.user.userType == CONSTANTS.USER_TYPES.ADMIN) || !Object.keys(payload.user).length) {
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.CHALLENGE_FETCHED_SUCCESSFULLY), { data: { challenge } });
  }

  challenge.completedData = await SERVICES.challengeService.listUserChallenge({ challengeId: payload.challengeId, ...(payload.userId ? { userId: payload.userId } : { userId: payload.user._id }), });
  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.CHALLENGE_FETCHED_SUCCESSFULLY), { data: { challenge } });
};

/**
*function to completed challenges
*/

challengeController.completedChallenge = async (payload) => {
  payload.userId = payload.user._id;
  payload.completingDate = new Date();
  // complete a challenge for particular user
  if (payload.maxSpeed < payload.avgSpeed) {
    throw HELPERS.responseHelper.createSuccessResponse(MESSAGES.MAXSPEED_CANNOT_BE_LESS_THAN_AVG_SPEED);
  }
  await SERVICES.challengeService.createUserChallenge(payload);
  let challenge = await SERVICES.challengeService.update({ _id: payload.challengeId }, { $inc: { completedByUser: 1 } });
  await SERVICES.userService.updateUser({ _id: payload.user._id }, { $inc: { challengeCompleted: 1 } });
  let contactsQuery = [
    { $match: { userId: payload.user._id, isRegistered: true } },
    {
      $lookup: {
        from: 'users',
        localField: 'mobileNumber',
        foreignField: 'mobileNumber',
        as: 'userData'
      }
    },
    { $unwind: '$userData' },
    { $addFields: { userId: "$userData._id" } },
    {
      $lookup: {
        from: "sessions",
        localField: "userId",
        foreignField: "userId",
        as: "userSessions"
      }
    },
    { $unwind: '$userSessions' },
    {
      $group: {
        _id: null,
        deviceToken: { $push: "$userSessions.deviceToken" }
      }
    }
  ]
  let data = await SERVICES.userService.userContactAggregate(contactsQuery);
  if (data.length) {
    let tokens = data[0].deviceToken;
    //payload.notificationType = NOTIFICATION_TYPE.FRIEND_CHALLENGE_COMPLETED
    //create notification and send to specified user
    let messageObj = await sendMultiNotifications({ tokens: tokens, distance: challenge.distance, distanceType: _.invert(DISTANCE_TYPE)[challenge.distanceType], name: payload.user.firstName }, NOTIFICATION_TYPE.FRIEND_CHALLENGE_COMPLETED);
    // fetch all userID from sessions model
    let query = [{ $match: { 'deviceToken': { $in: tokens } } }, { $group: { _id: '$userId' } }, { $project: { _id: 1 } }];
    let sessionData = await SERVICES.sessionService.sessionAggregate(query);
    // check if notifications send successfully or not
    if (messageObj && messageObj.messageId) {
      let dataToInsert = [];
      sessionData.forEach(userData => {
        dataToInsert.push({ userId: userData._id, status: NOTIFICATION_STATUS.UNREAD, type: NOTIFICATION_TYPE.FRIEND_CHALLENGE_COMPLETED, ...messageObj });
      })
      // store all users notifications data in model
      await SERVICES.notificationService.createNotifications(dataToInsert);
    }
  }
  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.CHALLENGE_COMPLETED_SUCCESSFULLY));
};


/**
* Function to fetch user for particular challange
*/
challengeController.getUserByChallenges = async (payload) => {
  // get user list by particular challenge
  let list = await SERVICES.challengeService.getUserByChallenges(payload);
  let totalCounts = list.length ? list[0].totalCount : 0;
  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.CHALLENGE_FETCHED_SUCCESSFULLY), { data: { list, totalCounts } });
};

/**
* Function to fetch user by particular challenge
*/
challengeController.getChallengesByUser = async (payload) => {
  // criteria by which challenge to be fetched
  // get all challenge by particular user
  let list = await SERVICES.challengeService.getChallengesByUser(payload);
  let totalCounts = list.length ? list[0].totalCount : 0
  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.CHALLENGE_FETCHED_SUCCESSFULLY), { data: { list, totalCounts } });
};

/**
* Function to fetch list challenge list for user
*/
challengeController.challengeListForUser = async (payload) => {
  // get challenge for specific user
  let userData = await SERVICES.challengeService.listUserChallenge({ userId: payload.user._id });
  payload.user.challenges = userData.map(data => data.challengeId);
  // get challenge list for particular user
  let query = [
    {
      $match: { isDeleted: false },
    },
    {
      $addFields: {
        isChallengeCompleted: { $cond: { if: { $in: ["$_id", payload.user.challenges] }, then: 1, else: 0 } }
      }
    },
    {
      $project: {
        "distance": 1,
        "type": 1,
        "distanceType": 1,
        "amount": 1,
        isChallengeCompleted: 1,
      }
    }
  ]
  let challenges = await SERVICES.challengeService.challengeAggregate(query);
  let walletData = await SERVICES.userService.getAddress({}, NORMAL_PROJECTION);
  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.CHALLENGE_FETCHED_SUCCESSFULLY), { data: { challenges, walletData } });
};



//challenge history for a particular user
challengeController.history = async (payload) => {
  let criteria = {
    ...(payload.userId ? { userId: payload.userId } : { userId: payload.user._id }),
    ...(payload.completingDate && {
      completingDate: {
        $gte: new Date(moment(payload.completingDate).startOf('day')),
        $lte: new Date(moment(payload.completingDate).endOf('day'))
      }
    }),
  }

  //get challenge history data
  let query = [
    {
      $match: criteria,
    },
    { $lookup: { from: "challenges", localField: "challengeId", foreignField: "_id", as: "challengeData" } },
    { $unwind: "$challengeData" },
    { $sort: { 'updatedAt': 1 } },
    {
      $group: {
        _id: '$challengeId',
        challengeCompletedCount: {
          $sum: 1
        },
        "distance": { "$first": "$challengeData.distance" },
        "distanceType": { "$first": "$challengeData.distanceType" }
      }
    },
  ]
  //get challenge history data
  let challengeHistoryData = await SERVICES.challengeService.userChallengeAggregate(query);
  //get user stats
  let userStat = await SERVICES.userService.getUserStats(criteria)
  if (challengeHistoryData.length) {
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.CHALLENGE_FETCHED_SUCCESSFULLY), { data: { challengeHistoryData, userStat: userStat[0] } });
  }

  return HELPERS.responseHelper.createSuccessResponse(MESSAGES.NO_CHALLENGES_COMPLETED);


}



challengeController.calenderMark = async (payload) => {
  let userId = payload.userId;
  let query = [
    { ...(userId ? { $match: { userId: payload.userId } } : { $match: { userId: payload.user._id } }) },
    { $group: { _id: "$completingDate" } },
    { $project: { completingDate: "$_id" } },
    { $project: { _id: 0 } }
  ];
  let date = await SERVICES.challengeService.userChallengeAggregate(query);
  if (!date.length) {
    throw HELPERS.responseHelper.createSuccessResponse(MESSAGES.NO_CHALLENGES_COMPLETED);
  }
  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.COMPLETED_CHALLENGES_DATE_FETCH_SUCCESSFULLY), { date })


}

/**
* Function to fetch leaderboard list
*/
challengeController.leaderboardList = async (payload) => {
  let criteria = {
    challengeId: payload.challengeId,
  }
  let friendData;
  if(payload.leaderboardCategory == LEADERBOARD_CATEGORY.FRIEND) {
    friendData = await SERVICES.userService.getContacts({userId: payload.user._id, isRegistered: true});
    friendData = friendData.map(item => item.mobileNumber);
    friendData.push(payload.user.mobileNumber)
  }

  let userCriteria = {
    ...(payload.leaderboardCategory == LEADERBOARD_CATEGORY.COUNTRY && { $eq: [payload.user.country, '$country'] }),
    ...(payload.leaderboardCategory == LEADERBOARD_CATEGORY.FRIEND) && { $in: ['$mobileNumber', friendData] }
  }
  let dashboardData = await SERVICES.challengeService.getLeaderboardList(criteria, payload, userCriteria);

  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.CHALLENGE_FETCHED_SUCCESSFULLY), { leaderboardCategory: payload.leaderboardCategory, data: { dashboardData } });

}

/* export challengeController */
module.exports = challengeController;