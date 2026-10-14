const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const authenticate = require('../authenticate');


router
    .route('/')
    .get(quizController.getAllQuizzes)
    .post(authenticate.verifyUser, authenticate.verifyAdmin, quizController.createQuiz);

router.get('/:quizId/populate', quizController.getQuizPopulateCapital);
router.post('/:quizId/question', authenticate.verifyUser, authenticate.verifyAdmin, quizController.addQuestionToQuiz);
router.post('/:quizId/questions', authenticate.verifyUser, authenticate.verifyAdmin, quizController.addManyQuestionsToQuiz);
router.post('/:quizId/question/:questionId', authenticate.verifyUser, authenticate.verifyAdmin, quizController.attachQuestionToQuiz);

router
    .route('/:quizId')
    .get(quizController.getQuizById)
    .put(authenticate.verifyUser, authenticate.verifyAdmin, quizController.updateQuiz)
    .delete(authenticate.verifyUser, authenticate.verifyAdmin, quizController.deleteQuiz);

module.exports = router;