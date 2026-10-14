require('dotenv').config();
const express = require('express');
const passport = require('passport');
const connectDB = require('./config/db');
const cors = require('cors');
require('./authenticate'); // đăng ký local + jwt strategy

const quizRoutes = require('./routes/quizRoutes');
const questionRoutes = require('./routes/questionRoutes');
const userRoutes = require('./routes/userRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

connectDB();
app.use(express.json());
// Express 5 để req.body = undefined khi request không có body JSON.
// Gán {} để mọi controller destructure / đọc field được mà không bị TypeError.
app.use(async (req, res, next) => {
    await connectDB();
    next();
});
app.use(passport.initialize());

app.use(cors());
app.use('/quizzes', quizRoutes);
app.use('/question', questionRoutes);
app.use('/users', userRoutes);

app.get('/', (req, res) => {
    res.send('SimpleQuiz API is running');
});

// 404 cho route không tồn tại, rồi tới error handler tập trung (phải đặt SAU các route)
app.use(notFound);
app.use(errorHandler);

module.exports = app;