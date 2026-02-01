const Department = require('../Models/department');

// Create a new department
exports.createDepartment = async (req, res) => {
    try {
        const { name, code, description } = req.body;

        // Check if department code already exists
        const existingDept = await Department.findOne({ code });
        if (existingDept) {
            return res.status(400).json({
                success: false,
                message: 'Department code already exists'
            });
        }

        const department = await Department.create({
            name,
            code,
            description
        });

        res.status(201).json({
            success: true,
            message: 'Department created successfully',
            data: department
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Get all departments
exports.getAllDepartments = async (req, res) => {
    try {
        const { isActive } = req.query;
        const filter = isActive !== undefined ? { isActive: isActive === 'true' } : {};

        const departments = await Department.find(filter).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: departments.length,
            data: departments
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Get single department
exports.getDepartmentById = async (req, res) => {
    try {
        const { id } = req.params;
        const department = await Department.findById(id);

        if (!department) {
            return res.status(404).json({
                success: false,
                message: 'Department not found'
            });
        }

        res.status(200).json({
            success: true,
            data: department
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Update department
exports.updateDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Don't allow code changes if it conflicts with another department
        if (updates.code) {
            const existingDept = await Department.findOne({
                code: updates.code,
                _id: { $ne: id }
            });
            if (existingDept) {
                return res.status(400).json({
                    success: false,
                    message: 'Department code already exists'
                });
            }
        }

        const department = await Department.findByIdAndUpdate(
            id,
            updates,
            { new: true, runValidators: true }
        );

        if (!department) {
            return res.status(404).json({
                success: false,
                message: 'Department not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Department updated successfully',
            data: department
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Delete/Deactivate department
exports.deleteDepartment = async (req, res) => {
    try {
        const { id } = req.params;

        // Soft delete - just deactivate
        const department = await Department.findByIdAndUpdate(
            id,
            { isActive: false },
            { new: true }
        );

        if (!department) {
            return res.status(404).json({
                success: false,
                message: 'Department not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Department deactivated successfully',
            data: department
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};
