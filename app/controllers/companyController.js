"use strict";
const CONFIG = require('../../config');
const HELPERS = require("../helpers");
const { MESSAGES, ERROR_TYPES, NORMAL_PROJECTION, LOGIN_TYPES, EMAIL_TYPES, TOKEN_TYPES, STATUS, USER_TYPES, COUNTRY_CODE } = require('../utils/constants');
const SERVICES = require('../services');
const {  encryptJwt, decryptJwt } = require('../utils/utils');
const commonFunctions = require('../utils/utils');
const MONGOOSE = require('mongoose');


let companyController={};


companyController.getCompanyList = async(payload)=>{
    let criteria = {};
    if(payload?.employe){
        criteria['userId']= payload.user._id
    }
    if(payload.companyId){
        criteria._id = MONGOOSE.Types.ObjectId(payload.companyId)
    }
    let data =  await SERVICES.companyService.getCompanyList(criteria)
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.COMPANY_LIST_FETCH_SUCCESSFULLY),{data});
}

companyController.getCompanyInvestorList = async (payload)=>{
    console.log({companyId:payload.companyId});
    let data = await SERVICES.requestService.getList({reciverId:payload.user._id,companyId:MONGOOSE.Types.ObjectId(payload.companyId)});
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.COMPANY_LIST_FETCH_SUCCESSFULLY),{data});
}

companyController.emailVerify = async (payload)=>{
    let data   = decryptJwt(payload.token);
    if(data){
        await SERVICES.companyService.create({company:data.company,companyEmail:data.companyEmail,userId:data.user._id,emailVerification:true})
        return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.EMAIL_VERIFY_SUCCESSFULLY));
    }
    throw HELPERS.responseHelper.createErrorResponse(MESSAGES.UNAUTHORIZED, ERROR_TYPES.UNAUTHORIZED);
}


companyController.createCompany = async(payload)=>{
    let company = await SERVICES.companyService.findOne({companyEmail:payload.companyEmail});
    if(company?.emailVerification){
        await SERVICES.companyService.updateCompany({companyEmail:payload.companyEmail},payload);
        return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.COMPANY_CREATED_SUCCESSFULLY));
    }
    throw HELPERS.responseHelper.createErrorResponse(MESSAGES.EMAIL_VERIFICATION_PENDING, ERROR_TYPES.BAD_REQUEST);
}

companyController.createCompanyVerification = async (payload)=>{
    let token = await encryptJwt(payload, '1h');
    payload.user['email'] = payload.companyEmail
    await commonFunctions.sendEmail({ ...payload.user, url: `${CONFIG.SERVER_URL}/v1/company/email-verify/?token=${token}` }, EMAIL_TYPES.EMAIL_VERIFY);
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.VERIFICATION_CODE_SEND_ON_YOUR_EMAIL));
}

companyController.verifyCompany = async (payload)=>{
    await SERVICES.companyService.updateCompany({_id:payload.companyId},{companyVerification:true,offerPrice:payload.offerPrice,stockPrice:payload.stockPrice});
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.COMPANY_VERIFY_SUCCESSFULY));
}

companyController.acceptRequest = async (payload)=>{
    console.log('----------->>',payload);
    SERVICES.requestService.update({_id:payload._id},{status:true})
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.ACCEPT_REQUEST_SUCCESSFULLY));
}

companyController.getCompanyListForInvestor = async (payload)=>{
    let criteria = {companyVerification:true};
    if(payload.companyId){
        criteria._id = MONGOOSE.Types.ObjectId(payload.companyId)
    }
    let data =  await SERVICES.companyService.getCompanyListForInvestor(criteria,payload.user._id)
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.COMPANY_LIST_FETCH_SUCCESSFULLY),{data});
}


module.exports = companyController;