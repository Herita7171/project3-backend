const { sendError } = require("../utils/helper");
const jwt = require('jsonwebtoken');
const User = require('../models/user');

exports.isAuth = async (req, res, next) => {
    const token = req.headers?.authorization;
    if (!token) return sendError(res, "Invalid token!");
    const jwtToken = token.split('Bearer ')[1];
    if (!jwtToken) {
        return sendError(res, "The toke is invalid.");
    }
    const jwtRes = jwt.verify(jwtToken, process.env.JWT_SECRET);
    const {userId} = jwtRes;
    const user = await User.findById(userId);
    if (!user) {
        return sendError(res, "User not found due to invalid token.", 404);
    }
    req.user = user;
    next();
}

exports.isAdmin = (req, res, next) => {
    const { user } = req;
    if (user.role !== "admin") return sendError(res, "unauthorized access!");
    next();
};