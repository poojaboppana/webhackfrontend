import './App.css';
import Register from './Components/Register.js';
import Login from './Components/Login.js'; 
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './Components/Dashboard.js'; 
import Home from './Components/Home.js'; 
import Contact from './Components/Contact.js'; 
import About from './Components/About.js'; 
import ProfilePage from './Components/ProfilePage.js';
import AdminDashboard from './Components/AdminDashboard.js'; 
function App() {
  return (
    <BrowserRouter>
   
      <div className="App">
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Home />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/student-dashboard" element={<Dashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
