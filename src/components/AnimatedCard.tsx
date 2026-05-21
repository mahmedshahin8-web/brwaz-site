import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const AnimatedCard: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void }> = ({ children, className = "", onClick }) => {
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = () => {
    setIsClicked(true);
    if (onClick) onClick();
    setTimeout(() => {
      setIsClicked(false);
    }, 1000);
  };

  return (
    <motion.div
      whileTap={{ scale: 0.98, transition: { duration: 0.05 } }}
      onClick={handleClick}
      className={`p-4 bg-white border backdrop-blur-md transition-all duration-500 rounded-none ${isClicked ? 'border-amber-500' : 'border-gray-200'} hover:border-gray-300 ${className}`}
    >
      {children}
    </motion.div>
  );
};
