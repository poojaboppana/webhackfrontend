import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProfilePage.css';
import axios from 'axios';

// Fallback image as base64 encoded SVG
const fallbackImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZD0iTTEyIDJDNi40NzcgMiAyIDYuNDc3IDIgMTJzNC40NzcgMTAgMTAgMTAgMTAtNC40NzcgMTAtMTBTMTcuNTIzIDIgMTIgMnptMCAyYzQuNDE4IDAgOCAzLjU4MiA4IDhzLTMuNTgyIDgtOCA4LTgtMy41ODItOC04IDMuNTgyLTggOC04eiIvPjxwYXRoIGQ9Ik0xMiAxMWMtMS4xMDMgMC0yLS44OTctMi0ycy44OTctMiAyLTIgMiAuODk3IDIgMi0uODk3IDItMiAyem0wIDRjLTIuMjA5IDAtNCAxLjE0My00IDIuNWg4YzAtMS4zNTctMS43OTEtMi41LTQtMi41eiIvPjwvc3ZnPg==';

const ProfilePage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState({
    regNumber: '',
    username: '',
    email: '',
    linkedin: '',
    github: '',
    profilePic: '',
  });
  const navigate = useNavigate();

  // Fetch profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        // Get registration number from localStorage
        const regNumber = localStorage.getItem('regNumber');
        if (!regNumber) {
          throw new Error('Registration number not found');
        }

        // Fetch profile data
        const response = await axios.get(`http://localhost:5000/api/profile/${regNumber}`);
        setProfile(response.data);
      } catch (err) {
        if (err.response?.status === 404) {
          // Profile doesn't exist yet, use regNumber from localStorage
          const regNumber = localStorage.getItem('regNumber') || '';
          setProfile(prev => ({ ...prev, regNumber }));
        } else {
          setError('Failed to load profile');
          console.error("Profile load error:", err);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === 'profilePic') {
      if (!files || !files[0]) return;
      
      const reader = new FileReader();
      reader.onload = () => {
        setProfile(prev => ({ ...prev, profilePic: reader.result }));
      };
      reader.onerror = () => {
        setError('Error reading image file');
        console.error('Error reading file');
      };
      reader.readAsDataURL(files[0]);
    } else {
      setProfile(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Ensure regNumber is set (from localStorage if not in form)
      const regNumber = profile.regNumber || localStorage.getItem('regNumber');
      if (!regNumber) {
        throw new Error('Registration number is required');
      }

      const profileData = {
        ...profile,
        regNumber
      };

      const response = await axios.post(
        "http://localhost:5000/api/profile/save", 
        profileData,
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      
      console.log('Save successful:', response.data);
      
      // Redirect to student dashboard after successful update
      navigate('/student-dashboard');
      
    } catch (error) {
      let errorMessage = 'Failed to save profile';
      if (error.response) {
        console.error('Server responded with error:', error.response.data);
        errorMessage = error.response.data.error || errorMessage;
      } else if (error.request) {
        console.error('No response received:', error.request);
        errorMessage = 'No response from server';
      } else {
        console.error('Request setup error:', error.message);
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="profile-wrapper">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  return (
    <div className="profile-wrapper">
      <div className="floating-cubes-bg">
        {[...Array(12)].map((_, i) => <div className="floating-cube" key={i}></div>)}
      </div>

      <div className="profile-container">
        <div className="profile-card">
          <h2 className="profile-title">Profile Settings</h2>
          {error && <div className="error-message">{error}</div>}
          
          <div className="profile-pic-wrapper">
            <img
              src={profile.profilePic || fallbackImage}
              alt="Profile"
              className="profile-pic"
              onError={(e) => {
                e.target.src = fallbackImage;
              }}
            />
          </div>
          
          <form onSubmit={handleSubmit}>
            <input 
              className="input" 
              name="regNumber" 
              placeholder="Registration Number" 
              value={profile.regNumber || ''} 
              onChange={handleChange} 
              required
              disabled={!!localStorage.getItem('regNumber')} // Disable if regNumber is in localStorage
            />
           
            <input 
              className="input" 
              name="email" 
              type="email" 
              placeholder="Email" 
              value={profile.email || ''} 
              onChange={handleChange} 
              required
            />
            <input 
              className="input" 
              name="linkedin" 
              placeholder="LinkedIn URL" 
              value={profile.linkedin || ''} 
              onChange={handleChange} 
            />
            <input 
              className="input" 
              name="github" 
              placeholder="GitHub URL" 
              value={profile.github || ''} 
              onChange={handleChange} 
            />
            
            <div className="file-input-wrapper">
              <label className="file-input-label">
                Change Profile Picture
                <input 
                  type="file" 
                  name="profilePic" 
                  accept="image/*" 
                  onChange={handleChange} 
                  className="file-input" 
                />
              </label>
            </div>
            
            <div className="button-group">
              <button 
                type="submit" 
                className="button"
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Update Profile'}
              </button>
              <button 
                type="button" 
                className="button-outline"
                onClick={() => navigate('/student-dashboard')}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;