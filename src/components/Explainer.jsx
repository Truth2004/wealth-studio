import { useState, useEffect, useRef } from 'react';
import { HelpCircle } from 'lucide-react';

const Explainer = ({ term, explanation, isDarkTheme = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  // Close the popup if the user clicks anywhere outside of it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <span className="explainer-wrapper" ref={wrapperRef}>
      <span 
        className={`explainer-trigger ${isDarkTheme ? 'dark-theme' : ''}`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation(); 
          setIsOpen(!isOpen);
        }}
      >
        <span className="shimmer-text">{term}</span>
        <HelpCircle size={14} className="explainer-icon" />
      </span>
      
      {isOpen && (
        <div className="explainer-popup" onClick={(e) => e.stopPropagation()}>
          <div className="explainer-header">What is this?</div>
          <div className="explainer-body">{explanation}</div>
        </div>
      )}
    </span>
  );
};

export default Explainer;