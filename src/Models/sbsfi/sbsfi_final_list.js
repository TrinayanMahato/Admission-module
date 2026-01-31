const mongoose = require('mongoose');

const admissionSchema = new mongoose.Schema({
  // Step 1: Student Details
  studentDetails: {
    fullName: { type: String, required: true },
    mobileNo: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    dob: { type: Date, required: true },
    gender: { type: String, enum: ['MALE', 'FEMALE', 'OTHER'], required: true },
    maritalStatus: { type: String },
    religion: { type: String },
    nationality: { type: String, default: 'Indian' },
    castCategory: { type: String },
    physicalDisability: { type: String, enum: ['Yes', 'No'], default: 'No' },
    bloodGroup: { type: String },
    aadharCardNo: { type: String },
    address: {
      current: {
        street: String,
        state: String,
        district: String,
        pincode: String
      },
      permanent: {
        street: String,
        state: String,
        district: String,
        pincode: String
      }
    }
  },

  // Family Details with Income
  familyDetails: {
    father: {
      fullName: { type: String },
      occupation: { type: String },
      income: {
        type: Number,
        default: 0
      },
      mobileNo: { type: String },
      email: { type: String }
    },
    mother: {
      fullName: { type: String },
      occupation: { type: String },
      income: {
        type: Number,
        default: 0
      },
      mobileNo: { type: String },
      email: { type: String }
    }
  },
  // Step 2: Academic Details
  academicDetails: {
    tenth: {
      board: { type: String, required: true },
      school: { type: String, required: true },
      passingYear: { type: Number, required: true },
      percentage: { type: Number, required: true },
      marksheet: { type: String }
    },
    twelfth: {
      board: { type: String, required: true },
      school: { type: String, required: true },
      passingYear: { type: Number, required: true },
      percentage: { type: Number, required: true },
      marksheet: { type: String }
    },
    graduation: {
      university: { type: String },
      college: { type: String },
      passingYear: { type: Number },
      percentage: { type: Number },
      marksheet: { type: String }
    },
    entranceExam: {
      name: { type: String, required: true },
      rollNo: { type: String, required: true },
      rank: { type: Number, required: true },
      score: { type: Number, required: true },
      marksheet: { type: String }
    }
  },
  // Step 3: Course & Department Selection
  courseDetails: {
    course: { type: String, required: true },
    department: { type: String, required: true },
    specialization: { type: String },
    academicYear: { type: String, required: true }
  },
  // Step 4: Documents Upload
  documents: {
    photo: { type: String, required: true },
    signature: { type: String, required: true },
    aadharCard: { type: String, required: true },
    tenthMarksheet: { type: String, required: true },
    twelfthMarksheet: { type: String, required: true },
    graduationMarksheet: { type: String },
    transferCertificate: { type: String, required: true },
    migrationCertificate: { type: String },
    casteCertificate: { type: String },
    incomeCertificate: { type: String },
    disabilityCertificate: { type: String }
  },
  // Step 5: Payment Details
  paymentDetails: {
    transactionId: { type: String, required: true },
    amount: { type: Number, required: true },
    paymentDate: { type: Date, required: true },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Completed', 'Failed'],
      default: 'Pending'
    },
    receipt: { type: String }
  },
  // Additional Fields
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },

  // For tracking
  course: { type: String, required: true },
  department: { type: String, required: true },

  status: {
    type: String,
    enum: ['Draft', 'Submitted', 'Approved', 'Rejected'],
    default: 'Draft'
  }
}, { timestamps: true });

const SBSFIFinalList = mongoose.model('SBSFIFinalList', admissionSchema);

module.exports = SBSFIFinalList;