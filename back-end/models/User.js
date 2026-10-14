const mongoose = require('mongoose');
const plm = require('passport-local-mongoose');
const passportLocalMongoose = typeof plm === 'function' ? plm : plm.default;

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    admin: {
        type: Boolean,
        default: false
    }
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model('User', userSchema);

User.on('index', (err) => {
    if (err) console.error('[User] Could not build unique index on username:', err.message);
});

module.exports = User;