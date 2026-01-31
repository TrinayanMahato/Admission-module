const mongoose = require('mongoose');

const pocSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: 'poc'
  },
  department: {
    type: String,
    required: true,
    enum: ['saset', 'sbsfi', 'sclml', 'sicmss', 'sicssl', 'sissp', 'sitaics', 'spes', 'spicsm']
  }
}, { timestamps: true });

const POC = mongoose.model('POC', pocSchema);

module.exports = POC;