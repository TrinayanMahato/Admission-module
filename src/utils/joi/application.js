const Joi = require('joi');

// Application Submission Validation Schema
const applicationSubmissionSchema = Joi.object({
    // Department and Course
    departmentId: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({
            'string.pattern.base': 'Invalid department ID format',
            'any.required': 'Department ID is required'
        }),

    courseId: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({
            'string.pattern.base': 'Invalid course ID format',
            'any.required': 'Course ID is required'
        }),

    // Student Details
    studentDetails: Joi.object({
        fullName: Joi.string().required().messages({ 'string.empty': 'Full name is required' }),
        mobileNo: Joi.string().pattern(/^[0-9]{10,15}$/).required().messages({ 'string.pattern.base': 'Invalid mobile number' }),
        email: Joi.string().email().required().messages({ 'string.email': 'Invalid email address' }),
        dob: Joi.date().required().messages({ 'date.base': 'Date of birth is required' }),
        gender: Joi.string().valid('MALE', 'FEMALE', 'OTHER').required().messages({ 'any.only': 'Gender must be MALE, FEMALE, or OTHER' }),
        maritalStatus: Joi.string().optional().allow(''),
        religion: Joi.string().optional().allow(''),
        nationality: Joi.string().default('Indian'),
        castCategory: Joi.string().optional().allow(''),
        bloodGroup: Joi.string().optional().allow(''),
        aadharCardNo: Joi.string().optional().allow(''),
        address: Joi.object({
            current: Joi.object({
                street: Joi.string().optional().allow(''),
                state: Joi.string().optional().allow(''),
                district: Joi.string().optional().allow(''),
                pincode: Joi.string().optional().allow('')
            }).optional(),
            permanent: Joi.object({
                street: Joi.string().optional().allow(''),
                state: Joi.string().optional().allow(''),
                district: Joi.string().optional().allow(''),
                pincode: Joi.string().optional().allow('')
            }).optional()
        }).optional()
    }).required(),

    // Family Details
    familyDetails: Joi.object({
        father: Joi.object({
            firstName: Joi.string().optional().allow(''),
            middleName: Joi.string().optional().allow(''),
            lastName: Joi.string().optional().allow(''),
            email: Joi.string().email().optional().allow(''),
            mobileNo: Joi.string().optional().allow(''),
            income: Joi.number().default(0)
        }).optional(),
        mother: Joi.object({
            firstName: Joi.string().optional().allow(''),
            middleName: Joi.string().optional().allow(''),
            lastName: Joi.string().optional().allow(''),
            email: Joi.string().email().optional().allow(''),
            mobileNo: Joi.string().optional().allow(''),
            income: Joi.number().default(0)
        }).optional(),
        spouse: Joi.object({
            firstName: Joi.string().optional().allow(''),
            middleName: Joi.string().optional().allow(''),
            lastName: Joi.string().optional().allow(''),
            email: Joi.string().email().optional().allow(''),
            mobileNo: Joi.string().optional().allow('')
        }).optional()
    }).optional(),

    // Education Details
    educationDetails: Joi.object({
        class10: Joi.object({
            board: Joi.string().optional().allow(''),
            rollNo: Joi.string().optional().allow(''),
            schoolName: Joi.string().optional().allow(''),
            passingYear: Joi.string().optional().allow(''),
            percentage: Joi.number().optional(),
            subjects: Joi.array().items(
                Joi.object({
                    name: Joi.string().optional().allow(''),
                    marksObtained: Joi.number().optional(),
                    maxMarks: Joi.number().optional()
                })
            ).optional()
        }).optional(),
        class12: Joi.object({
            board: Joi.string().optional().allow(''),
            rollNo: Joi.string().optional().allow(''),
            schoolName: Joi.string().optional().allow(''),
            passingYear: Joi.string().optional().allow(''),
            percentage: Joi.number().optional(),
            subjects: Joi.array().items(
                Joi.object({
                    name: Joi.string().optional().allow(''),
                    marksObtained: Joi.number().optional(),
                    maxMarks: Joi.number().optional()
                })
            ).optional()
        }).optional(),
        entranceExam: Joi.object({
            examType: Joi.string().optional().allow(''),
            applicationNo: Joi.string().optional().allow(''),
            scores: Joi.object({
                maths: Joi.number().optional(),
                physics: Joi.number().optional(),
                chemistry: Joi.number().optional(),
                overall: Joi.number().optional(),
                totalScore: Joi.number().optional()
            }).optional(),
            subjects: Joi.array().items(
                Joi.object({
                    subjectName: Joi.string().optional().allow(''),
                    marksObtained: Joi.number().optional()
                })
            ).optional(),
            overallScore: Joi.number().optional()
        }).optional()
    }).optional(),

    // Other Details
    otherDetails: Joi.object({
        physicalDisability: Joi.string().valid('Yes', 'No').default('No'),
        chronicAilment: Joi.string().default('No'),
        academicProbation: Joi.string().default('No'),
        hostelRequired: Joi.string().default('No'),
        transportRequired: Joi.string().default('No'),
        isAlumnus: Joi.string().default('No'),
        exServicePersonal: Joi.string().default('No')
    }).optional(),

    // Extra Curricular
    extraCurricular: Joi.object({
        achievements: Joi.array().items(
            Joi.object({
                eventName: Joi.string().optional().allow(''),
                place: Joi.string().optional().allow(''),
                roleDescription: Joi.string().optional().allow('')
            })
        ).optional(),
        nccParticipant: Joi.string().valid('Yes', 'No').optional(),
        sportsCertificate: Joi.string().valid('Yes', 'No').optional()
    }).optional(),

    // Role field for authentication
    role: Joi.string().valid('user').optional()
});

module.exports = { applicationSubmissionSchema };
