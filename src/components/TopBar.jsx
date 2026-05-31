import { useState, useRef, useEffect } from 'react';
import { Bell, Settings, User } from 'lucide-react';
import '../styles/TopBar.css';

const TopBar = ({ title, icon, notifications = [] }) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  
  const settingsRef = useRef(null);
  const notifRef = useRef(null);

  // Close dropdowns if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setIsSettingsOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const hasNotifications = notifications.length > 0;

  return (
    <header className="topbar">
      <div className="topbar-left">
        <span className="topbar-icon">{icon}</span>
        <h1 className="topbar-title">{title}</h1>
      </div>
      
      <div className="topbar-right">
        
        {/* Notification Bell with Dropdown */}
        <div className="dropdown-wrapper" ref={notifRef}>
          <button 
            className="action-icon" 
            aria-label="Notifications"
            onClick={() => {
              setIsNotifOpen(!isNotifOpen);
              setIsSettingsOpen(false); // Close settings if open
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

        {/* Settings Cog with Dropdown */}
        <div className="dropdown-wrapper" ref={settingsRef}>
          <button 
            className="action-icon" 
            aria-label="Settings"
            onClick={() => {
              setIsSettingsOpen(!isSettingsOpen);
              setIsNotifOpen(false); // Close notifs if open
            }}
          >
            <Settings size={24} strokeWidth={2} />
          </button>

          {isSettingsOpen && (
            <div className="popup-dropdown">
              <div className="dropdown-header">Quick Settings</div>
              <span className="dropdown-placeholder">
                Settings module in development...
              </span>
            </div>
          )}
        </div>
        
        {/* User Profile */}
        <button className="action-icon" aria-label="User Profile">
          <User size={24} strokeWidth={2} />
        </button>
      </div>
    </header>
  );
};

export default TopBar;