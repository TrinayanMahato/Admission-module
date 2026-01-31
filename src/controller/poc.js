// src/controller/poc.js
const RCET_applicants = require('../Models/rcet candidates.js');
const BBA_LLB_applicants = require('../Models/BBA LLB applicants.js');
const Btech_applicants = require('../Models/Btech applicants.js');
const SuperAdmin = require('../Models/super_admin.js');
const User = require('../Models/user.js');
const TempUser = require('../Models/temp users.js');
const POC = require('../Models/poc.js');

// Import models from subdirectories with correct file paths and model names
const SASET = {
  finalList: require('../Models/saset/saset_final_list'),
  shortList: require('../Models/saset/saset_short_list')
};

const SBSFI = {
  finalList: require('../Models/sbsfi/sbsfi_final_list'),
  shortList: require('../Models/sbsfi/sbsfi_short_list')
};

const SCLML = {
  finalList: require('../Models/sclml/sclml_final_list'),
  shortList: require('../Models/sclml/sclml_short_list')
};

const SICMSS = {
  finalList: require('../Models/sicmss/sicmss_final_list'),
  shortList: require('../Models/sicmss/sicmss_short_list')
};

const SICSSL = {
  finalList: require('../Models/sicssl/sicssl_final_list'),
  shortList: require('../Models/sicssl/sicssl_short_list')
};

const SISDSS = {
  finalList: require('../Models/sisdss/sisdss_final_list'),
  shortList: require('../Models/sisdss/sisdss_short_list')
};

const SISSP = {
  finalList: require('../Models/sissp/sissp_final_list'),
  shortList: require('../Models/sissp/sissp_shortlist')
};

const SITAICS = {
  finalList: require('../Models/sitaics/sitaics_final_list'),
  shortList: require('../Models/sitaics/sitaics_short_list')
};

const SPES = {
  finalList: require('../Models/spes/spes_final_list'),
  shortList: require('../Models/spes/spes_short_list')
};

const SPICSM = {
  finalList: require('../Models/spicsm/spicsm_final_list'),
  shortList: require('../Models/spicsm/spicsm_short_list')
};

// Get all applications by department
exports.getApplicationsByDepartment = async (req, res) => {
  try {
    const { department } = req.query;
    
    if (!department) {
      return res.status(400).json({ 
        success: false, 
        message: "Department parameter is required" 
      });
    }

    let applications = [];

    // Search based on department type
    if (department.toLowerCase() === 'btech') {
      applications = await Btech_applicants.find({}).sort({ createdAt: -1 }).lean();
    } else if (department.toLowerCase() === 'llb') {
      applications = await BBA_LLB_applicants.find({}).sort({ createdAt: -1 }).lean();
    } else {
      // For other departments, search in RCET_applicants with department filter
      applications = await RCET_applicants.find({ department }).sort({ createdAt: -1 }).lean();
    }
    
    res.status(200).json({ 
      success: true, 
      count: applications.length, 
      data: applications 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};



// Get shortlisted applications by department
exports.getShortlistedByDepartment = async (req, res) => {
  try {
    const { department } = req.query;
    
    if (!department) {
      return res.status(400).json({ 
        success: false, 
        message: "Department parameter is required" 
      });
    }

    let shortlisted = [];
    const deptLower = department.toLowerCase();

    // Map of department names to their corresponding shortList models
    const departmentModels = {
      'saset': SASET.shortList,
      'sbsfi': SBSFI.shortList,
      'sclml': SCLML.shortList,
      'sicmss': SICMSS.shortList,
      'sicssl': SICSSL.shortList,
      'sissp': SISSP.shortList,
      'sitaics': SITAICS.shortList,
      'spes': SPES.shortList,
      'spicsm': SPICSM.shortList
    };

    // Get the model for the specified department
    const model = departmentModels[deptLower];
    if (!model) {
      return res.status(404).json({ 
        success: false, 
        message: `No shortlist found for department: ${department}` 
      });
    }
    
    // Find all documents in the department's shortlist
    shortlisted = await model.find({}).sort({ createdAt: -1 }).lean();
    
    res.status(200).json({ 
      success: true, 
      count: shortlisted.length, 
      data: shortlisted 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Get final list by department
exports.getFinalListByDepartment = async (req, res) => {
  try {
    const { department } = req.query;
    
    if (!department) {
      return res.status(400).json({ 
        success: false, 
        message: "Department parameter is required" 
      });
    }

    let finalList = [];
    const deptLower = department.toLowerCase();

    // Map of department names to their corresponding finalList models
    const departmentModels = {
      'saset': SASET.finalList,
      'sbsfi': SBSFI.finalList,
      'sclml': SCLML.finalList,
      'sicmss': SICMSS.finalList,
      'sicssl': SICSSL.finalList,
      'sissp': SISSP.finalList,
      'sitaics': SITAICS.finalList,
      'spes': SPES.finalList,
      'spicsm': SPICSM.finalList
    };

    // Get the model for the specified department
    const model = departmentModels[deptLower];
    if (!model) {
      return res.status(404).json({ 
        success: false, 
        message: `No final list found for department: ${department}` 
      });
    }
    
    // Find all documents in the department's final list
    finalList = await model.find({}).sort({ createdAt: -1 }).lean();
    
    res.status(200).json({ 
      success: true, 
      count: finalList.length, 
      data: finalList 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};