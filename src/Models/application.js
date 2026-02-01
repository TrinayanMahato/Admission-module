const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
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
            mobileNo: String,
            income: {
                type: Number,
                default: 0
            }
        },
        mother: {
            firstName: String,
            middleName: String,
            lastName: String,
            email: String,
            mobileNo: String,
            income: {
                type: Number,
                default: 0
            }
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
            scores: {
                maths: Number,
                physics: Number,
                chemistry: Number,
                overall: Number,
                totalScore: Number
            },
            subjects: [{
                subjectName: { type: String },
                marksObtained: { type: Number }
            }],
            overallScore: { type: Number }
        }
    },

    // Step 4: Other Details
    otherDetails: {
        physicalDisability: { type: String, enum: ['Yes', 'No'], default: 'No' },
        chronicAilment: { type: String, default: 'No' },
        academicProbation: { type: String, default: 'No' },
        hostelRequired: { type: String, default: 'No' },
        transportRequired: { type: String, default: 'No' },
        isAlumnus: { type: String, default: 'No' },
        exServicePersonal: { type: String, default: 'No' }
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
        signature: String,
        categoryCertificate: String,
        disabilityCertificate: String
    },

    // NEW: Department and Course References
    departmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        required: true
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },

    // NEW: Application Lifecycle Status
    status: {
        type: String,
        enum: ['draft', 'submitted', 'shortlisted', 'finalized', 'rejected'],
        default: 'draft'
    },

    // NEW: Lifecycle Timestamps
    submittedAt: { type: Date },
    shortlistedAt: { type: Date },
    finalizedAt: { type: Date },
    rejectedAt: { type: Date },

    // Fees
    fees: {
        type: String,
        enum: ['due', 'paid'],
        default: 'due'
    }
}, { timestamps: true });

const Application = mongoose.model('Application', applicationSchema);

module.exports = Application;
