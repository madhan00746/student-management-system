const express = require("express");
const router = express.Router();

const Student = require("../models/Student");

// Get all students
router.get("/", async (req, res) => {
    try {
        const students = await Student.find().sort({ createdAt: -1 });
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Add student
router.post("/", async (req, res) => {
    try {
        const student = new Student(req.body);
        await student.save();

        res.status(201).json({
            message: "Student added successfully",
            student
        });
    } catch (error) {
        res.status(400).json({
            message: error.code === 11000
                ? "Roll number already exists"
                : error.message
        });
    }
});

// Update student
router.put("/:id", async (req, res) => {
    try {
        const student = await Student.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!student) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        res.json({
            message: "Student updated successfully",
            student
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete student
router.delete("/:id", async (req, res) => {
    try {
        const student = await Student.findByIdAndDelete(req.params.id);

        if (!student) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        res.json({ message: "Student deleted successfully" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;