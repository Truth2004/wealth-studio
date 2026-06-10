import { useState, useRef, useEffect } from 'react';
import { Bell, Settings, User, RotateCcw, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFinancials } from '../context/FinancialContext'; // Bring in context for the profile data
import '../styles/TopBar.css';

const TopBar = ({ title, icon, notifications = [] }) => {
  const navigate = useNavigate();
  const { financials } = useFinancials(); // Access global state
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false); // New state for profile
  
  const settingsRef = useRef(null);
  const notifRef = useRef(null);
  const profileRef = useRef(null); // New ref for profile

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setIsSettingsOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const hasNotifications = notifications.length > 0;

  // === SETTINGS LOGIC ===
  const handleResetData = () => {
    if (window.confirm("Are you sure you want to reset all your financial data? This cannot be undone.")) {
      localStorage.removeItem('nextgen_financials');
      navigate('/');
      window.location.reload(); 
    }
  };

  // === PROFILE LOGIC ===
  const handleSignOut = () => {
    // Simply navigates back to the gateway. Data persists in localStorage!
    navigate('/');
  };

  const getTrackName = (trackId) => {
    if (trackId === 'debt-free') return 'The Debt Free Starter';
    if (trackId === 'property-seeker') return 'The Property Seeker';
    if (trackId === 'global-investor') return 'The Global Investor';
    return 'No Track Selected';
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <span className="topbar-icon">{icon}</span>
        <h1 className="topbar-title">{title}</h1>
      </div>
      
      <div className="topbar-right">
        
        {/* Notification Bell */}
        <div className="dropdown-wrapper" ref={notifRef}>
          <button 
            className="action-icon" 
            aria-label="Notifications"
            onClick={() => {
              setIsNotifOpen(!isNotifOpen);
              setIsSettingsOpen(false);
              setIsProfileOpen(false);
            }}
          >
            <Bell size={24} strokeWidth={2} />
            {hasNotifications && <span className="notification-badge"></span>}
          </button>

          {isNotifOpen && (
            <div className="popup-dropdown">
              <div className="dropdown-header">Simulation Alerts</div>
              {hasNotifications ? (
                <div className="notif-list">
                  {notifications.map((notif, idx) => (
                    <div key={idx} className="notif-item">
                      <span className="notif-title">{notif.title}</span>
                      <span className="notif-message">{notif.message}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="notif-empty">No active alerts.</div>
              )}
            </div>
          )}
        </div>

        {/* Settings Cog */}
        <div className="dropdown-wrapper" ref={settingsRef}>
          <button 
            className="action-icon" 
            aria-label="Settings"
            onClick={() => {
              setIsSettingsOpen(!isSettingsOpen);
              setIsNotifOpen(false);
              setIsProfileOpen(false);
            }}
          >
            <Settings size={24} strokeWidth={2} />
          </button>

          {isSettingsOpen && (
            <div className="popup-dropdown settings-dropdown">
              <div className="dropdown-header">Studio Settings</div>
              <div className="settings-list">
                <div className="settings-info-text">
                  Manage your sandbox environment data here.
                </div>
                <button className="reset-data-btn" onClick={handleResetData}>
                  <RotateCcw size={16} /> Reset All Studio Data
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* User Profile */}
        <div className="dropdown-wrapper" ref={profileRef}>
          <button 
            className="action-icon" 
            aria-label="User Profile"
            onClick={() => {
              setIsProfileOpen(!isProfileOpen);
              setIsSettingsOpen(false);
              setIsNotifOpen(false);
            }}
          >
            <User size={24} strokeWidth={2} />
          </button>

          {isProfileOpen && (
            <div className="popup-dropdown profile-dropdown">
              <div className="profile-header-info">
                <div className="profile-avatar-circle">
                  {financials.username ? financials.username.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="profile-text-group">
                  <span className="profile-name">{financials.username || 'Studio Guest'}</span>
                  <span className="profile-role">NextGen Architect</span>
                </div>
              </div>
              
              <div className="profile-track-section">
                <span className="profile-track-label">Active Strategy</span>
                <span className="profile-track-value">{getTrackName(financials.activeTrack)}</span>
              </div>

              <button className="sign-out-btn" onClick={handleSignOut}>
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};

export default TopBar;