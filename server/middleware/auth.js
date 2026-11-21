const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
    const token = req.headers.authorization;

    if (!token || !token.startsWith("Bearer ")) {
        return res.status(401).json({
            message: "Access denied. Please login."
        });
    }

    try {
        const verified = jwt.verify(
            token.split(" ")[1],
            process.env.JWT_SECRET
        );

        req.admin = verified;
        next();

    } catch (error) {
        res.status(401).json({
            message: "Invalid or expired token"
        });
    }
};

module.exports = auth;