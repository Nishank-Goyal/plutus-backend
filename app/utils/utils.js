let CONSTANTS = require('./constants');
const MONGOOSE = require('mongoose');
const BCRYPT = require("bcrypt");
const JWT = require("jsonwebtoken");
const CONFIG = require('../../config');
const awsSms = require('aws-sns-sms');
const fs = require('fs');
const _ = require('lodash');
const { admin } = require(`../../config/firebaseConfig`);
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(CONFIG.SEDNGRID.API_KEY);


const awsSnsConfig = {
  accessKeyId: CONFIG.AWS.accessKeyId,
  secretAccessKey: CONFIG.AWS.secretAccessKey,
  region: CONFIG.AWS.awsRegion,
};

// let client = require('redis').createClient({
//   port: CONFIG.REDIS.PORT,
//   host: CONFIG.REDIS.HOST
// });

let commonFunctions = {};

/**
 * incrypt password in case user login implementation
 * @param {*} payloadString 
 */
commonFunctions.hashPassword = (payloadString) => {
  return BCRYPT.hashSync(payloadString, CONSTANTS.SECURITY.BCRYPT_SALT);
};

/**
 * @param {string} plainText 
 * @param {string} hash 
 */
commonFunctions.compareHash = (payloadPassword, userPassword) => {
  return BCRYPT.compareSync(payloadPassword, userPassword);
};

/**
 * function to get array of key-values by using key name of the object.
 */
commonFunctions.getEnumArray = (obj) => {
  return Object.keys(obj).map(key => obj[key]);
};

/** used for converting string id to mongoose object id */
commonFunctions.convertIdToMongooseId = (stringId) => {
  return MONGOOSE.Types.ObjectId(stringId);
};

/** create jsonwebtoken **/
commonFunctions.encryptJwt = (payload, expTime = '24h') => {
  return JWT.sign(payload, CONSTANTS.SECURITY.JWT_SIGN_KEY, { algorithm: 'HS256' }, { expTime: expTime });
};

commonFunctions.decryptJwt = (token) => {
  return JWT.verify(token, CONSTANTS.SECURITY.JWT_SIGN_KEY, { algorithm: 'HS256' })
}

/**
 * function to convert an error into a readable form.
 * @param {} error 
 */
commonFunctions.convertErrorIntoReadableForm = (error) => {
  let errorMessage = '';
  if (error.message.indexOf("[") > -1) {
    errorMessage = error.message.substr(error.message.indexOf("["));
  } else {
    errorMessage = error.message;
  }
  errorMessage = errorMessage.replace(/"/g, '');
  errorMessage = errorMessage.replace('[', '');
  errorMessage = errorMessage.replace(']', '');
  error.message = errorMessage;
  return error;
};

/***************************************
 **** Logger for error and success *****
 ***************************************/
commonFunctions.log = {
  info: (data) => {
    console.log('\x1b[33m' + data, '\x1b[0m');
  },
  success: (data) => {
    console.log('\x1b[32m' + data, '\x1b[0m');
  },
  error: (data) => {
    console.log('\x1b[31m' + data, '\x1b[0m');
  },
  default: (data) => {
    console.log(data, '\x1b[0m');
  }
};

/**
 * Send an email to perticular user mail 
 * @param {*} email email address
 * @param {*} subject  subject
 * @param {*} content content
 * @param {*} cb callback
 */

commonFunctions.sendEmail = async (userData, type) => {
  /** setup email data **/
  const mailData = commonFunctions.emailTypes(userData, type);
  const email = userData.email;
  console.log(mailData,'send to :- ',email,'From :-',`${CONFIG.PLATFORM}<${CONFIG.SEDNGRID.SENDER_EMAIL}>`);
  try {
    return await sgMail.send({
      to: email, // Change to your recipient
      from: `${CONFIG.PLATFORM}<${CONFIG.SEDNGRID.SENDER_EMAIL}>`, // Change to your verified sender
      subject: mailData.data.Subject,
      html: mailData.data.template,
    }, function (error, body) {
      if (error) {
        console.log(JSON.stringify(error))
      }
    });
  } catch (err) {
    console.log(err);
  }

};

commonFunctions.emailTypes = (user, type) => {
  let EmailStatus = {
    Subject: '',
    data: {},
    template: ''
  };
  switch (type) {
    case CONSTANTS.EMAIL_TYPES.SETUP_PASSWORD:
      EmailStatus["Subject"] = CONSTANTS.EMAIL_SUBJECTS.SETUP_PASSWORD;
      EmailStatus.template = CONSTANTS.MAIL_GUN_TEMPLATES.SETUP_PASSWORD_EMAIL;
      EmailStatus.data["link"] = user.setupPasswordLink;
      EmailStatus.data["firstName"] = user.firstName;
      // EmailStatus.data["senderLastName"] = user.adminLastName;
      EmailStatus.data["baseURL"] = user.baseURL;
      break;

    case CONSTANTS.EMAIL_TYPES.FORGOT_PASSWORD_EMAIL:
      EmailStatus["Subject"] = CONSTANTS.EMAIL_SUBJECTS.RESET_PASSWORD_EMAIL;;
      // EmailStatus.template = CONSTANTS.MAIL_GUN_TEMPLATES.RESET_PASSWORD_EMAIL;
      EmailStatus.data["firstName"] = user.firstName;
      EmailStatus.data["link"] = user.resetPasswordLink;
      EmailStatus.data["baseURL"] = user.baseURL;
      break;
    case CONSTANTS.EMAIL_TYPES.EMAIL_VERIFY:
      EmailStatus.data['Subject'] = CONSTANTS.EMAIL_SUBJECTS.EMAIL_VERIFICATION;
      EmailStatus.data.template = CONSTANTS.EMAIL_CONTENTS.VERIFY_EMAIL(user);
      EmailStatus.data.link = user.url;
      break;

    case CONSTANTS.EMAIL_TYPES.CONTACT_US:
      EmailStatus.data['Subject'] = CONSTANTS.EMAIL_SUBJECTS.INTERSTED_TO_CONTACT;
      EmailStatus.data.template = CONSTANTS.EMAIL_CONTENTS.CONTACT(user);
      break;

    default:
      EmailStatus['Subject'] = 'Welcome Email!';
      break;
  }
  return EmailStatus;
};

commonFunctions.renderTemplate = (template, data) => {
  return handlebars.compile(template)(data);
};

/**
 * function to create reset password link.
 */
commonFunctions.createResetPasswordLink = (userData) => {
  let dataForJWT = { ...userData, Date: Date.now };
  let resetPasswordLink = CONFIG.CLIENT_URL + '/auth/resetpassword/' + commonFunctions.encryptJwt(dataForJWT, '1h');
  return resetPasswordLink;
};

/**
* function to create a setup password link.
*/
commonFunctions.createSetupPasswordLink = (userData) => {
  let token = commonFunctions.encryptJwt({ ...userData, date: Date.now, }, '1h');
  let setupPasswordLink = CONFIG.CLIENT_URL + '/auth/invite/' + token;
  return setupPasswordLink;
};

/**
 * function to create reset password link.
 */
commonFunctions.createAccountRestoreLink = (userData) => {
  let dataForJWT = { previousAccountId: userData._id, Date: Date.now, email: userData.email, newAccountId: userData.newAccountId };
  let accountRestoreLink = CONFIG.CLIENT_URL + '/v1/user/restore/' + commonFunctions.encryptJwt(dataForJWT);
  return accountRestoreLink;
};

/**
 * function to get data from redis 
 */
commonFunctions.getDataFromRedis = async (key) => {
  key = key.toString();
  let value = await new Promise((resolve, reject) => {
    client.get(key, function (err, value) {
      return resolve(JSON.parse(value))
    });
  })
  return value;
};

/**
 * function to generate random alphanumeric string
 */
commonFunctions.generateAlphanumericString = (length) => {
  let chracters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  var randomString = '';
  for (var i = length; i > 0; --i) randomString += chracters[Math.floor(Math.random() * chracters.length)];
  return randomString;
};

/**
 * function to sent sms via AWS-SNS
 * @param {receiver} phoneNumber
 * @param {content} SMS 
 */
commonFunctions.sendSms = async (receiver, content) => {
  let msg = {
    "message": content,
    "sender": CONFIG.AWS.smsSender || 'Chicmic',
    "phoneNumber": receiver
  };
  let smsResponse = await awsSms(awsSnsConfig, msg);
  return smsResponse
}

/**
 * function to get pagination condition for aggregate query.
 * @param {*} sort
 * @param {*} skip
 * @param {*} limit
 */
commonFunctions.getPaginationConditionForAggregate = (sort, skip, limit) => {
  let condition = [...(!!sort ? [{ $sort: sort }] : []), { $skip: skip }, { $limit: limit }];
  console.log(condition);
  return condition;
};

/**
 * Send an notifications to particular user 
 */
commonFunctions.sendMultiNotifications = async (data, type) => {
  const message = commonFunctions.notificationsType(data, type);
  return await admin.messaging().sendMulticast(message)
    .then(response => {
      let { responses = [] } = response;
      let messageId = (responses[0] && responses[0].messageId && responses[0].messageId.split("/").reverse()[0]) || '';
      //let messageId = messageIdStr.substring(messageIdStr.indexOf(":") + 1, messageIdStr.indexOf("%")) || '';
      return { messageId, body: message.notification.body, title: message.notification.title };
    })
    .catch(error => {
      console.log('<<<<<<<<<<', error);
      //throw responseHelper.createErrorResponse(error.message, ERROR_TYPES.BAD_REQUEST);
    });
}

commonFunctions.notificationsType = (data, type) => {
  let Message = {
    notification: {},
    tokens: '',
    topic: ''
  };
  switch (type) {
    case CONSTANTS.NOTIFICATION_TYPE.CHALLENGE_CREATED:
      Message.notification["title"] = CONSTANTS.FCM_TITLE.CHALLENGE_ADDED;
      Message.notification["body"] = `Challenge Created for ${data.distance} ${data.distanceType}.`;
      Message.tokens = data.tokens;
      Message.topic = CONSTANTS.FCM_TOPICS.PUBLIC;
      break;

    case CONSTANTS.NOTIFICATION_TYPE.FRIEND_CHALLENGE_COMPLETED:
      Message.notification["title"] = CONSTANTS.FCM_TITLE.FRIEND_CHALLENGE_COMPLETED;
      Message.notification["body"] = `Hi your friend ${data.name} completed challenge for ${data.distance} ${data.distanceType}.`;
      Message.tokens = data.tokens;
      Message.topic = CONSTANTS.FCM_TOPICS.PUBLIC;
      break;
  }
  return Message;
};

module.exports = commonFunctions;

