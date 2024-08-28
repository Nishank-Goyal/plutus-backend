
"use strict";
/************ Modules **********/
const MONGOOSE = require('mongoose');
const Schema = MONGOOSE.Schema;

/************ user Session Model **********/
const companySchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'users',required:true },
    panUrl: { type: String, required: true },
    idProofUrl: { type: String, required: true },
    addressUrl: { type: String, required: true },
    bankAccountUrl: { type: String, required: true },
    incomeUrl: { type: String, required: true },
    subscription:{type:String,required:true}
}, { timestamps: true, versionKey: false });

module.exports = MONGOOSE.model('investor', companySchema);