const Course = require('../Models/course');
const Department = require('../Models/department');

// Create a new course
exports.createCourse = async (req, res) => {
    try {
        const { name, code, departmentId, duration, totalSeats } = req.body;

        // Verify department exists
        const department = await Department.findById(departmentId);
        if (!department) {
            return res.status(404).json({
                success: false,
                message: 'Department not found'
            });
        }

        // Check if course code already exists
        const existingCourse = await Course.findOne({ code });
        if (existingCourse) {
            return res.status(400).json({
                success: false,
                message: 'Course code already exists'
            });
        }

        const course = await Course.create({
            name,
            code,
            departmentId,
            duration,
            totalSeats
        });

        const populatedCourse = await Course.findById(course._id).populate('departmentId');

        res.status(201).json({
            success: true,
            message: 'Course created successfully',
            data: populatedCourse
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Get all courses
exports.getAllCourses = async (req, res) => {
    try {
        const { isActive } = req.query;
        const filter = isActive !== undefined ? { isActive: isActive === 'true' } : {};

        const courses = await Course.find(filter)
            .populate('departmentId')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: courses.length,
            data: courses
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Get courses by department
exports.getCoursesByDepartment = async (req, res) => {
    try {
        const { deptId } = req.params;
        const { isActive } = req.query;

        const filter = { departmentId: deptId };
        if (isActive !== undefined) {
            filter.isActive = isActive === 'true';
        }

        const courses = await Course.find(filter)
            .populate('departmentId')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: courses.length,
            data: courses
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Get single course
exports.getCourseById = async (req, res) => {
    try {
        const { id } = req.params;
        const course = await Course.findById(id).populate('departmentId');

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        res.status(200).json({
            success: true,
            data: course
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Update course
exports.updateCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Verify department if being updated
        if (updates.departmentId) {
            const department = await Department.findById(updates.departmentId);
            if (!department) {
                return res.status(404).json({
                    success: false,
                    message: 'Department not found'
                });
            }
        }

        // Don't allow code changes if it conflicts
        if (updates.code) {
            const existingCourse = await Course.findOne({
                code: updates.code,
                _id: { $ne: id }
            });
            if (existingCourse) {
                return res.status(400).json({
                    success: false,
                    message: 'Course code already exists'
                });
            }
        }

        const course = await Course.findByIdAndUpdate(
            id,
            updates,
            { new: true, runValidators: true }
        ).populate('departmentId');

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Course updated successfully',
            data: course
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Delete/Deactivate course
exports.deleteCourse = async (req, res) => {
    try {
        const { id } = req.params;

        // Soft delete - just deactivate
        const course = await Course.findByIdAndUpdate(
            id,
            { isActive: false },
            { new: true }
        ).populate('departmentId');

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Course deactivated successfully',
            data: course
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};
