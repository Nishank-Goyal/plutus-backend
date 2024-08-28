
const CONFIG = require('../../config');
/********************************
 **** Managing all the services ***
 ********* independently ********
 ********************************/
module.exports = {
    userService: require('./userService'),
    swaggerService: require('./swaggerService'),
    authService: require('./authService'),
    sessionService: require('./sessionService'),
    fileUploadService: require('./fileUploadService'),
    googleLoginService:require('./googleLoginService'),
    companyService:require('./companyService'),
    investorService:require('./investorService'),
    requestService:require('./requestService'),
    messageService:require('./messageService')
};