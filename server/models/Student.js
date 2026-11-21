const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    rollNo: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    department: {
        type: String,
        required: true
    },
    year: {
        type: String,
        required: true
    },
    section: {
        type: String,
        default: "A"
    },
    address: {
        type: String,
        default: ""
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("Student", studentSchema);