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
    nationality: { type: String },
    castCategory: { type: String },
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

  // Step 2: Family Details
  familyDetails: {
    father: {
      firstName: String,
      middleName: String,
      lastName: String,
      email: String,
      mobileNo: String
    },
    mother: {
      firstName: String,
      middleName: String,
      lastName: String,
      email: String,
      mobileNo: String
    },
    spouse: {
      firstName: String,
      middleName: String,
      lastName: String,
      email: String,
      mobileNo: String
    }
  },

  // Step 3: Education Details
  educationDetails: {
    class10: {
      board: String,
      rollNo: String,
      schoolName: String,
      passingYear: String,
      percentage: Number,
      subjects: [{ name: String, marksObtained: Number, maxMarks: Number }]
    },
    class12: {
      board: String,
      rollNo: String,
      schoolName: String,
      passingYear: String,
      percentage: Number,
      subjects: [{ name: String, marksObtained: Number, maxMarks: Number }]
    },
    entranceExam: {
      examType: { type: String },
      applicationNo: String,
      // Updated: Array of subjects with names and marks
      subjects: [{
        subjectName: { type: String },
        marksObtained: { type: Number }
      }],
      overallScore: { type: Number }
    }
  },

  // Step 4: Other Details
  otherDetails: {
    chronicAilment: { type: String },
    academicProbation: { type: String },
    hostelRequired: { type: String },
    transportRequired: { type: String },
    isAlumnus: { type: String },
    exServicePersonal: { type: String }
  },

  // Step 5: Extra Curricular
  extraCurricular: {
    achievements: [{
      eventName: String,
      place: String,
      roleDescription: String
    }],
    nccParticipant: { type: String, enum: ['Yes', 'No'] },
    sportsCertificate: { type: String, enum: ['Yes', 'No'] }
  },

  // Step 6: Upload Documents
  documents: {
    marksheet12: String,
    birthCertificate: String,
    leavingCertificate: String,
    aadharCard: String,
    profilePhoto: String,
    signature: String
  },
  fees:{
    type:String,
    enum:['due','paid'],

  },
  course: { type: String, required: true },
  department: { type: String, required: true },

  status: {
    type: String,
    enum: ['Draft', 'Submitted', 'Approved', 'Rejected'],
    default: 'Draft'
  }
}, { timestamps: true });

const sissprcetAdmission = mongoose.model('sissprcetAdmission', admissionSchema);

module.exports = sissprcetAdmission;