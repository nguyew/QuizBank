import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchQuizzes } from '../store/quizSlice';
import Navbar from '../components/NavBar';

function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list, status } = useSelector((state) => state.quizzes);

  useEffect(() => {
    dispatch(fetchQuizzes());
  }, [dispatch]);

  return (
    <div className="container mt-4">
      <Navbar
        links={{
          title: 'Dashboard',
          items: [
            { to: '/dashboard', label: 'Home' },
            { to: `/dashboard/quiz/${list[0]?._id}`, label: 'Quiz' },
            { to: '/dashboard/article', label: 'Article' }
          ]
        }}
      />
      <h3>Available Quizzes</h3>
      {status === 'loading' && <p>Loading...</p>}
      <div className="list-group">
        {list.map((quiz) => (
          <div key={quiz._id} className="list-group-item d-flex justify-content-between align-items-center">
            <div>
              <strong>{quiz.title}</strong>
              <p className="mb-0 text-muted">{quiz.description}</p>
            </div>
            <button className="btn btn-primary" onClick={() => navigate(`/dashboard/quiz/${quiz._id}`)}>
              Start Quiz
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;