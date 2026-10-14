const mongoose = require('mongoose');

let cached = global._mongoose;
if (!cached) cached = global._mongoose = { conn: null, promise: null };

const connectDB = async () => {
    if (cached.conn) return cached.conn;
    if (!cached.promise) {
        cached.promise = mongoose.connect(process.env.MONGO_URI);
    }
    try {
        cached.conn = await cached.promise;
        console.log('MongoDB connected');
    } catch (err) {
        cached.promise = null;
        console.error('Error connecting to MongoDB:', err.message);
        throw err;
    }
    return cached.conn;
};

module.exports = connectDB;