const { messageModel } = require("../models");

let messageService = {};

messageService.cerate= async (data)=>{
    return await messageModel(data).save();
}

messageService.update = async (criteria,data)=>{
    return await messageModel.findOneAndUpdate(criteria,data,{upsert:true,new:true})
}

messageService.getList = async (criteria)=>{
    let  records = await messageModel.aggregate([
        { $match: {...criteria} },
        { $sort: { 'createdAt': -1 } },
        { $lookup: { from: "users", localField: "senderId", foreignField: "_id", as: "sender" } },
        { $lookup: { from: "users", localField: "reciverId", foreignField: "_id", as: "reciver" } }
    ]);
    let count = await messageModel.count({...criteria});
    return { records, count };
}

module.exports = messageService;