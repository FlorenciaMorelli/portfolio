import React, { useEffect, useState } from 'react';
import './ScrollToTop.css';

const ScrollToTop = () => {
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  const handleVisibleButton = () => {
    setShowScrollToTop(window.scrollY > 300);
  };

  const handleScrollUp = () => {
    window.scrollTo({ left: 0, top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    window.addEventListener('scroll', handleVisibleButton);
    return () => {
      window.removeEventListener('scroll', handleVisibleButton);
    };
  }, []);

  return (
    <div>
      {showScrollToTop && (
        <div className="scrollToTop" onClick={handleScrollUp}>
          <span className="material-symbols-outlined" id="scrollUp">
            arrow_upward
          </span>
        </div>
      )}
    </div>
  );
};

export default ScrollToTop;