import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import '../styles/BackToTop.css';

const BackToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Target your explicit dashboard scroll shell instead of window
    const mainContent = document.querySelector('.main-content');
    if (!mainContent) return;

    const toggleVisibility = () => {
      if (mainContent.scrollTop > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    mainContent.addEventListener('scroll', toggleVisibility);
    return () => mainContent.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
      mainContent.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  };

  return (
    <button 
      className={`back-to-top ${isVisible ? 'back-to-top-visible' : ''}`}
      onClick={scrollToTop}
      aria-label="Back to top"
    >
      <ArrowUp size={20} />
    </button>
  );
};

export default BackToTop;