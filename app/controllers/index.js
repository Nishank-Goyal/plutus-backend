'use strict';

/********************************
 * Managing all the controllers *
 ********* independently ********
 ********************************/
module.exports = {
    userController: require('./userController'),
    challengeController: require('./challengeController'),
    paymentController:require('./paymentController'),
    notificationController:require('./notificationController'),
    companyController:require('./companyController'),
    investorController:require('./investorController')
};