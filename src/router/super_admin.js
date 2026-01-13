const express = require('express');
const router = express.Router();
import { superAdminValidationSchema } from '../utils/joi/poc';
import { createSuperAdmin } from '../controller/super_admin';
import { createpoc } from '../controller/super_admin';
import { getrcetapplicants } from '../controller/super_admin';
import {getrcetapplicantsbyid} from '../controller/super_admin';
import { getbtechapplicants } from '../controller/super_admin';
import { getbtechapplicantsbyid } from '../controller/super_admin';
import { getllbapplicants } from '../controller/super_admin';
import { getllbapplicantsbyid } from '../controller/super_admin';



import { superAdminValidationSchema } from '../utils/joi/poc.js'

// The validation is passed as the second parameter here
router.post('/signup/superadmin', validate(superAdminValidationSchema), createSuperAdmin);
router.post('/signup/poc', validate(superAdminValidationSchema), createpoc );
router.get('/rcetapplicants', getrcetapplicants );
router.get('/rcetapplicantsbyid',getrcetapplicantsbyid );
router.get('/btechapplicants', getbtechapplicants);
router.get('/btechapplicants', getbtechapplicantsbyid );
router.get('/btechapplicants', getllbapplicants);
router.get('/btechapplicants', getllbapplicantsbyid);
  
  
