const { companyModel } = require("../models");

let companyService = {};


companyService.getCompanyList = async (criteria) => {
   let  records = await companyModel.aggregate([
        { $match: {...criteria,agreeTerms:true} },
        { $sort: { 'createdAt': -1 } },
        { $lookup: { from: "users", localField: "userId", foreignField: "_id", as: "user" } },
        { $lookup: { from: "requests", localField: "_id", foreignField: "companyId", as: "request" } },
    ]);
    let count = await companyModel.count();
    return { records, count };
}


companyService.getCompanyListForInvestor = async (criteria,specificSenderId) => {
    let  records = await companyModel.aggregate([
        {
            $match: { ...criteria, agreeTerms: true }
        },
        {
            $sort: { 'createdAt': -1 }
        },
        {
            $lookup: {
                from: "users",
                localField: "userId",
                foreignField: "_id",
                as: "user"
            }
        },
        {
            $lookup: {
                from: "requests",
                localField: "_id",
                foreignField: "companyId",
                as: "request"
            }
        },
        {
            $project: {
                _id: 1,
                field1: 1, // Include other fields from the companyModel if needed
                field2: 1,
                user: 1,
                company:1,
                stockPrice:1,
                offerPrice:1,
                request: {
                    $filter: {
                        input: "$request",
                        as: "req",
                        cond: {
                            $eq: ["$$req.senderId", specificSenderId]
                        }
                    }
                }
            }
        }
    ]);
    
     let count = await companyModel.count();
     return { records, count };
 }
 

companyService.create = async (companyData) => {
    return await companyModel(companyData).save();
}

companyService.findOne = async (ceriteria) => {
    return await companyModel.findOne(ceriteria).lean()
}

companyService.updateCompany = async (criteria, dataToupdate) => {
    return await companyModel.findOneAndUpdate(criteria, dataToupdate, { upsert: true, new: true })
}


module.exports = companyService;