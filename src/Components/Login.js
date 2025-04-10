import React, { useState } from 'react';
import './Login.css';

const Login = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
    }, 2000);
  };

  return (
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
          <input type="text" placeholder="Enter your username" required />
          <input type="password" placeholder="Enter password" required />
          <select required>
            <option value="">Select Role</option>
            <option value="admin">Admin</option>
            <option value="student">Student</option>
          </select>

          <div className="actions">
            <button
              type="submit"
              className={`signup ${isSubmitting ? 'submitting' : ''}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Logging In...' : 'Log In'}
            </button>
           
          </div>
          <p className='login-reg'>Dont have an Account? <a href='/register'>Register</a></p>
        </form>
      </div>
    </div>
  );
};

export default Login;