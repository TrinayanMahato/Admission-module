const { required } = require('joi');
const mongoose = require('mongoose');

const tempuserSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  code:{
    type:number,
    required:true,

  },
  confirmPassword: {
    type: String,
    required: true
  }
});

const tempUser = mongoose.model('User', tempuserSchema);

module.exports = tempUser;