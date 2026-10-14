const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const pick = require('../utils/pick');

// Lỗi không bắt ở đây: Express 5 tự chuyển lên middleware/errorHandler.js

// Chỉ cho sửa các field này. `questions` được quản lý qua các route thêm câu hỏi.
const QUIZ_UPDATABLE_FIELDS = ['title', 'description'];

// GET /quizzes
exports.getAllQuizzes = async (req, res) => {
  const quizzes = await Quiz.find().populate('questions');
  res.status(200).json(quizzes);
};

// GET /quizzes/:quizId
exports.getQuizById = async (req, res) => {
  const quiz = await Quiz.findById(req.params.quizId).populate('questions');
  if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
  res.status(200).json(quiz);
};

// POST /quizzes
exports.createQuiz = async (req, res) => {
  const { title, description } = req.body;
  const newQuiz = new Quiz({ title, description, questions: [] });
  const saved = await newQuiz.save();
  res.status(201).json(saved);
};

// PUT /quizzes/:quizId
exports.updateQuiz = async (req, res) => {
  const changes = pick(req.body, QUIZ_UPDATABLE_FIELDS);
  if (Object.keys(changes).length === 0) {
    return res.status(400).json({
      message: `Nothing to update. Allowed fields: ${QUIZ_UPDATABLE_FIELDS.join(', ')}`
    });
  }
  const updated = await Quiz.findByIdAndUpdate(req.params.quizId, changes, {
    new: true,
    runValidators: true
  });
  if (!updated) return res.status(404).json({ message: 'Quiz not found' });
  res.status(200).json(updated);
};

// DELETE /quizzes/:quizId -> xoá quiz
exports.deleteQuiz = async (req, res) => {
  const deleted = await Quiz.findByIdAndDelete(req.params.quizId);
  if (!deleted) return res.status(404).json({ message: 'Quiz not found' });
  res.status(200).json(deleted);
};

// GET /quizzes/:quizId/populate
exports.getQuizPopulateCapital = async (req, res) => {
  const quiz = await Quiz.findById(req.params.quizId).populate('questions');
  if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

  const keyword = 'capital';
  const matchedQuestions = quiz.questions.filter((q) => {
    const inText = q.text?.toLowerCase().includes(keyword);
    const inKeywords = q.keywords?.some((k) => k.toLowerCase().includes(keyword));
    return inText || inKeywords;
  });

  const result = quiz.toObject();
  result.questions = matchedQuestions;
  res.status(200).json(result);
};

// POST /quizzes/:quizId/question
exports.addQuestionToQuiz = async (req, res) => {
  const quiz = await Quiz.findById(req.params.quizId);
  if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

  const newQuestion = new Question({ ...req.body, author: req.user._id });
  const savedQuestion = await newQuestion.save();

  quiz.questions.push(savedQuestion._id);
  await quiz.save();

  res.status(201).json(savedQuestion);
};

// POST /quizzes/:quizId/question/:questionId -> gắn câu hỏi ĐÃ CÓ vào quiz
// $addToSet: gọi lại nhiều lần cũng không thêm trùng id, và thao tác là atomic.
exports.attachQuestionToQuiz = async (req, res) => {
  const { quizId, questionId } = req.params;

  if (!(await Question.exists({ _id: questionId }))) {
    return res.status(404).json({ message: 'Question not found' });
  }
  const quiz = await Quiz.findByIdAndUpdate(
    quizId,
    { $addToSet: { questions: questionId } },
    { new: true }
  ).populate('questions');
  if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

  res.status(200).json(quiz);
};

// POST /quizzes/:quizId/questions
exports.addManyQuestionsToQuiz = async (req, res) => {
  const quiz = await Quiz.findById(req.params.quizId);
  if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

  if (!Array.isArray(req.body)) {
    return res.status(400).json({ message: 'Body phải là một mảng các câu hỏi (JSON array).' });
  }

  const questionsWithAuthor = req.body.map(q => ({ ...q, author: req.user._id }));
  const savedQuestions = await Question.insertMany(questionsWithAuthor);
  const ids = savedQuestions.map((q) => q._id);

  quiz.questions.push(...ids);
  await quiz.save();

  res.status(200).json({ message: 'Questions added successfully.' });
};