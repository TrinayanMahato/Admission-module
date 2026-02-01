const express = require('express');
const router = express.Router();
const {
    createCourse,
    getAllCourses,
    getCoursesByDepartment,
    getCourseById,
    updateCourse,
    deleteCourse
} = require('../controller/course_controller');

// Course routes
router.post('/', createCourse);
router.get('/', getAllCourses);
router.get('/by-department/:deptId', getCoursesByDepartment);
router.get('/:id', getCourseById);
router.patch('/:id', updateCourse);
router.delete('/:id', deleteCourse);

module.exports = router;
