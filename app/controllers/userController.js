"use strict";
const path = require('path');
const CONFIG = require('../../config');
const HELPERS = require("../helpers");
const { MESSAGES, ERROR_TYPES, NORMAL_PROJECTION, LOGIN_TYPES, EMAIL_TYPES, TOKEN_TYPES, STATUS, USER_TYPES, COUNTRY_CODE } = require('../utils/constants');
const SERVICES = require('../services');
const { compareHash, encryptJwt, createResetPasswordLink, sendEmail, createSetupPasswordLink, decryptJwt, hashPassword, sendSms } = require('../utils/utils');
const CONSTANTS = require('../utils/constants');
const qrCode = require('qrcode');
const fs = require('fs');
const _ = require('lodash');
const { util } = require('chai');
const commonFunctions = require('../utils/utils');
const MONGOOSE = require('mongoose');


/**************************************************
 ***************** user controller ***************
 **************************************************/
let userController = {};

/**
 * function to check server.
 */
userController.getServerResponse = async () => {
  throw HELPERS.responseHelper.createSuccessResponse(MESSAGES.SUCCESS);
}

/**
 * function to register a user to the system.
 */
userController.registerNewUser = async (payload) => {
  let isUserAlreadyExists = await SERVICES.userService.getUser({ email: payload.email }, NORMAL_PROJECTION);
  if (!isUserAlreadyExists) {
    payload.password = hashPassword(payload.password)
    let newRegisteredUser = await SERVICES.userService.createUser(payload);
    newRegisteredUser = newRegisteredUser[0]._doc;
    const dataForJwt = {
      id: newRegisteredUser._id,
      date: Date.now()
    };
    let token = await encryptJwt(dataForJwt, '1h');
    await commonFunctions.sendEmail({ ...newRegisteredUser, url: `${CONFIG.CLIENT_URL}/auth/email-verify/${token}` }, EMAIL_TYPES.EMAIL_VERIFY);
    // create session for particular user
    await SERVICES.sessionService.updateSession({ userId: newRegisteredUser._id }, { userId: newRegisteredUser._id, token: token });
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.VERIFICATION_CODE_SEND_ON_YOUR_EMAIL));
  }
  throw HELPERS.responseHelper.createErrorResponse(MESSAGES.EMAIL_ALREADY_EXISTS, ERROR_TYPES.BAD_REQUEST);
};


userController.sendContactUsMail = async (payload)=>{
  console.log(payload,CONFIG.ADMIN.EMAIL);
  payload.senderEmail = payload.email;
  await commonFunctions.sendEmail({...payload,email:CONFIG.ADMIN.EMAIL},5)
  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.YOUR_MESSAGE_SEND_SUCCESSFULLY));
}

/**
 * function to login a user to the system.
 */
userController.loginUser = async (payload) => {
    // check is user exists in the database with provided email or not.
    let user = await SERVICES.userService.getUser({ email: payload.email }, { ...NORMAL_PROJECTION });
    // if user exists then compare the password that user entered.
    if (user) {
      if(!user.isVerify){
        throw HELPERS.responseHelper.createErrorResponse(MESSAGES.EMAIL_VERIFICATION_PENDING, ERROR_TYPES.BAD_REQUEST);
      }
      // compare user's password.
      if (compareHash(payload.password, user.password)) {
        const dataForJwt = {
          id: user._id,
          date: Date.now()
        };
        delete user.password;
        let token = await encryptJwt(dataForJwt);
        let data = { userId: user._id, token: token }
        // create session for particular user
        await SERVICES.sessionService.createSession(data);
        return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.LOGGED_IN_SUCCESSFULLY), { token });
      }else{
        throw HELPERS.responseHelper.createErrorResponse(MESSAGES.INVALID_PASSWORD, ERROR_TYPES.BAD_REQUEST);
      }
    }
    throw HELPERS.responseHelper.createErrorResponse(MESSAGES.INVALID_EMAIL, ERROR_TYPES.BAD_REQUEST);
};

userController.socialLogin = async (payload)=>{
  let user = await SERVICES.googleLoginService.getAccessToken({code:payload.code,redirect_uri:payload.redirect_uri});
  const dataForJwt = {
    id: user._id,
    date: Date.now()
  };
  delete user.password;
  let token = await encryptJwt(dataForJwt);
  let data = { userId: user._id, token: token }
  // create session for particular user
  await SERVICES.sessionService.createSession(data);
  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.LOGGED_IN_SUCCESSFULLY), { token });
}

/**
 * funciton to send a link to registered email of an user who forgots his password.
 */
userController.forgotPassword = async (payload) => {
  console.log('<<<<<<<<<<<<<<<<<<<< ', payload)
  let requiredUser = await SERVICES.userService.getUser({ email: payload.email });
  if (requiredUser) {
    requiredUser.tokenType = CONSTANTS.TOKEN_TYPES.RESET_PASSWORD
    // create reset-password link.
    let resetPasswordLink = createResetPasswordLink({ id: requiredUser._id });
    let linkParts = resetPasswordLink.split("/");
    payload.passwordToken = linkParts[linkParts.length - 1];
    await SERVICES.sessionService.createSession({ userId: requiredUser._id, token: payload.passwordToken, tokenType: CONSTANTS.TOKEN_TYPES.RESET_PASSWORD })
    // send forgot-password email to user.
    await sendEmail({
      email: requiredUser.email,
      firstName: requiredUser.firstName,
      resetPasswordLink: resetPasswordLink
    }, EMAIL_TYPES.FORGOT_PASSWORD_EMAIL);
    return HELPERS.responseHelper.createSuccessResponse(MESSAGES.FORGOT_PASSWORD_EMAIL_SENT_SUCCESSFULLY)
  }
  return HELPERS.responseHelper.createErrorResponse(MESSAGES.NO_USER_FOUND);
};

/**
 * function to logout an user.
 */
userController.logout = async (payload) => {
  //remove session of user
  await SERVICES.sessionService.removeSession({ token: payload.user.token });
  return HELPERS.responseHelper.createSuccessResponse(MESSAGES.LOGGED_OUT_SUCCESSFULLY);
};

/**
 * function to update user's profile
 */
userController.updateProfile = async (payload) => {
  //update user's profile'
  let updatedUser = await SERVICES.userService.updateUser({ _id: payload.user._id }, payload, { ...NORMAL_PROJECTION, password: 0, passwordToken: 0 });
  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.PROFILE_UPDATE_SUCCESSFULLY), { data: updatedUser });
};

/**
 * Function to upload file.
 */


userController.uploadFile = async (payload) => {
  // check whether the request contains valid payload.
  if (!Object.keys(payload.file).length) {
    throw HELPERS.responseHelper.createErrorResponse(MESSAGES.FILE_REQUIRED_IN_PAYLOAD, ERROR_TYPES.BAD_REQUEST);
  }
  let pathToUpload = path.resolve(__dirname + `../../..${CONFIG.PATH_TO_UPLOAD_FILES_ON_LOCAL}`),
    pathOnServer = CONFIG.PATH_TO_UPLOAD_FILES_ON_LOCAL;
  let fileUrl = await SERVICES.fileUploadService.uploadFile(payload, pathToUpload, pathOnServer);
  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.FILE_UPLOADED_SUCCESSFULLY), { fileUrl });
};


userController.getProfile = async (payload)=>{
  let investor = await SERVICES.investorService.getInvestor({userId:payload.user._id})
  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.GET_USER_PROFILE_SUCESSFULLY),{data:payload.user,investor});
}

userController.getMessaegList = async (payload)=>{
  let data = await SERVICES.messageService.getList({chatId:MONGOOSE.Types.ObjectId(payload.chatId)});
  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.MESSAGE_LIST_FETCH_SUCCESSFULLY),{data});
}


userController.verifyEmail = async (payload)=>{
  console.log(payload);
  let session = await SERVICES.sessionService.getSession({token:payload.token});
  if(!session){
  return HELPERS.responseHelper.createErrorResponse(MESSAGES.NO_USER_FOUND);
  }
  let user = decryptJwt(session.token);
  user = await SERVICES.userService.updateUser({_id:user.id},{isVerify:true});
  const dataForJwt = {
    id: user._id,
    date: Date.now()
  };
  let token = await encryptJwt(dataForJwt);
  let data = { userId: user._id, token: token }
  // create session for particular user
  await SERVICES.sessionService.createSession(data);
  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.EMAIL_VERIFY_SUCCESSFULLY), { token });
}


/**
 * Function to reset password of user.
 * @param {*} payload
 */
userController.resetPassword = async (payload) => {
  let decodedObj = decryptJwt(payload.token);
  //check wheather password is valid
  if (!decodedObj) {
    throw HELPERS.responseHelper.createErrorResponse(MESSAGES.UNAUTHORIZED, ERROR_TYPES.UNAUTHORIZED);
  }
  // Get the user by passwordToken from database.
  let userData = await SERVICES.sessionService.getSession({ token: payload.token, tokenType: TOKEN_TYPES.RESET_PASSWORD });
  if (!userData) {
    throw HELPERS.responseHelper.createErrorResponse(MESSAGES.UNAUTHORIZED, ERROR_TYPES.UNAUTHORIZED);
  }
  // Update the user password if found in db.
  await SERVICES.userService.updateUser({ _id: userData.userId }, { password: hashPassword(payload.password) }, NORMAL_PROJECTION);
  // Now delete the token from db.
  await SERVICES.sessionService.removeSession({ token: payload.token });
  return HELPERS.responseHelper.createSuccessResponse(MESSAGES.PASSWORD_UPDATED_SUCCESSFULLY);
};

/**
 * Function to update password of admin.

 */
userController.updatePassword = async (payload) => {
  //check if old  password given by user is correct
  if (!compareHash(payload.oldPassword, payload.user.password)) {
    throw HELPERS.responseHelper.createErrorResponse(MESSAGES.OLD_PASSWORD_INVALID, ERROR_TYPES.BAD_REQUEST);
  }
  await SERVICES.userService.updateUser({ _id: payload.user._id }, { password: hashPassword(payload.newPassword) }, NORMAL_PROJECTION);
  return HELPERS.responseHelper.createSuccessResponse(MESSAGES.PASSWORD_UPDATED_SUCCESSFULLY);
};

/**
 * Function to get admin data.
 */
userController.getAdminProfile = async (payload) => {
  //get user profile
  let user = await SERVICES.userService.getUser({ _id: payload.user._id }, { ...NORMAL_PROJECTION, password: 0, challengeCompleted: 0 })
  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.PROFILE_FETCHED_SUCCESSFULLY), { data: user });
};

/**
 * Function to get user data 
 */
userController.list = async (payload) => {
  let regex = new RegExp(payload.searchKey, 'i');
  let criteria = {
    $and: [{ $or: [{ firstName: regex }, { lastName: regex }, { mobileNumber: regex }] }, { userType: CONSTANTS.USER_TYPES.USER }]
  }
  //get user list with search and sort
  let sort = {};
  if (payload.sortKey) {
    sort[payload.sortKey] = payload.sortDirection;
  } else {
    sort['createdAt'] = -1;
  }
  let query = [
    {
      $match: criteria
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
    {
      $project: {
        "firstName": 1,
        "lastName": 1,
        "gender": 1,
        "country": 1,
        "state": 1,
        "city": 1,
        "imagePath": 1,
        "mobileNumber": 1,
        'challengeCompleted': 1,
        "status": 1,
      }
    },
  ]
  let userList = await SERVICES.userService.userAggregate(query);
  //count users in database
  let userCount = await SERVICES.userService.getCountOfUsers(criteria);
  let data = {
    list: userList,
    userCount: userCount
  }
  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.USER_FETCHED_SUCCESSFULLY), { data })
}

/**
 * Function to block-unblock user.
 */

userController.blockUser = async (payload) => {
  let criteria = {
    _id: payload.id,
    userType: CONSTANTS.USER_TYPES.USER
  }
  //get user from database 
  let user = await SERVICES.userService.getUser(criteria, NORMAL_PROJECTION);
  //if user is present then update its status
  if (user) {
    //check if user is already active or already blocked
    if (user.status === payload.status) {
      throw HELPERS.responseHelper.createErrorResponse(`${payload.status === CONSTANTS.STATUS.BLOCK ? MESSAGES.USER_ALREADY_BLOCKED : MESSAGES.USER_ALREADY_ACTIVE}`, ERROR_TYPES.BAD_REQUEST);
    }
    //if not then update the status of user to block/unblock
    await SERVICES.userService.updateUser(criteria, { status: payload.status })
    if (payload.status === CONSTANTS.STATUS.BLOCK) {
      await SERVICES.sessionService.removeAllSession({ userId: payload.id, userType: CONSTANTS.USER_TYPES.USER })
    }
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(`${payload.status === CONSTANTS.STATUS.BLOCK ? MESSAGES.USER_BLOCKED_SUCCESSFULLY : MESSAGES.USER_UNBLOCKED_SUCCESSFULLY}`), { user })
  }
  throw HELPERS.responseHelper.createErrorResponse(MESSAGES.USER_NOT_FOUND, ERROR_TYPES.DATA_NOT_FOUND);
}

/**
 * Function to delete user
 */
userController.deleteUser = async (payload) => {
  //get data of user
  let data = await SERVICES.userService.deleteUser({ _id: payload._id });
  //if present then delete the user
  if (data) {
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.USER_DELETED_SUCCESSFULLY));
  }
}

userController.userDetails = async (payload) => {
  let criteria = {
    userId: payload.userId
  }, userStatData = {
    totalCalories: 0,
    totalTime: 0,
    totalDistance: 0
  };
  //get challenge details completed by a user
  let userStat = await SERVICES.userService.getUserStats(criteria, NORMAL_PROJECTION);
  //get user data
  let userData = await SERVICES.userService.getUser({ _id: payload.userId });
  if (userStat[0]) {
    userStatData = userStat[0];
  }
  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.DATA_FETCHED_SUCCESSFULLY), { user: { ...userStatData, ...userData } })
}

/**
 * Function to update wallet address.
 */
userController.updateWalletAddress = async (payload) => {
  let fileName = `upload_${Date.now()}.jpeg`;
  fs.writeFileSync(`./${fileName}`, '');
  await qrCode.toFile(`${fileName}`, payload.walletAddress, {
    errorCorrectionLevel: 'H',
    quality: 0.95,
    margin: 1,
    color: {
      dark: '#208698',
      light: '#FFF',
    },
  })
  let data = fs.readFileSync(`./${fileName}`);
  let imageUrl = await SERVICES.fileUploadService.uploadFileToS3(data, `upload_${Date.now()}.jpeg`, CONFIG.S3_BUCKET.zipBucketName);
  fs.unlinkSync(`./${fileName}`);
  //find and update user address
  await SERVICES.userService.updateAddress({}, { walletAddress: payload.walletAddress, QRImage: imageUrl });
  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.DATA_UPDATED_SUCCESSFULLY))
}

/**
 * Function to get wallet address.
 */
userController.getWalletAddress = async () => {
  //get user wallet address 
  let address = await SERVICES.userService.getAddress({}, NORMAL_PROJECTION);
  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.DATA_FETCHED_SUCCESSFULLY), { address })
}

/**
 * Function to post user contacts.
 */
userController.userContacts = async (payload) => {
  //get all user data
  let users = await SERVICES.userService.getUsers({ "mobileNumber": { $ne: payload.user.mobileNumber } }, { _id: 0, mobileNumber: 1 });
  users = users.map(item => item.mobileNumber);
  let contactArr = [];
  payload.contacts.map((contact) => {
    contact = contact.replace(/[^\d"+"]/gi, '')
    if (contact.charAt(0) != "+") {
      contact = `+${payload.user.countryCode}${contact}`;
    }
    if (contact != payload.user.mobileNumber) {
      contactArr.push({ userId: payload.user._id, mobileNumber: contact, ...(users.includes(contact) ? { isRegistered: true } : { isRegistered: false }) })
    }
  })
  contactArr = _.uniqBy(contactArr, 'mobileNumber');
  //delete older contacts
  console.log(contactArr);
  await SERVICES.userService.deleteAllContacts({ userId: payload.user._id });
  await SERVICES.userService.saveContacts(contactArr);
  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.CONTACTS_ADDED_SUCCESSFULLY))
}
/**
 * friend list
 * @param {*} payload 
 * @returns 
 */
userController.friendList = async (payload) => {
  let query = [
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
    { ...(payload.searchKey ? { $match: { $or: [{ "userData.firstName": { $regex: payload.searchKey, $options: 'i' } }, { "userData.lastName": { $regex: payload.searchKey, $options: 'i' } }] } } : { $match: {} }) },
    {
      $project: {
        _id: '$userData._id',
        firstName: '$userData.firstName',
        lastName: '$userData.lastName',
        imagePath: '$userData.imagePath',
        mobileNumber: '$userData.mobileNumber',
        challengeCompleted: '$userData.challengeCompleted',
      }
    }
  ]
  let data = await SERVICES.userService.userContactAggregate(query);
  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.DATA_FETCHED_SUCCESSFULLY), { data })
}
/* export userController */
module.exports = userController;
