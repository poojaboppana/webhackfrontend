import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
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
  const [heatmapData, setHeatmapData] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [codechefResponse, leetcodeResponse] = await Promise.all([
          fetch('https://codechef-api.vercel.app/balusudivya'),
          fetch('https://leetcode-stats-api.herokuapp.com/chowdaryd14')
        ]);

        if (!codechefResponse.ok) throw new Error('Failed to fetch CodeChef data');
        if (!leetcodeResponse.ok) throw new Error('Failed to fetch LeetCode data');

        const codechefData = await codechefResponse.json();
        const leetcodeData = await leetcodeResponse.json();

        setCodechefData(codechefData);
        setLeetcodeData(leetcodeData);

        if (codechefData.ratingData) {
          setRatingHistory(codechefData.ratingData);
          setContestList(codechefData.ratingData.map(contest => ({
            name: contest.name,
            rank: contest.rank
          })));

          const heatmap = {};
          codechefData.ratingData.forEach(contest => {
            const year = contest.getyear;
            const month = contest.getmonth;
            if (!heatmap[year]) {
              heatmap[year] = {};
            }
            heatmap[year][month] = (heatmap[year][month] || 0) + 1;
          });
          setHeatmapData(heatmap);
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

  const triggerFileInput = () => {
    setIsEditingPhoto(true);
    fileInputRef.current.click();
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
                    &nbsp;
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

  if (loading) return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
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
              src={profilePhoto} 
              alt="Profile" 
              onClick={triggerFileInput} 
              style={{ cursor: 'pointer' }} 
            />
            <span className="online-status"></span>
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
          <h2>{codechefData?.name || 'User'}</h2>
          <p className="username">@{codechefData?.username || 'username'}</p>
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
             activeTab === 'leetcode' ? 'LeetCode Stats' : 'Overall Performance'}
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
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;