const express = require("express");
const router = express.Router();

const Department = require("../models/Department");

// Get departments
router.get("/", async (req, res) => {
    try {
        const departments = await Department.find().sort({ name: 1 });
        res.json(departments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Add department
router.post("/", async (req, res) => {
    try {
        const department = new Department(req.body);
        await department.save();

        res.status(201).json({
            message: "Department added successfully",
            department
        });
    } catch (error) {
        res.status(400).json({
            message: error.code === 11000
                ? "Department name or code already exists"
                : error.message
        });
    }
});

module.exports = router;