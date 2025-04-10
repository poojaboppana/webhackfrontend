// Register.jsx
import React, { useState } from 'react';
import './Register.css';

const Register = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const form = e.target;
    const data = {
      email: form[0].value,
      regNumber: form[1].value,
      leetcode: form[2].value,
      codechef: form[3].value,
      hackerearth: form[4].value,
      hackerrank: form[5].value,
      password: form[6].value,
      confirmPassword: form[7].value,
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
          <p>Already have an Account? <a href="/login" className="signinn">Login</a> </p>
         
        </form>
      </div>
    </div>
    </div>
  );
};

export default Register;
