"use strict";
const CONFIG = require('../../config');
const HELPERS = require("../helpers");
const { MESSAGES, ERROR_TYPES, NORMAL_PROJECTION, LOGIN_TYPES, EMAIL_TYPES, TOKEN_TYPES, STATUS, USER_TYPES, COUNTRY_CODE } = require('../utils/constants');
const SERVICES = require('../services');
const CONSTANTS = require('../utils/constants');
let investorController = {};

investorController.create = async (payload)=>{
    await SERVICES.investorService.cerate({...payload,userId:payload?.user?._id});
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.CREATE_INVESTOR_ACCOUNT_SUCCESSFULLY));
}

investorController.createInevstmentRequest = async (payload)=>{
    await SERVICES.requestService.cerate({...payload,senderId:payload.user._id});
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.INVITE_REQUEST_SEND_SUCCESSFULLY));
}

investorController.getProfile = async (payload)=>{
    try{
        console.log({userId:payload.userId});
        let data = await SERVICES.investorService.getInvestor({userId:payload.userId});
        console.log(data);
       return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.FETCH_INVESTOR_PROFILE_SUCCESSFULLY),data);
    }catch(err){
        console.log(err);
    }
}


investorController.getList = async (payload)=>{
    let data = await SERVICES.investorService.getList({});
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.FETCH_INVESTOR_LIST_SUCCESSFULLY),data);
}

module.exports = investorController;