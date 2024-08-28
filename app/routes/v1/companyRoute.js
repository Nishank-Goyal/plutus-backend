'use strict';

const { Joi } = require('../../utils/joiUtils');
const { AVAILABLE_AUTHS, GENDER_TYPES, STATUS } = require('../../utils/constants');
//load controllers
const { companyController } = require('../../controllers');

let routes = [
    {
        method: 'GET',
        path: '/v1/company/email-verify',
        joiSchemaForSwagger: {
            query: {
                'token': Joi.string().required().description("User's JWT token.")
            },
            group: 'Comoany',
            description: 'Route to get company email verification.',
            model: 'companyEmailVerify'
        },
        handler: companyController.emailVerify
    },
    {
        method: 'GET',
        path: '/v1/company/list',
        joiSchemaForSwagger: {
            headers: {
                'authorization': Joi.string().required().description("User's JWT token.")
            },
            query:{
                companyId:Joi.string().optional().description('Route to get sepecific company.'),
                employe:Joi.boolean().optional().description('You are hitting this as employe')
            },
            group: 'Comoany',
            description: 'Route to get company list.',
            model: 'companyList'
        },
        auth: AVAILABLE_AUTHS.COMMON,
        handler: companyController.getCompanyList
    },
    {
        method: 'GET',
        path: '/v1/company/investor-list',
        joiSchemaForSwagger: {
            headers: {
                'authorization': Joi.string().required().description("User's JWT token.")
            },
            query:{
                companyId:Joi.string().required().description("User's Company Id.")
            },
            group: 'Comoany',
            description: 'Route to get company investor request.',
            model: 'companyInvestorList'
        },
        auth: AVAILABLE_AUTHS.COMMON,
        handler: companyController.getCompanyInvestorList
    },
    {
        method: 'POST',
        path: '/v1/company/create',
        joiSchemaForSwagger: {
            headers: {
                'authorization': Joi.string().required().description("User's JWT token.")
            },
            body: {
                company: Joi.string().required().description('User\'s company name.'),
                website:Joi.string().required().description('User\'s company website.'),
                companyEmail:Joi.string().email().required().description('User\'s company email.'),
                addressLine1: Joi.string().required().description('User\'s address line 1.'),
                addressLine2: Joi.string().optional().description('User\'s address line 2.'),
                city: Joi.string().required().description('User\'s city.'),
                state: Joi.string().required().description('User\'s state.'),
                zipCode: Joi.number().required().description('User\'s zip code.'),
                country: Joi.string().required().description('User\'s country.'),
                addressProofUrl: Joi.string().optional().description('User\'s address proof.'),
                lastDateofESOPExcercise: Joi.string().optional().description('User\'s last date of ESOP excercise.'),
                grantLetterUrl: Joi.string().required().description('User\'s grant letter.'),
                latestOptionStatusUrl: Joi.string().required().description('User\'s latest option status.'),
                last409orFMVUrl: Joi.string().required().description('User\'s ast 409 or FMV.'),
                panUrl: Joi.string().required().description('User\'s PAN proof.'),
                AddarUrl: Joi.string().required().description('User\'s addar proof.'),
                agreeTerms: Joi.boolean().required().description('User\'s aggreement.'),
                agreeEmailUpdate: Joi.boolean().required().description('User\'s aggreement.')
            },
            group: 'Comoany',
            description: 'Route to create company by user.',
            model: 'createCompany'
        },
        auth: AVAILABLE_AUTHS.COMMON,
        handler: companyController.createCompany
    },
    {
        method: 'POST',
        path: '/v1/company/create-verification',
        joiSchemaForSwagger: {
            headers: {
                'authorization': Joi.string().required().description("User's JWT token.")
            },
            body: {
                company: Joi.string().required().description('User\'s company name.'),
                companyEmail:Joi.string().email().required().description('User\'s company email.')
            },
            group: 'Comoany',
            description: 'Route to create company  verification by user.',
            model: 'createCompanyVerification'
        },
        auth: AVAILABLE_AUTHS.COMMON,
        handler: companyController.createCompanyVerification
    },
    {
        method: 'PUT',
        path: '/v1/company/verify-company',
        joiSchemaForSwagger: {
            headers: {
                'authorization': Joi.string().required().description("User's JWT token.")
            },
            body: {
                companyId: Joi.string().required().description('User\'s company id.'),
                stockPrice:Joi.number().required().description('User\'s company stock price.'),
                offerPrice:Joi.number().required().description('User\'s company stock price.'),
            },
            group: 'Comoany',
            description: 'Route to create company  verification user company by Admin.',
            model: 'verifyCompany'
        },
        auth: AVAILABLE_AUTHS.ADMIN,
        handler: companyController.verifyCompany
    },
    {
        method: 'PUT',
        path: '/v1/company/accept',
        joiSchemaForSwagger: {
            headers: {
                'authorization': Joi.string().required().description("User's JWT token.")
            },
            body: {
                _id: Joi.string().required().description('User\'s company id.')
            },
            group: 'Comoany',
            description: 'Route to accept request.',
            model: 'acceptRequest'
        },
        auth: AVAILABLE_AUTHS.COMMON,
        handler: companyController.acceptRequest
    }

]

module.exports = routes;




