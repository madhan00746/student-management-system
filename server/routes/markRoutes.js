const express = require("express");
const router = express.Router();

const Mark = require("../models/Mark");

// Get all marks
router.get("/", async (req, res) => {
    try {
        const marks = await Mark.find()
            .populate("studentId", "name rollNo");

        res.json(marks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Add or update marks
router.post("/", async (req, res) => {
    try {
        const {
            studentId,
            subject,
            semester,
            internalMarks,
            externalMarks
        } = req.body;

        const mark = await Mark.findOneAndUpdate(
            { studentId, subject, semester },
            { internalMarks, externalMarks },
            {
                new: true,
                upsert: true,
                runValidators: true
            }
        );

        res.json({
            message: "Marks saved successfully",
            mark
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;