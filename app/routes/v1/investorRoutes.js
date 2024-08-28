'use strict';

const { Joi } = require('../../utils/joiUtils');
const { AVAILABLE_AUTHS, GENDER_TYPES, STATUS } = require('../../utils/constants');
//load controllers
const { companyController, investorController } = require('../../controllers');

let routes = [
    {
        method: 'GET',
        path: '/v1/investor/company-list',
        joiSchemaForSwagger: {
            headers: {
                'authorization': Joi.string().required().description("User's JWT token.")
            },
            query: {
                companyId: Joi.string().optional().description('Route to get sepecific company.')
            },
            group: 'Investor',
            description: 'Route to get company list for investor.',
            model: 'companyListForInvestor'
        },
        auth: AVAILABLE_AUTHS.COMMON,
        handler: companyController.getCompanyListForInvestor
    },
    {
        method: 'GET',
        path: '/v1/investor/profile',
        joiSchemaForSwagger: {
            headers: {
                'authorization': Joi.string().required().description("User's JWT token.")
            },
            query:{
                userId:Joi.string().required().description("User's Id.")
            },
            group: 'Investor',
            description: 'Route to get investor profile.',
            model: 'investorProfile'
        },
        auth: AVAILABLE_AUTHS.COMMON,
        handler: investorController.getProfile
    },
    {
        method: 'GET',
        path: '/v1/investor/list',
        joiSchemaForSwagger: {
            headers: {
                'authorization': Joi.string().required().description("User's JWT token.")
            },
            query:{
                userId:Joi.string().optional().description("User's Id.")
            },
            group: 'Investor',
            description: 'Route to get investor list.',
            model: 'investorList'
        },
        auth: AVAILABLE_AUTHS.COMMON,
        handler: investorController.getList
    },
    {
        method: 'POST',
        path: '/v1/investor/create',
        joiSchemaForSwagger: {
            headers: {
                'authorization': Joi.string().required().description("User's JWT token.")
            },
            body: {
                companyId: Joi.string().optional().description('Route to get sepecific company.'),
                panUrl: Joi.string().required().description('Proof docuements'),
                idProofUrl: Joi.string().required().description('Proof docuements'),
                addressUrl: Joi.string().required().description('Proof docuements'),
                bankAccountUrl: Joi.string().required().description('Proof docuements'),
                incomeUrl: Joi.string().required().description('Proof docuements'),
                subscription: Joi.string().required().description('Subscription Id')
            },
            group: 'Investor',
            description: 'Route to create investor.',
            model: 'createInvestorAccount'
        },
        auth: AVAILABLE_AUTHS.COMMON,
        handler: investorController.create
    },
    {
        method: 'POST',
        path: '/v1/investor/create-investment-request',
        joiSchemaForSwagger: {
            headers: {
                'authorization': Joi.string().required().description("User's JWT token.")
            },
            body: {
                companyId: Joi.string().optional().description('Route to get sepecific company.'),
                reciverId: Joi.string().required().description('Proof docuements'),
            },
            group: 'Investor',
            description: 'Route to create investment request.',
            model: 'createInvestmentRequest'
        },
        auth: AVAILABLE_AUTHS.COMMON,
        handler: investorController.createInevstmentRequest
    }

]

module.exports = routes;




