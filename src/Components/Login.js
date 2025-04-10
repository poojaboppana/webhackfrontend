import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import './Navbar.css'; // Make sure you have Navbar.css in the same directory
import { Link } from 'react-router-dom';
const Login = () => {
  const [regNumber, setRegNumber] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ regNumber, password, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify({
        regNumber,
        role,
        ...(role === 'student' ? data.student : data.admin)
      }));

      alert(data.message);

      // Redirect based on role
      if (role === 'student') {
        navigate('/student-dashboard');
      } else if (role === 'admin') {
        navigate('/admin-dashboard');
      }
    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  };

  return (
    <div className="login-container">
         <nav className="navbar">
      <div className="logo">CodeTracker</div>
      <ul className="nav-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/login">Login</Link></li>
        <li><Link to="/register">Register</Link></li>
        <li><Link to="/about">About</Link></li>
        <li><Link to="/contact">Contact</Link></li>
      </ul>
    </nav>
      <div className="container">
        <div className="left-panel">
          <div className="content-wrapper">
            <h2>Welcome Back to</h2>
            <h1>Coding Profile Tracker</h1>
            <p>Track your coding journey with us. Stay competitive, stay ahead!</p>
            <div className="animated-icons">
              <div className="icon leetcode"></div>
              <div className="icon codechef"></div>
              <div className="icon hackerrank"></div>
            </div>
          </div>
        </div>

        <div className="right-panel">
          <h2>Login to your account</h2>
          <form className="form" onSubmit={handleSubmit}>
            {error && <div className="error-message">{error}</div>}

            <input
              type="text"
              placeholder="Enter your username"
              value={regNumber}
              onChange={(e) => setRegNumber(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <select value={role} onChange={(e) => setRole(e.target.value)} required>
              <option value="">Select Role</option>
              <option value="admin">Admin</option>
              <option value="student">Student</option>
            </select>

            <div className="actions">
              <button
                type="submit"
                className={`signup ${loading ? 'submitting' : ''}`}
                disabled={loading}
              >
                {loading ? 'Logging In...' : 'Log In'}
              </button>
            </div>

            <p className='login-reg'>
              Don't have an Account? <a href='/register'>Register</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
