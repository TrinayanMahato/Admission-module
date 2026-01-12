const SuperAdmin = require('../models/superAdminModel');
const AppError = require('../utils/appError');
import {rcetapplicants} from '../Models/rcet candidates.js'
import {Btechapplicants} from '../Models/Btech applicants.js'
import {LLBapplicants} from '../Models/BBA LLB applicants.js'


exports.createSuperAdmin = async (req, res, next) => {
  try {
    // 1. Check if user already exists
    const existingAdmin = await SuperAdmin.findOne({ email: req.body.email });
    if (existingAdmin) {
      return next(new AppError('A user with this email already exists', 400));
    }

    // 2. Create the admin
    // Data is already validated by the middleware before reaching here
    const newAdmin = await SuperAdmin.create(req.body);

    // 3. Send Response
    res.status(201).json({
      status: 'success',
      data: { admin: newAdmin }
    });
  } catch (err) {
    next(err);
  }
};
exports.createpoc = async (req, res, next) => {
  try {
    // 1. Check if user already exists
    const existingAdmin = await SuperAdmin.findOne({ email: req.body.email });
    if (existingAdmin) {
      return next(new AppError('A user with this email already exists', 400));
    }

    // 2. Create the admin
    // Data is already validated by the middleware before reaching here
    const newAdmin = await SuperAdmin.create(req.body);

    // 3. Send Response
    res.status(201).json({
      status: 'success',
      data: { admin: newAdmin }
    });
  } catch (err) {
    next(err);
  }
};
const Admission = require('../models/Admission');

exports.getrcetapplicants = async (req, res) => {
  try {
    // 1. Fetch all documents from the collection
    // .find({}) with no arguments returns every record
    // .sort({ createdAt: -1 }) puts the newest applications at the top
    const allAdmissions = await rcetapplicants.find({}).sort({ createdAt: -1 }).lean();

    // 2. Check if the collection is empty
    if (!allAdmissions || allAdmissions.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No admission records found.",
        count: 0,
        data: []
      });
    }

    // 3. Send the array of documents to the frontend
    res.status(200).json({
      success: true,
      count: allAdmissions.length,
      message: "All admission data extracted successfully",
      data: allAdmissions
    });

  } catch (error) {
    console.error("Extraction Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching all data",
      error: error.message
    });
  }
};

const Admission = require('../models/Admission');

exports.getrcetapplicantsbyid = async (req, res) => {
  try {
    // 1. Extract the ID from the request parameters (e.g., /api/admission/:id)
    const { id } = req.params;

    // 2. Find the document in the database
    // We use .lean() to get a plain JS object which is faster for "read-only" operations
    const admissionData = await rcetapplicants.findById(id).lean();

    // 3. Check if the record exists
    if (!admissionData) {
      return res.status(404).json({
        success: false,
        message: "No admission record found with this ID."
      });
    }

    // 4. Send the complete data back to the frontend
    res.status(200).json({
      success: true,
      message: "Data extracted successfully",
      data: admissionData
    });

  } catch (error) {
    // Handle potential errors (like invalid MongoDB ObjectIDs)
    console.error("Extraction Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching data",
      error: error.message
    });
  }
};
exports.getbtechapplicants = async (req, res) => {
  try {
    // 1. Fetch all documents from the collection
    // .find({}) with no arguments returns every record
    // .sort({ createdAt: -1 }) puts the newest applications at the top
    const allAdmissions = await Btechapplicants.find({}).sort({ createdAt: -1 }).lean();

    // 2. Check if the collection is empty
    if (!allAdmissions || allAdmissions.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No admission records found.",
        count: 0,
        data: []
      });
    }

    // 3. Send the array of documents to the frontend
    res.status(200).json({
      success: true,
      count: allAdmissions.length,
      message: "All admission data extracted successfully",
      data: allAdmissions
    });

  } catch (error) {
    console.error("Extraction Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching all data",
      error: error.message
    });
  }
};
exports.getbtechapplicantsbyid = async (req, res) => {
  try {
    // 1. Extract the ID from the request parameters (e.g., /api/admission/:id)
    const { id } = req.params;

    // 2. Find the document in the database
    // We use .lean() to get a plain JS object which is faster for "read-only" operations
    const admissionData = await Btechapplicants.findById(id).lean();

    // 3. Check if the record exists
    if (!admissionData) {
      return res.status(404).json({
        success: false,
        message: "No admission record found with this ID."
      });
    }

    // 4. Send the complete data back to the frontend
    res.status(200).json({
      success: true,
      message: "Data extracted successfully",
      data: admissionData
    });

  } catch (error) {
    // Handle potential errors (like invalid MongoDB ObjectIDs)
    console.error("Extraction Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching data",
      error: error.message
    });
  }
};
exports.getllbapplicants = async (req, res) => {
  try {
    // 1. Fetch all documents from the collection
    // .find({}) with no arguments returns every record
    // .sort({ createdAt: -1 }) puts the newest applications at the top
    const allAdmissions = await LLBapplicants.find({}).sort({ createdAt: -1 }).lean();

    // 2. Check if the collection is empty
    if (!allAdmissions || allAdmissions.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No admission records found.",
        count: 0,
        data: []
      });
    }

    // 3. Send the array of documents to the frontend
    res.status(200).json({
      success: true,
      count: allAdmissions.length,
      message: "All admission data extracted successfully",
      data: allAdmissions
    });

  } catch (error) {
    console.error("Extraction Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching all data",
      error: error.message
    });
  }
};
exports.getllbapplicantsbyid = async (req, res) => {
  try {
    // 1. Extract the ID from the request parameters (e.g., /api/admission/:id)
    const { id } = req.params;

    // 2. Find the document in the database
    // We use .lean() to get a plain JS object which is faster for "read-only" operations
    const admissionData = await LLBapplicants.findById(id).lean();

    // 3. Check if the record exists
    if (!admissionData) {
      return res.status(404).json({
        success: false,
        message: "No admission record found with this ID."
      });
    }

    // 4. Send the complete data back to the frontend
    res.status(200).json({
      success: true,
      message: "Data extracted successfully",
      data: admissionData
    });

  } catch (error) {
    // Handle potential errors (like invalid MongoDB ObjectIDs)
    console.error("Extraction Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching data",
      error: error.message
    });
  }
};