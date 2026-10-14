import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Quiz from './pages/Quiz';
import AdminDashboard from './pages/AdminDashboard';
import ManageQuestions from './pages/ManageQuestions';

function PrivateRoute({ children, adminOnly = false }) {
  const { user, token } = useSelector((state) => state.auth);
  if (!token) return <Navigate to="/login" />;
  if (adminOnly && !user?.admin) return <Navigate to="/dashboard" />;
  return children;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/dashboard/quiz/:quizId"
        element={
          <PrivateRoute>
            <Quiz />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <PrivateRoute adminOnly>
            <AdminDashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/questions"
        element={
          <PrivateRoute adminOnly>
            <ManageQuestions />
          </PrivateRoute>
        }
      />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;