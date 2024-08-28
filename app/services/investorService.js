const { investorModel } = require("../models");

let investorService = {};


investorService.getInvestor = async (criteria)=>{
    return await investorModel.findOne(criteria);
}

investorService.cerate= async (data)=>{
    return await investorModel(data).save();
}


investorService.getList = async (criteria)=>{
    let  records = await investorModel.aggregate([
        { $match: {...criteria} },
        { $sort: { 'createdAt': -1 } },
        { $lookup: { from: "users", localField: "userId", foreignField: "_id", as: "user" } }
    ]);
    let count = await investorModel.count();
    return { records, count };
}

module.exports = investorService;