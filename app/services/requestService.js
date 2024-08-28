const { requestModel } = require("../models");

let requestService = {};

requestService.cerate= async (data)=>{
    return await requestModel(data).save();
}

requestService.update = async (criteria,data)=>{
    return await requestModel.findOneAndUpdate(criteria,data,{upsert:true,new:true})
}

requestService.getList = async (criteria)=>{
    let  records = await requestModel.aggregate([
        { $match: {...criteria} },
        { $sort: { 'createdAt': -1 } },
        { $lookup: { from: "users", localField: "senderId", foreignField: "_id", as: "sender" } },
        { $lookup: { from: "users", localField: "reciverId", foreignField: "_id", as: "reciver" } },
        { $lookup: { from: "company", localField: "companyId", foreignField: "_id", as: "company" } },
    ]);
    let count = await requestModel.count({...criteria});
    return { records, count };
}

module.exports = requestService;