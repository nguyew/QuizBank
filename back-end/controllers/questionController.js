const Question = require('../models/Question');
const Quiz = require('../models/Quiz');
const pick = require('../utils/pick');

// Lỗi không bắt ở đây: Express 5 tự chuyển lên middleware/errorHandler.js

// Chỉ cho sửa các field này (không cho đổi author, _id...).
const QUESTION_UPDATABLE_FIELDS = ['text', 'options', 'keywords', 'correctAnswerIndex'];

exports.getAllQuestions = async (req, res) => {
  const questions = await Question.find();
  res.status(200).json(questions);
};

exports.getQuestionById = async (req, res) => {
  const question = await Question.findById(req.params.questionId);
  if (!question) return res.status(404).json({ message: 'Question not found' });
  res.status(200).json(question);
};

// Task: bất kỳ user đã login đều được submit câu hỏi, author = chính họ
exports.createQuestion = async (req, res) => {
  const newQuestion = new Question({ ...req.body, author: req.user._id });
  const saved = await newQuestion.save();
  res.status(201).json(saved);
};

// PUT /question/:questionId (chỉ admin - chặn ở route bằng verifyAdmin)
exports.updateQuestion = async (req, res) => {
  const changes = pick(req.body, QUESTION_UPDATABLE_FIELDS);
  if (Object.keys(changes).length === 0) {
    return res.status(400).json({
      message: `Nothing to update. Allowed fields: ${QUESTION_UPDATABLE_FIELDS.join(', ')}`
    });
  }
  // Nạp document rồi save() thay vì findByIdAndUpdate: validator của
  // correctAnswerIndex cần so với options, mà update-query không có document.
  const question = await Question.findById(req.params.questionId);
  if (!question) return res.status(404).json({ message: 'Question not found' });
  question.set(changes);
  const updated = await question.save();
  res.status(200).json(updated);
};

// DELETE /question/:questionId (chỉ admin - chặn ở route bằng verifyAdmin)
exports.deleteQuestion = async (req, res) => {
  const deleted = await Question.findByIdAndDelete(req.params.questionId);
  if (!deleted) return res.status(404).json({ message: 'Question not found' });
  // Gỡ id câu hỏi khỏi mọi quiz đang chứa nó, tránh để lại id "mồ côi"
  await Quiz.updateMany({ questions: deleted._id }, { $pull: { questions: deleted._id } });
  res.status(200).json(deleted);
};