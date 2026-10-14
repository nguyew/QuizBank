import Navbar from '../components/NavBar';

function AdminDashboard() {
  return (
    <div className="container mt-4">
      <Navbar
        links={{
          title: 'Admin Dashboard',
          items: [
            { to: '/admin', label: 'Home' },
            { to: '/admin/questions', label: 'Manage Questions' },
            { to: '/admin/articles', label: 'Manage Articles' }
          ]
        }}
      />
    </div>
  );
}

export default AdminDashboard;