import React, { useState, useEffect, useRef } from 'react';
import './Dashboard.css';

const Dashboard = () => {
  const [codechefData, setCodechefData] = useState(null);
  const [leetcodeData, setLeetcodeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('codechef');
  const [contestList, setContestList] = useState([]);
  const [profilePhoto, setProfilePhoto] = useState('https://via.placeholder.com/150');
  const [isEditingPhoto, setIsEditingPhoto] = useState(false);
  const fileInputRef = useRef(null);
  const [ratingHistory, setRatingHistory] = useState([]);
  const [userDetails, setUserDetails] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      window.location.href = '/login';
      return;
    }
    setUserDetails(user);

    const fetchData = async () => {
      try {
        // Fetch platform usernames from backend
        const userResponse = await fetch(`http://localhost:5000/api/user/${user.regNumber}`);
        const userData = await userResponse.json();

        // Fetch CodeChef data
        if (userData.codechef) {
          const codechefResponse = await fetch(`https://codechef-api.vercel.app/${userData.codechef}`);
          const codechefData = await codechefResponse.json();
          setCodechefData(codechefData);

          if (codechefData.contestHistory) {
            setContestList(
              codechefData.contestHistory.map((contest) => ({
                name: contest.name,
                rank: contest.rank,
              }))
            );
          }
          if (codechefData.ratingData) {
            setRatingHistory(codechefData.ratingData);
          }
        }

        // Fetch LeetCode data
        if (userData.leetcode) {
          const leetcodeResponse = await fetch(`https://leetcode-stats-api.herokuapp.com/${userData.leetcode}`);
          const leetcodeData = await leetcodeResponse.json();
          setLeetcodeData(leetcodeData);
        }

        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleProfilePhotoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhoto(reader.result);
        setIsEditingPhoto(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  if (loading)
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Fetching your stats...</p>
      </div>
    );

  if (error)
    return (
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
              src={profilePhoto}
              alt="Profile"
              onClick={() => setIsEditingPhoto(true)}
              style={{ cursor: 'pointer' }}
            />
            <span className="online-status"></span>
          </div>
          {isEditingPhoto && (
            <input
              type="file"
              accept="image/*"
              onChange={handleProfilePhotoChange}
              ref={fileInputRef}
              style={{ display: 'none' }}
            />
          )}
          <h2>{codechefData?.name || 'User'}</h2>
          <p className="username">@{codechefData?.username || userDetails?.regNumber}</p>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>

        <nav className="dashboard-nav">
          <ul>
            <li className={activeTab === 'codechef' ? 'active' : ''} onClick={() => setActiveTab('codechef')}>
              <i className="fas fa-code"></i> CodeChef Performance
            </li>
            <li className={activeTab === 'leetcode' ? 'active' : ''} onClick={() => setActiveTab('leetcode')}>
              <i className="fas fa-code-branch"></i> LeetCode Stats
            </li>
            <li className={activeTab === 'overall' ? 'active' : ''} onClick={() => setActiveTab('overall')}>
              <i className="fas fa-chart-pie"></i> Overall Insights
            </li>
          </ul>
        </nav>

        <div className="sidebar-footer">
          <p>Last updated: {new Date().toLocaleString()}</p>
        </div>
      </div>

      <div className="main-content">
        <header className="dashboard-header">
          <h1>CodeChef Performance</h1>
          <div className="header-actions">
            <button className="refresh-btn" onClick={() => window.location.reload()}>
              <i className="fas fa-sync-alt"></i> Refresh
            </button>
          </div>
        </header>

        {activeTab === 'codechef' && (
          <div className="codechef-tab">
            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-icon">
                  <i className="fas fa-star"></i>
                </div>
                <div className="metric-info">
                  <h3>Current Rating</h3>
                  <p className="metric-value">{codechefData?.rating || 'N/A'}</p>
                  <p className="metric-change">Stars: {codechefData?.stars || 'N/A'}</p>
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-icon">
                  <i className="fas fa-trophy"></i>
                </div>
                <div className="metric-info">
                  <h3>Highest Rating</h3>
                  <p className="metric-value">{codechefData?.highestRating || 'N/A'}</p>
                  <p className="metric-change">
                    {codechefData?.rating - codechefData?.highestRating < 0 ? '↓' : '↑'}
                    {Math.abs(codechefData?.rating - codechefData?.highestRating) || 0} from peak
                  </p>
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-icon">
                  <i className="fas fa-globe"></i>
                </div>
                <div className="metric-info">
                  <h3>Global Rank</h3>
                  <p className="metric-value">#{codechefData?.globalRank || 'N/A'}</p>
                  <p className="metric-change">
                    Top {((codechefData?.globalRank / 100000) * 100).toFixed(2) || 'N/A'}%
                  </p>
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-icon">
                  <i className="fas fa-flag"></i>
                </div>
                <div className="metric-info">
                  <h3>Country Rank</h3>
                  <p className="metric-value">#{codechefData?.countryRank || 'N/A'}</p>
                  <p className="metric-change">{codechefData?.country || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="contest-list-container">
              <h3>Contests Participated</h3>
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
            <div className="rating-history-container">
              <h3>Rating History</h3>
              <div className="rating-history">
                {ratingHistory.length > 0 ? (
                  <table>
                    <thead>
                      <tr>
                        <th>Contest Code</th>
                        <th>Date</th>
                        <th>Rating</th>
                        <th>Rank</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ratingHistory.map((rating, index) => (
                        <tr key={index}>
                          <td>{rating.code}</td>
                          <td>{`${rating.getyear}-${rating.getmonth}-${rating.getday}`}</td>
                          <td>{rating.rating}</td>
                          <td>#{rating.rank}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p>No rating history available</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'leetcode' && (
          <div className="overview-tab">
            <h2>LeetCode Stats</h2>
            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-icon">
                  <i className="fas fa-check-circle"></i>
                </div>
                <div className="metric-info">
                  <h3>Total Solved</h3>
                  <p className="metric-value">{leetcodeData?.totalSolved || 'N/A'}</p>
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-icon">
                  <i className="fas fa-chart-line"></i>
                </div>
                <div className="metric-info">
                  <h3>Ranking</h3>
                  <p className="metric-value">{leetcodeData?.ranking || 'N/A'}</p>
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-icon">
                  <i className="fas fa-puzzle-piece"></i>
                </div>
                <div className="metric-info">
                  <h3>Acceptance Rate</h3>
                  <p className="metric-value">{leetcodeData?.acceptanceRate || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'overall' && (
          <div className="overview-tab">
            <h2>Overall Performance</h2>
            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-icon">
                  <i className="fas fa-code"></i>
                </div>
                <div className="metric-info">
                  <h3>CodeChef Rating</h3>
                  <p className="metric-value">
                    {codechefData?.rating || 'N/A'} <span>({codechefData?.stars || 'N/A'})</span>
                  </p>
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-icon">
                  <i className="fas fa-code-branch"></i>
                </div>
                <div className="metric-info">
                  <h3>LeetCode Solved</h3>
                  <p className="metric-value">{leetcodeData?.totalSolved || 'N/A'}</p>
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-icon">
                  <i className="fas fa-medal"></i>
                </div>
                <div className="metric-info">
                  <h3>CodeChef Global Rank</h3>
                  <p className="metric-value">#{codechefData?.globalRank || 'N/A'}</p>
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-icon">
                  <i className="fas fa-chart-line"></i>
                </div>
                <div className="metric-info">
                  <h3>LeetCode Ranking</h3>
                  <p className="metric-value">{leetcodeData?.ranking || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;