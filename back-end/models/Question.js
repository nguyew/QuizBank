const mongoose = require('mongoose');
const {Schema} = mongoose;

const questionSchema = new Schema({
    text: {
        type: String,
        required: true,
        trim: true
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    options: {
        type: [String],
        default: [],
        validate: [
            {
                validator: (v) => v.length >= 2,
                message: 'A question needs at least 2 options'
            },
            {
                validator: (v) => v.every((o) => typeof o === 'string' && o.trim() !== ''),
                message: 'Options must not be empty'
            }
        ]
    },
    keywords: {
        type: [String],
        default: []
    },
    correctAnswerIndex: {
        type: Number,
        required: true,
        validate: [
            {
                validator: Number.isInteger,
                message: 'correctAnswerIndex must be an integer'
            },
            {
                // dùng function thường (không phải arrow) để có `this` = document
                validator: function (v) {
                    return v >= 0 && v < this.options.length;
                },
                message: 'correctAnswerIndex must point to one of the options'
            }
        ]
    },
});

module.exports = mongoose.model('Question', questionSchema);