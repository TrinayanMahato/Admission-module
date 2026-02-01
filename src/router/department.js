const express = require('express');
const router = express.Router();
const {
    createDepartment,
    getAllDepartments,
    getDepartmentById,
    updateDepartment,
    deleteDepartment
} = require('../controller/department_controller');

// Department routes
router.post('/', createDepartment);
router.get('/', getAllDepartments);
router.get('/:id', getDepartmentById);
router.patch('/:id', updateDepartment);
router.delete('/:id', deleteDepartment);

module.exports = router;
