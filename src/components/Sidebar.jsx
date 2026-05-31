import { NavLink } from 'react-router-dom';
import { Database, TrendingUp, FlaskConical, LogOut, Headset } from 'lucide-react';
import '../styles/Sidebar.css';

const Sidebar = () => {
  return (
    <nav className="sidebar">
      <div className="sidebar-logo">
        <h2>NextGen Wealth Studio</h2>
      </div>
      
      <div className="nav-links">
        <NavLink to="/money-snapshot" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
          <Database size={20} className="nav-icon" />
          Money Snapshot
        </NavLink>
        <NavLink to="/strategy-tracks" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
          <TrendingUp size={20} className="nav-icon" />
          Strategy Tracks
        </NavLink>
        <NavLink to="/simulation-lab" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
          <FlaskConical size={20} className="nav-icon" />
          Simulation Lab
        </NavLink>
      </div>

      <div className="bottom-links">
        <NavLink to="/" className="nav-item">
          <LogOut size={20} className="nav-icon" />
          Sign Out
        </NavLink>
        <NavLink to="/support" className="nav-item">
          <Headset size={20} className="nav-icon" />
          Support
        </NavLink>
      </div>
    </nav>
  );
};

export default Sidebar;