import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    alert('Logged out successfully!');
    navigate('/login');
  };

  return (
    <nav className="bg-blue-600 p-4 shadow-md text-white">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold tracking-wider">
          HotelPro
        </Link>
        
        <div className="space-x-6 font-medium flex items-center">
          {userInfo ? (
            <>
            <Link to="/admin" className="hover:text-gray-200 transition">Admin Panel</Link>
              <Link to="/my-bookings" className="hover:text-gray-200 transition">My Bookings</Link>
              <span className="text-gray-100 font-semibold">Hello, {userInfo.name || 'User'}</span>
              <button 
                onClick={handleLogout} 
                className="bg-red-500 text-white px-4 py-2 rounded shadow hover:bg-red-600 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-gray-200 transition">Login</Link>
              <Link to="/register" className="bg-white text-blue-600 px-4 py-2 rounded shadow hover:bg-gray-100 transition">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;