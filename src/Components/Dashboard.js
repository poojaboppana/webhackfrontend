import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar 
} from 'recharts';
import axios from 'axios';
import './Dashboard.css';

const Dashboard = () => {
  const [codechefData, setCodechefData] = useState(null);
  const [leetcodeData, setLeetcodeData] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('codechef');
  const [contestList, setContestList] = useState([]);
  const [isEditingPhoto, setIsEditingPhoto] = useState(false);
  const fileInputRef = useRef(null);
  const [ratingHistory, setRatingHistory] = useState([]);
  const [heatmapData, setHeatmapData] = useState({});
  
  // State for achievements
  const [achievements, setAchievements] = useState([]);
  const [newAchievement, setNewAchievement] = useState({
    type: 'badge',
    title: '',
    image: null,
  });
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  const [editingAchievement, setEditingAchievement] = useState(null);
  const achievementFileInputRef = useRef(null);
  
  const navigate = useNavigate();

  const fallbackImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZD0iTTEyIDJDNi40NzcgMiAyIDYuNDc3IDIgMTJzNC40NzcgMTAgMTAgMTAgMTAtNC40NzcgMTAtMTBTMTcuNTIzIDIgMTIgMnptMCAyYzQuNDE4IDAgOCAzLjU4MiA4IDhzLTMuNTgyIDgtOCA4LTgtMy41ODItOC04IDMuNTgyLTggOC04eiIvPjxwYXRoIGQ9Ik0xMiAxMWMtMS4xMDMgMC0yLS44OTctMi0ycy44OTctMiAyLTIgMiAuODk3IDIgMi0uODk3IDItMiAyem0wIDRjLTIuMjA5IDAtNCAxLjE0My00IDIuNWg4YzAtMS4zNTctMS43OTEtMi41LTQtMi41eiIvPjwvc3ZnPg==';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const regNumber = localStorage.getItem('regNumber');
        const role = localStorage.getItem('role');
        
        if (!regNumber || !role) {
          throw new Error('Please login first');
        }

        if (role !== 'student') {
          window.location.href = '/login';
          return;
        }

        const userResponse = await axios.get(`http://localhost:5000/api/user/${regNumber}`);
        setUserDetails(userResponse.data);

        const profileResponse = await axios.get(`http://localhost:5000/api/profile/${regNumber}`);
        setProfileData(profileResponse.data);

        if (userResponse.data) {
          const { codechef, leetcode } = userResponse.data;
          
          const [codechefResponse, leetcodeResponse] = await Promise.all([
            axios.get(`https://codechef-api.vercel.app/${codechef}`),
            axios.get(`https://leetcode-stats-api.herokuapp.com/${leetcode}`)
          ]);

          setCodechefData(codechefResponse.data);
          setLeetcodeData(leetcodeResponse.data);

          if (codechefResponse.data.ratingData) {
            setRatingHistory(codechefResponse.data.ratingData);
            setContestList(codechefResponse.data.ratingData.map(contest => ({
              name: contest.name,
              rank: contest.rank
            })));

            const heatmap = {};
            codechefResponse.data.ratingData.forEach(contest => {
              const year = contest.getyear;
              const month = contest.getmonth;
              if (!heatmap[year]) {
                heatmap[year] = {};
              }
              heatmap[year][month] = (heatmap[year][month] || 0) + 1;
            });
            setHeatmapData(heatmap);
          }
        }

        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch achievements on component mount
  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem('user'));
        const response = await fetch(`http://localhost:5000/api/achievements/${userData.regNumber}`);
        const data = await response.json();
        setAchievements(data);
      } catch (err) {
        console.error('Error fetching achievements:', err);
      }
    };

    fetchAchievements();
  }, []);

  const handleProfilePhotoChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = reader.result;
        const regNumber = localStorage.getItem('regNumber');
        
        setProfileData(prev => ({
          ...prev,
          profilePic: base64Image
        }));
        
        try {
          await axios.post('http://localhost:5000/api/profile/save', {
            ...profileData,
            profilePic: base64Image,
            regNumber
          });
        } catch (err) {
          console.error('Failed to save profile picture:', err);
          setProfileData(prev => ({
            ...prev,
            profilePic: prev.profilePic
          }));
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError('Error processing image');
      console.error('Image processing error:', err);
    } finally {
      setIsEditingPhoto(false);
    }
  };

  // Handle image selection for achievements
  const handleAchievementImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewAchievement({ ...newAchievement, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  // Add a new achievement
  const handleAddAchievement = async () => {
    if (newAchievement.title && newAchievement.image) {
      try {
        const userData = JSON.parse(localStorage.getItem('user'));
        const response = await fetch('http://localhost:5000/api/achievements', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            regNumber: userData.regNumber,
            type: newAchievement.type,
            title: newAchievement.title,
            image: newAchievement.image
          }),
        });

        const data = await response.json();
        setAchievements([...achievements, data]);
        setNewAchievement({ type: 'badge', title: '', image: null });
        achievementFileInputRef.current.value = null;
      } catch (err) {
        console.error('Error adding achievement:', err);
      }
    }
  };

  // Edit an existing achievement
  const handleEditAchievement = (achievement) => {
    setEditingAchievement(achievement);
    setNewAchievement({
      type: achievement.type,
      title: achievement.title,
      image: achievement.image
    });
  };

  // Update an achievement
  const handleUpdateAchievement = async () => {
    if (editingAchievement && newAchievement.title && newAchievement.image) {
      try {
        const response = await fetch(`http://localhost:5000/api/achievements/${editingAchievement._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: newAchievement.type,
            title: newAchievement.title,
            image: newAchievement.image
          }),
        });

        const updatedAchievement = await response.json();
        setAchievements(achievements.map(ach => 
          ach._id === updatedAchievement._id ? updatedAchievement : ach
        ));
        setEditingAchievement(null);
        setNewAchievement({ type: 'badge', title: '', image: null });
        achievementFileInputRef.current.value = null;
      } catch (err) {
        console.error('Error updating achievement:', err);
      }
    }
  };

  // Delete an achievement
  const handleDeleteAchievement = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/achievements/${id}`, {
        method: 'DELETE',
      });

      setAchievements(achievements.filter(ach => ach._id !== id));
      if (selectedAchievement && selectedAchievement._id === id) {
        setSelectedAchievement(null);
      }
      if (editingAchievement && editingAchievement._id === id) {
        setEditingAchievement(null);
        setNewAchievement({ type: 'badge', title: '', image: null });
      }
    } catch (err) {
      console.error('Error deleting achievement:', err);
    }
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingAchievement(null);
    setNewAchievement({ type: 'badge', title: '', image: null });
    achievementFileInputRef.current.value = null;
  };

  // Logout function
  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const renderComparisonBarChart = () => {
    if (!codechefData || !leetcodeData) return null;

    const codechefRankPercentage = (codechefData.globalRank / 100000) * 100;
    const leetcodeRankPercentage = (leetcodeData.ranking / 1000000) * 100;

    const data = [
      {
        name: 'Global Rank',
        CodeChef: codechefData.globalRank,
        LeetCode: leetcodeData.ranking,
        codechefPercentage: codechefRankPercentage.toFixed(2),
        leetcodePercentage: leetcodeRankPercentage.toFixed(2)
      },
    ];

    return (
      <div className="comparison-chart-container">
        <h3>Platform Performance Comparison (Global Rank)</h3>
        <div className="chart-wrapper">
          <ResponsiveContainer width="95%" height={300}>
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 20, right: 30, left: 80, bottom: 20 }}
              barSize={28}
              barGap={15}
              barCategoryGap={20}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis 
                dataKey="name" 
                type="category" 
                width={100}
                tick={{ fontSize: 12 }}
              />
              <Tooltip 
                formatter={(value, name) => [
                  `${value} (Top ${name === 'CodeChef' ? codechefRankPercentage.toFixed(2) : leetcodeRankPercentage.toFixed(2)}%)`,
                  name
                ]}
              />
              <Legend />
              <Bar 
                dataKey="CodeChef" 
                fill="#90EE90" 
                radius={[0, 4, 4, 0]}
                animationDuration={1500}
                barSize={28}
              />
              <Bar 
                dataKey="LeetCode" 
                fill="#8A2BE2" 
                radius={[0, 4, 4, 0]}
                animationDuration={1500}
                barSize={28}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const getHeatmapColor = (count) => {
    if (!count) return '#ebedf0';
    if (count <= 1) return '#9be9a8';
    if (count <= 2) return '#40c463';
    if (count <= 3) return '#30a14e';
    return '#216e39';
  };

  const renderHeatmap = () => {
    const years = Object.keys(heatmapData).sort();
    if (years.length === 0) return <p>No heatmap data available</p>;

    const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString());

    return (
      <div className="heatmap-container">
        <h3>Contest Participation Heatmap</h3>
        <table className="heatmap-table">
          <thead>
            <tr>
              <th>Year</th>
              {months.map(month => (
                <th key={month}>
                  {new Date(2000, parseInt(month) - 1, 1).toLocaleString('default', { month: 'short' })}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {years.map(year => (
              <tr key={year}>
                <td>{year}</td>
                {months.map(month => (
                  <td
                    key={`${year}-${month}`}
                    style={{ 
                      backgroundColor: getHeatmapColor(heatmapData[year]?.[month] || 0),
                      cursor: 'help'
                    }}
                    title={`${year}-${month}: ${heatmapData[year]?.[month] || 0} contests`}
                  >
                     
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="heatmap-legend">
          <span>Less</span>
          <div className="heatmap-legend-colors">
            {['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'].map((color, i) => (
              <div key={i} style={{ backgroundColor: color }}></div>
            ))}
          </div>
          <span>More</span>
        </div>
      </div>
    );
  };

  const renderLeetcodePieChart = () => {
    if (!leetcodeData) return null;

    const data = [
      { name: 'Easy', value: leetcodeData.easySolved },
      { name: 'Medium', value: leetcodeData.mediumSolved },
      { name: 'Hard', value: leetcodeData.hardSolved },
    ];
    const COLORS = ['#00C49F', '#FFBB28', '#FF8042'];

    return (
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [`${value} solved`, '']} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  const renderAchievementsTab = () => {
    const badges = achievements.filter(a => a.type === 'badge');
    const certificates = achievements.filter(a => a.type === 'certificate');

    return (
      <div className="achievements-tab">
        <div className="add-achievement-form">
          <h2>{editingAchievement ? 'Edit Achievement' : 'Add New Achievement'}</h2>
          <div className="form-group">
            <label>Type:</label>
            <select
              value={newAchievement.type}
              onChange={(e) => setNewAchievement({ ...newAchievement, type: e.target.value })}
              className="achievement-type-select"
            >
              <option value="badge">Badge</option>
              <option value="certificate">Certificate</option>
            </select>
          </div>
          <div className="form-group">
            <label>Title:</label>
            <input
              type="text"
              placeholder="Enter achievement title"
              value={newAchievement.title}
              onChange={(e) => setNewAchievement({ ...newAchievement, title: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Image:</label>
            <input
              type="file"
              accept="image/*"
              ref={achievementFileInputRef}
              onChange={handleAchievementImageChange}
            />
          </div>
          {newAchievement.image && (
            <div className="image-preview-container">
              <img src={newAchievement.image} alt="Preview" className="image-preview" />
              <button 
                className="clear-image"
                onClick={() => {
                  setNewAchievement({ ...newAchievement, image: null });
                  achievementFileInputRef.current.value = null;
                }}
              >
                ×
              </button>
            </div>
          )}
          <div className="form-actions">
            {editingAchievement ? (
              <>
                <button
                  className="update-button"
                  onClick={handleUpdateAchievement}
                  disabled={!newAchievement.title || !newAchievement.image}
                >
                  Update Achievement
                </button>
                <button
                  className="cancel-button"
                  onClick={cancelEdit}
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                className="add-button"
                onClick={handleAddAchievement}
                disabled={!newAchievement.title || !newAchievement.image}
              >
                Add Achievement
              </button>
            )}
          </div>
        </div>

        <div className="achievements-section">
          <h2>Badges</h2>
          {badges.length > 0 ? (
            <div className="achievements-grid">
              {badges.map((achievement) => (
                <div 
                  key={achievement._id} 
                  className="achievement-card"
                >
                  <img src={achievement.image} alt={achievement.title} onClick={() => setSelectedAchievement(achievement)} />
                  <div className="achievement-info">
                    <h3 onClick={() => setSelectedAchievement(achievement)}>{achievement.title}</h3>
                    <small>{new Date(achievement.date).toLocaleDateString()}</small>
                    <div className="achievement-actions">
                      <button 
                        className="edit-button"
                        onClick={() => handleEditAchievement(achievement)}
                      >
                        <i className="fas fa-edit"></i> Edit
                      </button>
                      <button 
                        className="delete-button"
                        onClick={() => handleDeleteAchievement(achievement._id)}
                      >
                        <i className="fas fa-trash"></i> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-achievements">No badges added yet.</p>
          )}
        </div>

        <div className="achievements-section">
          <h2>Certificates</h2>
          {certificates.length > 0 ? (
            <div className="achievements-grid">
              {certificates.map((achievement) => (
                <div 
                  key={achievement._id} 
                  className="achievement-card"
                >
                  <img src={achievement.image} alt={achievement.title} onClick={() => setSelectedAchievement(achievement)} />
                  <div className="achievement-info">
                    <h3 onClick={() => setSelectedAchievement(achievement)}>{achievement.title}</h3>
                    <small>{new Date(achievement.date).toLocaleDateString()}</small>
                    <div className="achievement-actions">
                      <button 
                        className="edit-button"
                        onClick={() => handleEditAchievement(achievement)}
                      >
                        <i className="fas fa-edit"></i> Edit
                      </button>
                      <button 
                        className="delete-button"
                        onClick={() => handleDeleteAchievement(achievement._id)}
                      >
                        <i className="fas fa-trash"></i> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-achievements">No certificates added yet.</p>
          )}
        </div>

        {selectedAchievement && (
          <div className="achievement-modal">
            <div className="modal-content">
              <span className="close-modal" onClick={() => setSelectedAchievement(null)}>×</span>
              <img src={selectedAchievement.image} alt={selectedAchievement.title} />
              <h3>{selectedAchievement.title}</h3>
              <p>Type: {selectedAchievement.type === 'badge' ? 'Badge' : 'Certificate'}</p>
              <p>Date: {new Date(selectedAchievement.date).toLocaleDateString()}</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) return (
    <div className="loading-container">
      <div className="spinner-3d">
        <div className="cube">
          <div className="face front"></div>
          <div className="face back"></div>
          <div className="face left"></div>
          <div className="face right"></div>
          <div className="face top"></div>
          <div className="face bottom"></div>
        </div>
      </div>
      <p>Fetching your stats...</p>
    </div>
  );

  if (error) return (
    <div className="error-container">
      <h2>Error Loading Data</h2>
      <p>{error}</p>
      <button onClick={() => window.location.reload()}>Retry</button>
    </div>
  );

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <div className="profile-section">
          <div className="avatar">
            <img 
              src={profileData?.profilePic || fallbackImage} 
              alt="Profile" 
              style={{ cursor: 'default' }}
              onError={(e) => {
                e.target.src = fallbackImage;
              }}
            />
            <span className=" Renovated-status"></span>
            {isEditingPhoto && (
              <input
                type="file"
                accept="image/*"
                onChange={handleProfilePhotoChange}
                ref={fileInputRef}
                style={{ display: 'none' }}
              />
            )}
          </div>
          <h2>{profileData?.username || userDetails?.regNumber || 'User'}</h2>
          <p className="username">@{userDetails?.regNumber || 'username'}</p>
          {profileData?.linkedin && (
            <a href={profileData.linkedin} target="_blank" rel="noopener noreferrer">
              <i className="fab fa-linkedin"></i>
            </a>
          )}
          {profileData?.github && (
            <a href={profileData.github} target="_blank" rel="noopener noreferrer">
              <i className="fab fa-github"></i>
            </a>
          )}
          <Link to="/profile" className="edit-profile-btn">
            <button>Edit Profile</button>
          </Link>
        </div>

        <nav className="dashboard-nav">
          <ul>
            <li 
              className={activeTab === 'codechef' ? 'active' : ''} 
              onClick={() => setActiveTab('codechef')}
            >
              <i className="fas fa-code"></i> CodeChef Performance
            </li>
            <li 
              className={activeTab === 'leetcode' ? 'active' : ''} 
              onClick={() => setActiveTab('leetcode')}
            >
              <i className="fas fa-code-branch"></i> LeetCode Stats
            </li>
            <li 
              className={activeTab === 'overall' ? 'active' : ''} 
              onClick={() => setActiveTab('overall')}
            >
              <i className="fas fa-chart-pie"></i> Overall Insights
            </li>
            <li 
              className={activeTab === 'achievements' ? 'active' : ''} 
              onClick={() => setActiveTab('achievements')}
            >
              <i className="fas fa-trophy"></i> Achievements
            </li>
            <li 
              className="logout-item"
              onClick={handleLogout}
            >
              <i className="fas fa-sign-out-alt"></i> Logout
            </li>
          </ul>
        </nav>

        <div className="sidebar-footer">
          <p>Last updated: {new Date().toLocaleString()}</p>
        </div>
      </div>

      <div className="main-content">
        <header className="dashboard-header">
          <h1>
            {activeTab === 'codechef' ? 'CodeChef Performance' : 
             activeTab === 'leetcode' ? 'LeetCode Stats' : 
             activeTab === 'overall' ? 'Overall Performance' : 
             'Achievements'}
          </h1>
          <div className="header-actions">
            <button className="refresh-btn" onClick={() => window.location.reload()}>
              <i className="fas fa-sync-alt"></i> Refresh
            </button>
          </div>
        </header>

        {activeTab === 'codechef' && codechefData && (
          <div className="codechef-tab">
            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-icon">
                  <i className="fas fa-star"></i>
                </div>
                <div className="metric-info">
                  <h3>Current Rating</h3>
                  <p className="metric-value">{codechefData.rating}</p>
                  <p className="metric-change">
                    Stars: {codechefData.stars}
                  </p>
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-icon">
                  <i className="fas fa-trophy"></i>
                </div>
                <div className="metric-info">
                  <h3>Highest Rating</h3>
                  <p className="metric-value">{codechefData.highestRating}</p>
                  <p className="metric-change">
                    {codechefData.rating - codechefData.highestRating < 0 ? '↓' : '↑'}
                    {Math.abs(codechefData.rating - codechefData.highestRating)} from peak
                  </p>
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-icon">
                  <i className="fas fa-globe"></i>
                </div>
                <div className="metric-info">
                  <h3>Global Rank</h3>
                  <p className="metric-value">#{codechefData.globalRank}</p>
                  <p className="metric-change">
                    Top {((codechefData.globalRank / 100000) * 100).toFixed(2)}%
                  </p>
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-icon">
                  <i className="fas fa-flag"></i>
                </div>
                <div className="metric-info">
                  <h3>Country Rank</h3>
                  <p className="metric-value">#{codechefData.countryRank || 'N/A'}</p>
                  <p className="metric-change">{codechefData.country || 'N/A'}</p>
                </div>
              </div>
            </div>

            {renderHeatmap()}

            <div className="rating-graph-container">
              <h3>Rating vs Contest</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={ratingHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="code" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="rating" 
                    stroke="#8884d8" 
                    name="Rating" 
                    activeDot={{ r: 8 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="contest-list-container">
              <h3>Contests Participated ({contestList.length})</h3>
              <div className="contest-list">
                {contestList.length > 0 ? (
                  <table>
                    <thead>
                      <tr>
                        <th>Contest Name</th>
                        <th>Rank</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contestList.map((contest, index) => (
                        <tr key={index}>
                          <td>{contest.name}</td>
                          <td>#{contest.rank}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p>No contest history available</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'leetcode' && leetcodeData && (
          <div className="leetcode-tab">
            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-icon">
                  <i className="fas fa-check-circle"></i>
                </div>
                <div className="metric-info">
                  <h3>Total Solved</h3>
                  <p className="metric-value">{leetcodeData.totalSolved}</p>
                  <p className="metric-change">
                    {leetcodeData.totalQuestions} total
                  </p>
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-icon">
                  <i className="fas fa-chart-line"></i>
                </div>
                <div className="metric-info">
                  <h3>Ranking</h3>
                  <p className="metric-value">{leetcodeData.ranking}</p>
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-icon">
                  <i className="fas fa-percentage"></i>
                </div>
                <div className="metric-info">
                  <h3>Acceptance Rate</h3>
                  <p className="metric-value">{leetcodeData.acceptanceRate}%</p>
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-icon">
                  <i className="fas fa-star"></i>
                </div>
                <div className="metric-info">
                  <h3>Contribution Points</h3>
                  <p className="metric-value">{leetcodeData.contributionPoints}</p>
                </div>
              </div>
            </div>

            <div className="leetcode-pie-chart">
              <h3>Solved Problems by Difficulty</h3>
              {renderLeetcodePieChart()}
            </div>
          </div>
        )}

        {activeTab === 'overall' && codechefData && leetcodeData && (
          <div className="overall-tab">
            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-icon">
                  <i className="fas fa-code"></i>
                </div>
                <div className="metric-info">
                  <h3>CodeChef Rating</h3>
                  <p className="metric-value">{codechefData.rating}</p>
                  <p className="metric-change">{codechefData.stars} stars</p>
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-icon">
                  <i className="fas fa-code-branch"></i>
                </div>
                <div className="metric-info">
                  <h3>LeetCode Solved</h3>
                  <p className="metric-value">{leetcodeData.totalSolved}</p>
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-icon">
                  <i className="fas fa-medal"></i>
                </div>
                <div className="metric-info">
                  <h3>CodeChef Global Rank</h3>
                  <p className="metric-value">#{codechefData.globalRank}</p>
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-icon">
                  <i className="fas fa-chart-line"></i>
                </div>
                <div className="metric-info">
                  <h3>LeetCode Ranking</h3>
                  <p className="metric-value">{leetcodeData.ranking}</p>
                </div>
              </div>
            </div>

            <div className="combined-stats">
              <h3>Performance Summary</h3>
              <div className="stats-grid">
                <div className="stat-item">
                  <h4>CodeChef Contests</h4>
                  <p>{contestList.length}</p>
                </div>
                <div className="stat-item">
                  <h4>LeetCode Acceptance</h4>
                  <p>{leetcodeData.acceptanceRate}%</p>
                </div>
                <div className="stat-item">
                  <h4>Easy Solved</h4>
                  <p>{leetcodeData.easySolved}</p>
                </div>
                <div className="stat-item">
                  <h4>Medium Solved</h4>
                  <p>{leetcodeData.mediumSolved}</p>
                </div>
                <div className="stat-item">
                  <h4>Hard Solved</h4>
                  <p>{leetcodeData.hardSolved}</p>
                </div>
                <div className="stat-item">
                  <h4>Global Rank</h4>
                  <p>{codechefData.globalRank || 'N/A'}</p>
                </div>
              </div>
            </div>

            {renderComparisonBarChart()}
          </div>
        )}

        {activeTab === 'achievements' && renderAchievementsTab()}
      </div>
    </div>
  );
};

export default Dashboard;