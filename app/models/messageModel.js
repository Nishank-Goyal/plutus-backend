
"use strict";
/************ Modules **********/
const MONGOOSE = require('mongoose');
const Schema = MONGOOSE.Schema;

/************ user Session Model **********/
const messageSchema = new Schema({
    chatId: { type: Schema.Types.ObjectId, ref: 'requests',required:true },
    message: { type: String,required:true },
    senderId: { type: Schema.Types.ObjectId, ref: 'users',required:true },
    reciverId: { type: Schema.Types.ObjectId, ref: 'users',required:true }
}, { timestamps: true, versionKey: false });

module.exports = MONGOOSE.model('message', messageSchema);