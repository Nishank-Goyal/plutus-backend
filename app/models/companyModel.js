
"use strict";
/************ Modules **********/
const MONGOOSE = require('mongoose');
const Schema = MONGOOSE.Schema;

/************ user Session Model **********/
const companySchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'users' },
  company: { type: String },
  companyEmail:{type:String,required:true},
  website:{type:String},
  emailVerification:{type:Boolean,default:false},
  addressLine1:{type:String},
  addressLine2:{type:String},
  city:{type:String},
  state:{type:String},
  zipCode:{type:Number},
  country:{type:String},
  addressProofUrl:{type:String},
  lastDateofESOPExcercise:{type:String},
  grantLetterUrl:{type:String},
  latestOptionStatusUrl:{type:String},
  last409orFMVUrl:{type:String},
  panUrl:{type:String},
  AddarUrl:{type:String},
  agreeTerms:{type:Boolean,default:false},
  agreeEmailUpdate:{type:Boolean,default:false},
  companyVerification:{type:Boolean,default:false},
  stockPrice:{type:Number,default:0},
  offerPrice:{type:Number,default:0}
}, { timestamps: true, versionKey: false });

module.exports = MONGOOSE.model('company', companySchema);