const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');
const authenticate = require('../authenticate');

router
  .route('/')
  .get(questionController.getAllQuestions)
  .post(authenticate.verifyUser, authenticate.verifyAdmin, questionController.createQuestion);

router
  .route('/:questionId')
  .get(questionController.getQuestionById)
  .put(authenticate.verifyUser, authenticate.verifyAdmin, questionController.updateQuestion)   
  .delete(authenticate.verifyUser, authenticate.verifyAdmin, questionController.deleteQuestion); 

module.exports = router;