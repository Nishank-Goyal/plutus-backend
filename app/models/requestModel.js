
"use strict";
/************ Modules **********/
const MONGOOSE = require('mongoose');
const Schema = MONGOOSE.Schema;

/************ user Session Model **********/
const requestSchema = new Schema({
    senderId: { type: Schema.Types.ObjectId, ref: 'users',required:true },
    reciverId: { type: Schema.Types.ObjectId, ref: 'users',required:true },
    status:{type:Boolean,default:false},
    companyId:{type:Schema.Types.ObjectId,ref: 'company',required:true}
}, { timestamps: true, versionKey: false });

module.exports = MONGOOSE.model('requests', requestSchema);