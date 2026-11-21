const mongoose = require("mongoose");

const markSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    semester: {
        type: String,
        required: true
    },
    internalMarks: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    externalMarks: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    }
}, {
    timestamps: true
});

markSchema.index(
    { studentId: 1, subject: 1, semester: 1 },
    { unique: true }
);

module.exports = mongoose.model("Mark", markSchema);