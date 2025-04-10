
import React, { useState } from 'react';
import './Contact.css';
import contactImage from './contactimg.jpeg';
import './Navbar.css'; // Make sure you have Navbar.css in the same directory
import { Link } from 'react-router-dom';
const Contact = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        message: '',
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const sendToWhatsApp = (e) => {
        e.preventDefault();

        const adminPhoneNumber = '7569001096';
        const message = encodeURIComponent(`
            New message from contact form:\n\nName: ${formData.fullName}\nEmail: ${formData.email}\nMessage: ${formData.message}`
        );

        const whatsappUrl = `https://wa.me/${adminPhoneNumber}?text=${message}`;
        window.open(whatsappUrl, '_blank');

        setFormData({
            fullName: '',
            email: '',
            message: '',
        });
    };

    return (
        <div className='contact'>
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
       
        <div className="contact-container">
    
            <div className="contact-box">
                <div className="contact-image">
                    <img src={contactImage} alt="Contact" />
                </div>
                <div className="contact-form-wrapper">
                    <h1>Contact Us</h1>
                    <form onSubmit={sendToWhatsApp} className="contact-form">
                        <div className="input-group">
                            <label>Enter your name</label>
                            <input
                                type="text"
                                name="fullName"
                                placeholder="Full Name"
                                value={formData.fullName}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label>Enter your mail</label>
                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label>Message</label>
                            <textarea
                                name="message"
                                placeholder="Type your message..."
                                value={formData.message}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <button type="submit" className="contact-btn">
                            Submit
                        </button>
                    </form>
                </div>
            </div>
        </div>
        </div>
    );
};

export default Contact;