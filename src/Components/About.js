import React from 'react';
import './About.css';
import './Navbar.css'; // Make sure you have Navbar.css in the same directory
import { Link } from 'react-router-dom';
const About = () => {
  return (
    <div className="about-container">
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
      <section className="about-hero">
        <div className="about-hero-content">
          <h1>About Student Coding Profile Tracker</h1>
          <p>
            Welcome to the Student Coding Profile Tracker, a platform designed to empower students
            by providing a comprehensive view of their coding journey. Track your progress,
            showcase your achievements, and compete with peers on a global scale.
          </p>
        </div>
       
      </section>

      <section className="about-features">
        <h2>Key Features</h2>
        <div className="features-grid">
          <FeatureCard
            title="Student Dashboard"
            description="Link your profiles from LeetCode, CodeChef, HackerRank, and more. Track your problem-solving, badges, and ratings in one place."
          />
          <FeatureCard
            title="Performance Metrics"
            description="Get detailed insights into your coding activity, including problems solved, earned certifications, and current performance levels."
          />
          <FeatureCard
            title="Ranking System"
            description="Compare your performance with peers at the department, college, and global levels. See where you stand and strive for improvement."
          />
          <FeatureCard
            title="Admin Panel"
            description="Administrators can monitor student progress, filter data by department and college, and generate detailed performance reports."
          />
        </div>
      </section>

      <section className="about-objective">
        <h2>Our Objective</h2>
        <p>
          Our objective is to design and develop a MERN Stack application that efficiently tracks
          and displays students' coding profiles, highlighting their coding activity, progress,
          and competitive performance. We aim to foster a competitive environment and enhance
          student engagement in competitive programming.
        </p>
      </section>
    </div>
  );
};

// FeatureCard component for each feature
const FeatureCard = ({ title, description }) => {
  return (
    <div className="feature-card">
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
};

export default About;