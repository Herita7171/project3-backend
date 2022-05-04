const User = require('../models/user');
const jwt = require('jsonwebtoken');
const { sendError } = require('../utils/helper');

exports.create = async (req, res) => {
    const {name, email, password} = req.body;
    const oldUser = await User.findOne({email});
    if (oldUser) {
        return sendError(res, "This email already exists.");
    }
    const newUser = new User({name, email, password});
    await newUser.save();
    res.status(201).json({user: {
            id: newUser._id,
            name: newUser.name,
            email: newUser.email,
        },
    });
};

exports.signIn = async (req, res) => {
    const {email, password} = req.body;
    const user = await User.findOne({email});
    if (!user) {
        return sendError(res, "Your email/password does not match.");
    }

    const matched = await user.comparePassword(password);
    if (!matched) {
        return sendError(res, "Your email/password does not match.");
    }

    const {_id, name, role} = user;
    const jwtToken = jwt.sign({userId: _id}, process.env.JWT_SECRET);
    res.json({user: {id: _id, name, email, role, token: jwtToken}});

}