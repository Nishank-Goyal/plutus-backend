"use strict";
/************* Modules ***********/
const { USER_TYPES, GENDER_TYPES } = require("../utils/constants");
const MONGOOSE = require("mongoose");
const Schema = MONGOOSE.Schema;

/**************************************************
 ************* User Model or collection ***********
 **************************************************/
const userSchema = new Schema(
    {
        email: { type: String ,required:true,unique:true},
        firstName: { type: String },
        lastName: { type: String },
        userType: { type: Number, enum: [USER_TYPES.ADMIN,USER_TYPES.USER ],default:USER_TYPES.USER },
        country: { type: String,default:'india' },
        password: { type: String },
        isDeleted:{type:Boolean,default:false},
        isVerify:{type:Boolean,default:false},
        friends:[{ type: Schema.Types.ObjectId, ref: "users" }]
    },
    { versionKey: false, timestamps: true,collection: 'users' }
);

module.exports = MONGOOSE.model("users", userSchema);

