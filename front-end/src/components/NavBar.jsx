import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/authSlice';

function Navbar({ links }) {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1>{links.title}</h1>
        <span>Welcome, {user?.username}</span>
      </div>
      <nav className="navbar navbar-expand bg-light rounded mb-4 px-3">
        <div className="navbar-nav">
          {links.items.map((item) => (
            <Link key={item.to} className="nav-link" to={item.to}>
              {item.label}
            </Link>
          ))}
          <button className="nav-link btn btn-link" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>
    </>
  );
}

export default Navbar;