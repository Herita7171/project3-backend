const express = require('express');
const { create, signIn } = require('../controllers/user');
const { userCheck, validate, signInValidator} = require('../middlewares/validator');
const { sendError } = require('../utils/helper');
const { isAuth } = require('../middlewares/auth');

const router = express.Router();

router.post('/create', userCheck, validate, create);
router.post('/sign-in', signInValidator, validate, signIn);

router.get('/is-auth', isAuth, (req, res) => {
    const {user} = req;
    res.json({user: {id: user._id, name: user.name, email: user.email, role: user.role}});
});

module.exports = router;