import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post('http://localhost:5000/api/users/login', { email, password });
      
      // Token aur user info ko localStorage mein save kar lo taaki baad mein kaam aaye
      localStorage.setItem('userInfo', JSON.stringify(data));
      
      alert('Login Successful!');
      navigate('/'); // Home page par bhej do
    } catch (error) {
      alert(error.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="flex justify-center items-center h-[80vh]">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-lg shadow-md w-96 border border-gray-200">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Login</h2>
        
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} 
          className="w-full mb-4 p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} 
          className="w-full mb-6 p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          
        <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded font-bold hover:bg-blue-700 transition">
          Sign In
        </button>
      </form>
    </div>
  );
};

export default Login;