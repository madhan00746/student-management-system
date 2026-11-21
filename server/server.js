const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const Admin = require("./models/Admin");
const auth = require("./middleware/auth");

const app = express();

app.use(cors());
app.use(express.json());

// Database connection
mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log("MongoDB connected successfully");

        // Create default admin if not already present
        const existingAdmin = await Admin.findOne({
            email: process.env.ADMIN_EMAIL
        });

        if (!existingAdmin) {
            const hashedPassword = await bcrypt.hash(
                process.env.ADMIN_PASSWORD,
                10
            );

            await Admin.create({
                name: process.env.ADMIN_NAME,
                email: process.env.ADMIN_EMAIL,
                password: hashedPassword
            });

            console.log("Default admin created");
        }
    })
    .catch(error => {
        console.log("Database error:", error.message);
    });

// Public login route
app.use("/api/auth", require("./routes/authRoutes"));

// Protected routes
app.use("/api/students", auth, require("./routes/studentRoutes"));
app.use("/api/attendance", auth, require("./routes/attendanceRoutes"));
app.use("/api/marks", auth, require("./routes/markRoutes"));
app.use("/api/departments", auth, require("./routes/departmentRoutes"));

// Dashboard statistics
app.get("/api/dashboard", auth, async (req, res) => {
    try {
        const Student = require("./models/Student");
        const Attendance = require("./models/Attendance");
        const Mark = require("./models/Mark");
        const Department = require("./models/Department");

        const today = new Date().toLocaleDateString("en-CA");

        const totalStudents = await Student.countDocuments();
        const totalDepartments = await Department.countDocuments();

        const present = await Attendance.countDocuments({
            date: today,
            status: "Present"
        });

        const absent = await Attendance.countDocuments({
            date: today,
            status: "Absent"
        });

        const totalMarks = await Mark.countDocuments();

        res.json({
            totalStudents,
            totalDepartments,
            present,
            absent,
            totalMarks
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Home route
app.get("/", (req, res) => {
    res.send("Student Management System API is running");
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});