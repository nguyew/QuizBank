const User = require('../models/User');
const authenticate = require('../authenticate');
const crypto = require('crypto');

// So sánh chuỗi theo thời gian không đổi (tránh lộ thông tin qua timing)
const safeEqual = (a, b) => {
    const bufA = Buffer.from(String(a));
    const bufB = Buffer.from(String(b));
    return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);
};

// POST /users/signup
// Lỗi (trùng username, thiếu username/password...) được errorHandler đổi thành 400/409
exports.signup = async (req, res) => {
    const { username, password, admin, adminSecret } = req.body;

    // Muốn tạo tài khoản admin phải gửi kèm mã trùng ADMIN_SECRET trong .env.
    // Kiểm tra TRƯỚC khi tạo user: mã sai thì không tạo gì cả (kể cả tài khoản thường).
    const wantsAdmin = admin === true;
    if (wantsAdmin) {
        if (!process.env.ADMIN_SECRET) {
            return res.status(403).json({ message: 'Admin registration is not enabled on this server' });
        }
        if (!safeEqual(adminSecret ?? '', process.env.ADMIN_SECRET)) {
            return res.status(403).json({ message: 'Invalid admin secret code' });
        }
    }

    await User.register(new User({ username, admin: wantsAdmin }), password);
    res.status(200).json({ success: true, status: 'Registration Successful!' });
};

// POST /users/login
exports.login = (req, res) => {
    const token = authenticate.getToken({ _id: req.user._id });
    res.status(200).json({
        success: true,
        token,
        user: {
            _id: req.user._id,
            username: req.user.username,
            admin: req.user.admin
        },
        status: 'You are successfully logged in!'
    });
};

// GET /users - chỉ Admin
exports.getAllUsers = async (req, res) => {
    const users = await User.find();
    res.status(200).json(users);
};