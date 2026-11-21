const express = require("express");
const router = express.Router();

const Attendance = require("../models/Attendance");

// Get attendance records
router.get("/", async (req, res) => {
    try {
        const records = await Attendance.find()
            .populate("studentId", "name rollNo department")
            .sort({ date: -1 });

        res.json(records);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Mark or update attendance
router.post("/", async (req, res) => {
    try {
        const { studentId, date, status } = req.body;

        const record = await Attendance.findOneAndUpdate(
            { studentId, date },
            { status },
            {
                new: true,
                upsert: true,
                runValidators: true,
                setDefaultsOnInsert: true
            }
        );

        res.json({
            message: "Attendance saved successfully",
            record
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;