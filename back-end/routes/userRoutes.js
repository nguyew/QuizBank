const express = require('express');
const router = express.Router();
const passport = require('passport');
const userController = require('../controllers/userController');
const authenticate = require('../authenticate');

router.post('/signup', userController.signup);
router.post('/login', passport.authenticate('local', { session: false }), userController.login);

// Task 3: chỉ Admin mới GET được danh sách user
router.get('/', authenticate.verifyUser, authenticate.verifyAdmin, userController.getAllUsers);

module.exports = router;