const mongoose = require('mongoose');

let connecting = null;

const connectDB = () => {
    if (mongoose.connection.readyState === 1) return Promise.resolve();
    if (!connecting) {
        connecting = mongoose.connect(process.env.MONGO_URI).catch((err) => {
            connecting = null;
            throw err;
        });
    }
    return connecting;
};

module.exports = connectDB;