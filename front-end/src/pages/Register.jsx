import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../store/authSlice';

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminSecret, setAdminSecret] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(
      register({ username, password, admin: isAdmin, adminSecret: isAdmin ? adminSecret : undefined })
    );
    if (register.fulfilled.match(result)) {
      navigate('/login');
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <div className="card p-4" style={{ width: '360px' }}>
        <h2 className="text-center mb-4">Register</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Username</label>
            <input
              type="text"
              className="form-control"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-check mb-3">
            <input
              type="checkbox"
              className="form-check-input"
              id="registerAsAdmin"
              checked={isAdmin}
              onChange={(e) => setIsAdmin(e.target.checked)}
            />
            <label className="form-check-label" htmlFor="registerAsAdmin">
              Register as Admin
            </label>
          </div>
          {isAdmin && (
            <div className="mb-3">
              <label className="form-label" htmlFor="adminSecret">Admin secret code</label>
              <input
                id="adminSecret"
                type="password"
                className="form-control"
                value={adminSecret}
                onChange={(e) => setAdminSecret(e.target.value)}
                required
              />
            </div>
          )}
          <button type="submit" className="btn btn-primary w-100" disabled={status === 'loading'}>
            Register
          </button>
        </form>
        <p className="text-center mt-3 mb-0">
          <Link to="/login">Already have an account? Login here</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;