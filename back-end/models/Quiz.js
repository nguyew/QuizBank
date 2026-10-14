const mongoose = require('mongoose');
const { Schema } = mongoose;

const quizSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: '',
    },
    questions: [{
        type: Schema.Types.ObjectId,
        ref: 'Question'
    }],
});

module.exports = mongoose.model('Quiz', quizSchema);