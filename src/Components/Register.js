import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Register.css';

const Register = ({ onClose }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate(); // Get the navigate function

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const form = e.target;
    const data = {
      email: form[0].value,
      regNumber: form[1].value,
      department: form[2].value,
      leetcode: form[3].value,
      codechef: form[4].value,
      hackerearth: form[5].value,
      hackerrank: form[6].value,
      password: form[7].value,
      confirmPassword: form[8].value,
    };

    try {
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (response.ok) {
        alert('✅ Registration successful');
        form.reset();
        if (onClose) onClose();
        navigate('/login'); // Redirect to login page after successful registration
      } else {
        alert('❌ ' + result.message);
      }
    } catch (err) {
      alert('❌ Error: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='register-container'>
      <div className="re-container">
        <div className="left-panel">
          <div className="content-wrapper">
            <h2>Welcome to</h2>
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
          <h2>Create your account</h2>
          <form className="form" onSubmit={handleSubmit}>
            <input type="email" placeholder="Enter your email" required />
            <input type="text" placeholder="Enter registration number" required />

            <select required>
              <option value="">Select Department</option>
              <option value="CSE">CSE</option>
              <option value="IT">IT</option>
              <option value="BT">BT</option>
              <option value="BM">BM</option>
              <option value="ACSE">ACSE</option>
              <option value="ECE">ECE</option>
              <option value="EEE">EEE</option>
              <option value="Agriculture">Agriculture</option>
              <option value="BBA">BBA</option>
            </select>

            <div className="input-row">
              <input type="text" placeholder="LeetCode username" />
              <input type="text" placeholder="CodeChef username" />
            </div>

            <div className="input-row">
              <input type="text" placeholder="HackerEarth username" />
              <input type="text" placeholder="HackerRank username" />
            </div>

            <input type="password" placeholder="Enter password" required />
            <input type="password" placeholder="Confirm password" required />

            <div className="actions">
              <button
                type="submit"
                className={`signup ${isSubmitting ? 'submitting' : ''}`}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating Account...' : 'Sign Up'}
              </button>
            </div>
            <p>Already have an Account? <a href="/login" className="signinn">Login</a></p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;