import React from 'react';
import './Home.css';
import './Navbar.css'; // Make sure you have Navbar.css in the same directory
import { Link } from 'react-router-dom';
const Home = () => {
  return (
    <div className="home-container">
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
    
    <div className="home-wrapper">
      <section className="hero glass-effect">
        <div className="hero-left animate-left">
          <h1 className="glow-text">Student Coding Profile Tracker</h1>
          <div className="popular-searches">
            <span>Popular:</span>
            <span className="tag">Leetcode</span>
            <span className="tag">Codechef</span>
            <span className="tag">HackerEarth</span>
            <span className="tag">HackerRank</span>
          </div>
        </div>

        <div className="hero-right animate-right">
          <div className="hero-cube">
            <div className="face front">
              <img src="https://upload.wikimedia.org/wikipedia/commons/1/19/LeetCode_logo_black.png" alt="Leetcode" />
            </div>
            <div className="face back">
              <img src="https://img.icons8.com/?size=160&id=GO78dOMqYNlA&format=png" alt="Codeforces" />
              
            </div>
            <div className="face top">
              <img src="https://upload.wikimedia.org/wikipedia/commons/e/eb/GeeksForGeeks_logo.png" alt="GFG" />
            </div>
          
            <div className="face left">
              <img src="https://upload.wikimedia.org/wikipedia/commons/6/65/HackerRank_logo.png" alt="HackerRank" />
            </div>
            <div className="face right">
              <img src="https://upload.wikimedia.org/wikipedia/commons/e/e8/HackerEarth_logo.png" alt="HackerEarth" />
            </div>
            
            
            <div className="face bottom">
              <img src="https://img.icons8.com/fluent/512/codechef.png" alt="Codechef" />
            </div>
          </div>
        </div>
      </section>
    </div>
    </div>
  );
};

export default Home;