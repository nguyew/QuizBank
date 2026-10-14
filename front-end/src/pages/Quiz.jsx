import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { fetchQuizById, clearCurrentQuiz } from '../store/quizSlice';
import Navbar from '../components/NavBar';

function Quiz() {
  const { quizId } = useParams();
  const dispatch = useDispatch();
  const { current, status } = useSelector((state) => state.quizzes);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (quizId) dispatch(fetchQuizById(quizId));
    return () => dispatch(clearCurrentQuiz());
  }, [dispatch, quizId]);

  if (status === 'loading' || !current) {
    return <div className="container mt-4">Loading quiz...</div>;
  }

  const questions = current.questions || [];
  const question = questions[currentIndex];

  const handleSubmitAnswer = () => {
    if (selectedOption === question.correctAnswerIndex) {
      setScore((s) => s + 1);
    }
    setSelectedOption(null);
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((i) => i + 1);
    } else {
      setFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setScore(0);
    setFinished(false);
    setSelectedOption(null);
  };

  return (
    <div className="container mt-4">
      <Navbar
        links={{
          title: 'Dashboard',
          items: [
            { to: '/dashboard', label: 'Home' },
            { to: `/dashboard/quiz/${quizId}`, label: 'Quiz' },
            { to: '/dashboard/article', label: 'Article' }
          ]
        }}
      />

      {!finished ? (
        <div className="text-center">
          <h2>Quiz</h2>
          {question ? (
            <>
              <h4 className="mt-4">{question.text}</h4>
              <div className="d-inline-block text-start mt-3">
                {question.options.map((opt, idx) => (
                  <div className="form-check" key={idx}>
                    <input
                      className="form-check-input"
                      type="radio"
                      name="option"
                      id={`option-${idx}`}
                      checked={selectedOption === idx}
                      onChange={() => setSelectedOption(idx)}
                    />
                    <label className="form-check-label" htmlFor={`option-${idx}`}>
                      {opt}
                    </label>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <button
                  className="btn btn-primary"
                  disabled={selectedOption === null}
                  onClick={handleSubmitAnswer}
                >
                  Submit Answer
                </button>
              </div>
            </>
          ) : (
            <p>This quiz has no questions yet.</p>
          )}
        </div>
      ) : (
        <div className="text-center">
          <h2>Quiz Completed</h2>
          <p>Your score: {score}</p>
          <button className="btn btn-primary" onClick={handleRestart}>
            Restart Quiz
          </button>
        </div>
      )}
    </div>
  );
}

export default Quiz;