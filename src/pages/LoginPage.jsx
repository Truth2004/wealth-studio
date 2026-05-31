import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFinancials } from '../context/FinancialContext';
import '../styles/LoginPage.css'; 

const LoginPage = () => {
  const navigate = useNavigate();
  
  // Bring in the update function from our global context
  const { updateFinancials } = useFinancials(); 
  
  // Local state to track what the user is typing
  const [usernameInput, setUsernameInput] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    
    // Save the typed name to our global context! (Fallback to 'Guest' if empty)
    updateFinancials({ username: usernameInput || 'Guest' });
    

    navigate('/money-snapshot');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">Welcome Back</h1>
        <p className="login-subtitle">Sign in to your financial sandbox.</p>
        
        <form className="login-form" onSubmit={handleLogin}>
          <input 
            type="text" 
            className="login-input" 
            placeholder="Username (e.g., Themba)" 
            value={usernameInput} // Link the input to the local state
            onChange={(e) => setUsernameInput(e.target.value)} // Update state as people type
            required
          />
          <input 
            type="password" 
            className="login-input" 
            placeholder="Password" 
            required
          />
          
          <button type="submit" className="login-button">
            Log In
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;