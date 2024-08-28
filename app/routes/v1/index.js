
'use strict';


/********************************
 ********* All routes ***********
 ********************************/
let v1Routes = [
    ...require('./userRoutes'),
     ...require('./adminRoute'),
     ...require('./companyRoute'),
     ...require('./investorRoutes')
    
]


module.exports = v1Routes;
