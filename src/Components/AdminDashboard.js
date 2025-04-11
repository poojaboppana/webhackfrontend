import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { FaUsers, FaTrophy, FaFileExcel } from 'react-icons/fa';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [contestDetails, setContestDetails] = useState({
    platform: 'codechef',
    contestName: '',
    department: 'all',
  });
  const [contestParticipants, setContestParticipants] = useState([]);
  const [nonParticipants, setNonParticipants] = useState([]);
  const [contestLoading, setContestLoading] = useState(false);
  const [stats, setStats] = useState({});
  const [activeTab, setActiveTab] = useState('students');
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/registrations');
      setRegistrations(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setLoading(false);
    }
  };

  const fetchContestParticipants = async () => {
    if (!contestDetails.contestName) {
      setError('Please enter contest name');
      return;
    }

    setContestLoading(true);
    setError('');
    try {
      const response = await axios.post(
        'http://localhost:5000/api/admin/contest-participants',
        contestDetails
      );
      const participants = response.data.participants;

      const participantRegNumbers = new Set(participants.map((p) => p.regNumber));
      const filteredNonParticipants = registrations
        .filter((reg) => 
          (contestDetails.department === 'all' || reg.department === contestDetails.department) &&
          !participantRegNumbers.has(reg.regNumber)
        )
        .map((reg) => ({
          regNumber: reg.regNumber,
          email: reg.email,
          department: reg.department,
          codechef: reg.codechef || '-',
        }));

      setContestParticipants(participants);
      setNonParticipants(filteredNonParticipants);
      setStats(response.data.stats);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setContestLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setContestDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleDepartmentChange = (e) => {
    setSelectedDepartment(e.target.value);
  };

  const exportToExcel = (data, fileName) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  };

  const groupByDepartment = () => {
    const grouped = {};
    registrations.forEach((reg) => {
      if (!grouped[reg.department]) {
        grouped[reg.department] = [];
      }
      grouped[reg.department].push(reg);
    });
    return grouped;
  };

  const groupedRegistrations = groupByDepartment();
  const filteredRegistrations =
    selectedDepartment === 'all'
      ? groupedRegistrations
      : { [selectedDepartment]: groupedRegistrations[selectedDepartment] || [] };

  const exportStudentsToExcel = () => {
    const workbook = XLSX.utils.book_new();
    Object.entries(filteredRegistrations).forEach(([dept, students]) => {
      const data = students.map((student) => ({
        'Reg Number': student.regNumber,
        'Email': student.email,
        'LeetCode': student.leetcode || '-',
        'CodeChef': student.codechef || '-',
        'HackerEarth': student.hackerearth || '-',
        'HackerRank': student.hackerrank || '-',
      }));
      const worksheet = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(workbook, worksheet, dept.slice(0, 31));
    });
    XLSX.writeFile(
      workbook,
      selectedDepartment === 'all'
        ? 'department_wise_students.xlsx'
        : `${selectedDepartment}_students.xlsx`
    );
  };

  const exportContestToExcel = () => {
    const workbook = XLSX.utils.book_new();

    const participantData = contestParticipants.map((p) => ({
      'Reg Number': p.regNumber,
      'Email': p.email,
      'Department': p.department,
      'Username': p.codechef || '-',
      'Rating': p.rating || '-',
      'Rank': p.rank || '-',
    }));
    const participantSheet = XLSX.utils.json_to_sheet(participantData);
    XLSX.utils.book_append_sheet(workbook, participantSheet, 'Participated');

    const nonParticipantData = nonParticipants.map((np) => ({
      'Reg Number': np.regNumber,
      'Email': np.email,
      'Department': np.department,
      'Username': np.codechef || '-',
    }));
    const nonParticipantSheet = XLSX.utils.json_to_sheet(nonParticipantData);
    XLSX.utils.book_append_sheet(workbook, nonParticipantSheet, 'Not Participated');

    XLSX.writeFile(workbook, `${contestDetails.contestName}_participation.xlsx`);
  };

  if (loading) return <div className="loading">Loading data...</div>;
  if (error && activeTab === 'students') return <div className="error">Error: {error}</div>;

  return (
    <div className="admin-dashboard">
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>Admin Panel</h2>
        </div>
        <ul className="sidebar-menu">
          <li
            className={activeTab === 'students' ? 'active' : ''}
            onClick={() => setActiveTab('students')}
          >
            <FaUsers /> Registered Students
          </li>
          <li
            className={activeTab === 'participations' ? 'active' : ''}
            onClick={() => setActiveTab('participations')}
          >
            <FaTrophy /> Contest Participations
          </li>
        </ul>
      </div>

      <div className="main-content">
        <h1>Admin Dashboard</h1>

        {activeTab === 'students' && (
          <div className="dashboard-section">
            <div className="section-header">
              <h2>Registered Students ({registrations.length})</h2>
              <div className="filter-and-export">
                <select
                  value={selectedDepartment}
                  onChange={handleDepartmentChange}
                  className="department-select"
                >
                  <option value="all">All Departments</option>
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
                <div className="export-buttons">
                  <button onClick={exportStudentsToExcel}>
                    <FaFileExcel /> Export to Excel
                  </button>
                </div>
              </div>
            </div>
            {Object.keys(filteredRegistrations).length > 0 ? (
              Object.entries(filteredRegistrations).map(([dept, students]) => (
                <div key={dept} className="department-section">
                  <h3>{dept} ({students.length})</h3>
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>Reg Number</th>
                          <th>Email</th>
                          <th>LeetCode</th>
                          <th>CodeChef</th>
                          <th>HackerEarth</th>
                          <th>HackerRank</th>
                        </tr>
                      </thead>
                      <tbody>
                        {students.map((reg) => (
                          <tr key={reg._id}>
                            <td>{reg.regNumber}</td>
                            <td>{reg.email}</td>
                            <td>{reg.leetcode || '-'}</td>
                            <td>{reg.codechef || '-'}</td>
                            <td>{reg.hackerearth || '-'}</td>
                            <td>{reg.hackerrank || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))
            ) : (
              <p>No registered students found for the selected department.</p>
            )}
          </div>
        )}

        {activeTab === 'participations' && (
          <div className="dashboard-section">
            <h2>CodeChef Contest Participation</h2>
            <div className="filter-controls">
              <select
                name="platform"
                value={contestDetails.platform}
                onChange={handleInputChange}
              >
                <option value="codechef">CodeChef</option>
              </select>

              <input
                type="text"
                name="contestName"
                placeholder="Contest name"
                value={contestDetails.contestName}
                onChange={handleInputChange}
              />

              <select
                name="department"
                value={contestDetails.department}
                onChange={handleInputChange}
              >
                <option value="all">All Departments</option>
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

              <button onClick={fetchContestParticipants} disabled={contestLoading}>
                {contestLoading ? 'Fetching...' : 'Get Participants'}
              </button>
            </div>

            {error && <p className="error">{error}</p>}

            {(contestParticipants.length > 0 || nonParticipants.length > 0) && (
              <div className="results-section">
                <div className="stats">
                  <h3>Statistics</h3>
                  <p>Total Participants: {stats.totalParticipants}</p>
                  <p>Total Non-Participants: {nonParticipants.length}</p>
                  <p>
                    Average Rating:{' '}
                    {stats.averageRating !== 'N/A'
                      ? stats.averageRating
                      : 'Not available'}
                  </p>
                  <p>
                    Department Breakdown (Participants):{' '}
                    {Object.keys(stats.departmentBreakdown).length > 0
                      ? Object.entries(stats.departmentBreakdown)
                          .map(([dept, count]) => `${dept}: ${count}`)
                          .join(', ')
                      : 'None'}
                  </p>
                </div>

                <div className="export-buttons">
                  <button onClick={exportContestToExcel}>
                    <FaFileExcel /> Export to Excel
                  </button>
                </div>

                <h3>Participated ({contestParticipants.length})</h3>
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Reg Number</th>
                        <th>Email</th>
                        <th>Department</th>
                        <th>Username</th>
                        <th>Rating</th>
                        <th>Rank</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contestParticipants.map((p, i) => (
                        <tr key={i}>
                          <td>{p.regNumber}</td>
                          <td>{p.email}</td>
                          <td>{p.department}</td>
                          <td>{p.codechef || '-'}</td>
                          <td>{p.rating || '-'}</td>
                          <td>{p.rank || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <h3>Not Participated ({nonParticipants.length})</h3>
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Reg Number</th>
                        <th>Email</th>
                        <th>Department</th>
                        <th>Username</th>
                      </tr>
                    </thead>
                    <tbody>
                      {nonParticipants.map((np, i) => (
                        <tr key={i}>
                          <td>{np.regNumber}</td>
                          <td>{np.email}</td>
                          <td>{np.department}</td>
                          <td>{np.codechef || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {contestParticipants.length === 0 && nonParticipants.length === 0 && !contestLoading && !error && (
              <p>No data available for the specified contest and filters.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;