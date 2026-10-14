const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const jwt = require('jsonwebtoken');
require('dotenv').config();

const User = require('./models/User');
const Question = require('./models/Question');

// Local strategy (dùng cho /users/login)
exports.local = passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Sinh JWT token
exports.getToken = (user) => {
    return jwt.sign(user, process.env.SECRET_KEY, { expiresIn: 3600 });
};

// JWT strategy (dùng để verify token trên các request cần đăng nhập)
const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.SECRET_KEY;

exports.jwtPassport = passport.use(
    new JwtStrategy(opts, async (jwt_payload, done) => {
        try {
            const user = await User.findById(jwt_payload._id);
            return done(null, user || false);
        } catch (err) {
            return done(err, false);
        }
    })
);

// verifyUser: bắt buộc phải đăng nhập (có Bearer token hợp lệ) mới đi tiếp
exports.verifyUser = passport.authenticate('jwt', { session: false });

// verifyAdmin: PHẢI đứng sau verifyUser trong chain middleware
exports.verifyAdmin = (req, res, next) => {
    if (req.user.admin) {
        return next();
    } else {
        const err = new Error('You are not authorized to perform this operation!');
        err.status = 403;
        return next(err);
    }
};

// verifyAuthor: PHẢI đứng sau verifyUser, dùng cho các route /questions/:questionId
exports.verifyAuthor = async (req, res, next) => {
    try {
        const question = await Question.findById(req.params.questionId);
        if (!question) {
            const err = new Error('Question not found');
            err.status = 404;
            return next(err);
        }
        if (question.author && question.author.equals(req.user._id)) {
            return next();
        } else {
            const err = new Error('You are not the author of this question');
            err.status = 403;
            return next(err);
        }
    } catch (err) {
        return next(err);
    }
};