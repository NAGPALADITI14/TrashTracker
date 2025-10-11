import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthPage = ({ setToken }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [errors, setErrors] = useState({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    let emailError = '';
    let passwordError = '';

    if (!email) {
      emailError = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      emailError = 'Email address is invalid';
    }

    if (!password) {
      passwordError = 'Password is required';
    } else if (password.length < 6) {
      passwordError = 'Password must be at least 6 characters';
    }

    if (emailError || passwordError) {
      setErrors({ email: emailError, password: passwordError });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isValid = validate();
    if (isValid) {
      try {
        const url = isLogin
          ? 'https://trashtrackerbackend.onrender.com/api/login'
          : 'https://trashtrackerbackend.onrender.com/api/register';

        const response = await axios.post(url, { email, password, role });

        if (isLogin) {
          const token = response.data.token;
          localStorage.setItem('token', token);
          setToken(token);
          setIsLoggedIn(true);

          const decodedToken = JSON.parse(atob(token.split('.')[1]));
          const userRole = decodedToken.role;

          if (userRole === 'committee') {
            navigate('/municipal-dashboard');
          } else {
            navigate('/garbage-report');
          }
        } else {
          alert('Registration successful. Please log in.');
          setIsLogin(true);
        }
      } catch (error) {
        setErrors({
          api: `${isLogin ? 'Login' : 'Registration'} failed. Please try again.`,
        });
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-600 to-green-900">
      <div className="w-full max-w-md p-8 bg-white/10 backdrop-blur-md rounded-2xl shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-white">TRASH-TRACKER</h1>
          <p className="text-green-100 mt-1 text-sm">(A citizen powered waste reporting system)</p>
        </div>

        {!isLoggedIn ? (
          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <h2 className="text-xl font-semibold text-white text-center">
              {isLogin ? 'Login' : 'Register'}
            </h2>

            <div>
              <label className="block text-sm font-medium text-green-100 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-white/90 border border-green-200 focus:outline-none focus:ring-2 focus:ring-green-400"
              />
              {errors.email && <span className="text-red-300 text-sm">{errors.email}</span>}
            </div>

            <div>
              <label className="block text-sm font-medium text-green-100 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-white/90 border border-green-200 focus:outline-none focus:ring-2 focus:ring-green-400"
              />
              {errors.password && <span className="text-red-300 text-sm">{errors.password}</span>}
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-green-100 mb-1">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-white/90 border border-green-200 focus:outline-none focus:ring-2 focus:ring-green-400"
                >
                  <option value="user">User</option>
                  <option value="committee">Committee</option>
                </select>
              </div>
            )}

            {errors.api && <span className="text-red-300 text-sm">{errors.api}</span>}

            <button
              type="submit"
              className="w-full py-2 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg transition duration-200"
            >
              {isLogin ? 'Login' : 'Register'}
            </button>
          </form>
        ) : (
          <div className="text-center text-white font-semibold mt-4">Logged In</div>
        )}

        <button
          className="w-full mt-4 text-green-200 hover:text-white transition text-sm underline"
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
        </button>
      </div>
    </div>
  );
};

export default AuthPage;
