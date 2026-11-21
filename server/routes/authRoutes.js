const express = require("express");
const router = express.Router();

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const admin = await Admin.findOne({ email });

        if (!admin) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const validPassword = await bcrypt.compare(
            password,
            admin.password
        );

        if (!validPassword) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            { id: admin._id, email: admin.email },
            process.env.JWT_SECRET,
            { expiresIn: "8h" }
        );

        res.json({
            message: "Login successful",
            token,
            admin: {
                name: admin.name,
                email: admin.email
            }
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

module.exports = router;