'use strict';

const { Joi } = require('../../utils/joiUtils');
const { AVAILABLE_AUTHS, GENDER_TYPES, STATUS } = require('../../utils/constants');
//load controllers
const { userController } = require('../../controllers');

let routes = [
    {
        method: 'GET',
        path: '/v1/serverResponse/',
        joiSchemaForSwagger: {
            group: 'Test',
            description: 'Route to get server response (Is server working fine or not?).',
            model: 'SERVER'
        },
        handler: userController.getServerResponse
    },
    {
        method: 'POST',
        path: '/v1/user/constact-us',
        joiSchemaForSwagger: {
            body: {
                role: Joi.string().required().description('User\'s want to join as.'),
                name: Joi.string().required().description('User\'s name.'),
                email:Joi.string().email().required().description('User\'s email.'),
                phone:Joi.string().required().description('User\'s phone.'),
                message:Joi.string().required().description('User\'s message.'),
            },
            group: 'Auth',
            description: 'Route to contact a user.',
            model: 'Contact'
        },
        handler: userController.sendContactUsMail
    },
    {
        method: 'POST',
        path: '/v1/user/register',
        joiSchemaForSwagger: {
            body: {
                firstName: Joi.string().required().description('User\'s first name.'),
                lastName: Joi.string().required().description('User\'s last name.'),
                country: Joi.string().required().description('User\'s country.'),
                email:Joi.string().email().required().description('User\'s email.'),
                password:Joi.string().required().description('User\'s Password.')
            },
            group: 'Auth',
            description: 'Route to register a user.',
            model: 'Register'
        },
        handler: userController.registerNewUser
    },
    {
        method: 'POST',
        path: '/v1/user/login',
        joiSchemaForSwagger: {
            body: {
                email: Joi.alternatives().conditional('isAdminRole', { is: true, then: Joi.string().required(), otherwise: Joi.string().optional() }),
                password: Joi.alternatives().conditional('isAdminRole', { is: true, then: Joi.string().required(), otherwise: Joi.string().optional() }),
            },
            group: 'Auth',
            description: 'Route to login a user/admin.',
            model: 'Login'
        },
        handler: userController.loginUser
    },
    {
        method: 'POST',
        path: '/v1/user/social-login',
        joiSchemaForSwagger: {
            body: {
                code:Joi.string().required().description('Code of social login.'),
                redirect_uri:Joi.string().required().description('Re-directing url of social login.'),
                loginType:Joi.number().required().description('type of social login like google -> 1, linkedin -> 2, microsoft -> 3')
            },
            group: 'Auth',
            description: 'Route to social login.',
            model: 'socialLogin'
        },
        handler: userController.socialLogin
    },
    {
        method: 'POST',
        path: '/v1/user/verify-email',
        joiSchemaForSwagger: {
            body: {
                'token': Joi.string().required().description("User's JWT token.")
            },
            group: 'Auth',
            description: 'Route to verify user email user/admin auth',
            model: 'VerifyEmail'
        },
        handler: userController.verifyEmail
    },
    {
        method: 'POST',
        path: '/v1/user/logout',
        joiSchemaForSwagger: {
            headers: {
                'authorization': Joi.string().required().description("User's JWT token.")
            },
            group: 'Auth',
            description: 'Route to logout user/admin auth',
            model: 'UserAuth'
        },
        auth: AVAILABLE_AUTHS.COMMON,
        handler: userController.logout
    },
    {
        method: 'GET',
        path: '/v1/user/profile',
        joiSchemaForSwagger: {
            headers: {
                'authorization': Joi.string().required().description("User's JWT token.")
            },
            group: 'User',
            description: 'Route to logout user/admin auth',
            model: 'userProfile'
        },
        auth: AVAILABLE_AUTHS.COMMON,
        handler: userController.getProfile
    },

    {
        method: 'GET',
        path: '/v1/user/message-list',
        joiSchemaForSwagger: {
            headers: {
                'authorization': Joi.string().required().description("User's JWT token.")
            },
            query:{
                chatId:Joi.string().required().description('Chat Id to feth teh messages')
            },
            group: 'User',
            description: 'Route to logout user/admin auth',
            model: 'userProfile'
        },
        auth: AVAILABLE_AUTHS.COMMON,
        handler: userController.getMessaegList
    },
    
    {
        method: "POST",
        path: "/v1/file/upload",
        joiSchemaForSwagger: {
            // Route format to use for files upload 
            // headers: {
            //     'authorization': Joi.string().required().description("User's JWT token.")
            // },
            formData: {
                file: Joi.file({ name: "image", description: "Single image file" }),
            },
            group: "File",
            description: "Route to upload profile image for user",
            model: "UploadFiles",
        },
        // auth: AVAILABLE_AUTHS.COMMON,
        handler: userController.uploadFile,
    },
    {
        method: 'PUT',
        path: '/v1/user',
        joiSchemaForSwagger: {
            headers: {
                'authorization': Joi.string().required().description("User's JWT token.")
            },
            body: {
                firstName: Joi.string().description('User\'s first name.'),
                lastName: Joi.string().description('User\'s last name.'),
                country: Joi.string().required().description('User\'s country.'),
                state: Joi.string().allow('').description('User\'s state.'),
                city: Joi.string().description('User\'s city.'),
                zipCode: Joi.string().allow('').description('User\'s zip code.'),
                mobileNumber: Joi.string().description('User\'s mobile number.'),
                gender: Joi.number().valid(...Object.values(GENDER_TYPES)).description(`User's gender. 1 for male and 2 for female 3 for other.`),
                dob: Joi.date().max(new Date()).description('User date of birth.'),
                imagePath: Joi.string().optional().description('Url of image.')
            },
            group: 'User',
            description: 'Route to edit user profile for user/admin',
            model: 'UpdateProfile'
        },
        auth: AVAILABLE_AUTHS.COMMON,
        handler: userController.updateProfile
    },

    {
        method: 'GET',
        path: '/v1/user/list',
        joiSchemaForSwagger: {
            headers: {
                'authorization': Joi.string().required().description("User's JWT token.")
            },
            query: {
                skip: Joi.number().default(0).description('skip'),
                limit: Joi.number().default(10).description('limit'),
                searchKey: Joi.string().allow(""),
                sortKey: Joi.string().default("createdAt").optional().description('sort key'),
                sortDirection: Joi.number().default(-1).optional().description('sort direction'),
            },
            group: 'User',
            description: 'Route to get userList for admin',
            model: 'GetUserList'
        },
        auth: AVAILABLE_AUTHS.ADMIN,
        handler: userController.list
    },
    {
        method: 'DELETE',
        path: '/v1/user',
        joiSchemaForSwagger: {
            headers: {
                'authorization': Joi.string().required().description("User's JWT token.")
            },
            query: {
                _id: Joi.string().required().description('_id of user'),
            },
            group: 'User',
            description: 'Route to delete user for admin .',
            model: 'DeleteUser'
        },
        auth: AVAILABLE_AUTHS.ADMIN,
        handler: userController.deleteUser
    },
    {
        method: 'GET',
        path: '/v1/user/details',
        joiSchemaForSwagger: {
            headers: {
                'authorization': Joi.string().required().description("User's JWT token.")
            },
            query: {
                userId: Joi.string().objectId().required().description("User's Id"),
            },
            group: 'User',
            description: 'Route to get userDetails for admin',
            model: 'GetUserDetails'
        },
        auth: AVAILABLE_AUTHS.COMMON,
        handler: userController.userDetails
    },
    {
        method: 'POST',
        path: '/v1/user/contacts',
        joiSchemaForSwagger: {
            headers: {
                'authorization': Joi.string().required().description("User's JWT token.")
            },
            body: {
                contacts: Joi.array().items(Joi.string()).required().min(1).description("User's contact list"),
            },
            group: 'User',
            description: 'Route to post user contacts ',
            model: 'GetUserContacts'
        },
        auth: AVAILABLE_AUTHS.USER,
        handler: userController.userContacts
    }
    ,
    {
        method: 'GET',
        path: '/v1/user/friends',
        joiSchemaForSwagger: {
            headers: {
                'authorization': Joi.string().required().description("User's JWT token.")
            },
            query: {
                searchKey: Joi.string().allow("")
            },
            group: 'User',
            description: 'Route to get Friends list ',
            model: 'GetFriendList'
        },
        auth: AVAILABLE_AUTHS.USER,
        handler: userController.friendList
    },


]

module.exports = routes;




