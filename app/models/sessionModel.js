
"use strict";
/************ Modules **********/
const MONGOOSE = require('mongoose');
const Schema = MONGOOSE.Schema;
const { TOKEN_TYPES, USER_TYPES, DEVICE_TYPES } = require("../utils/constants");

/************ user Session Model **********/
const sessionSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'users' },
  token: { type: String },
}, { timestamps: true, versionKey: false });

module.exports = MONGOOSE.model('sessions', sessionSchema);