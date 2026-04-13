import React from 'react';
import { motion } from 'framer-motion';
import { Moon } from 'lucide-react';
import { useStore } from '../store';

const ThemeToggle: React.FC = () => {
  const { darkMode, setDarkMode } = useStore();

  return (
    <div 
      onClick={() => setDarkMode(!darkMode)}
      className="w-16 h-8 bg-slate-200 dark:bg-slate-800 rounded-full p-1 cursor-pointer flex items-center relative transition-colors duration-500 shadow-inner"
    >
      <div className="absolute left-2 text-slate-400 dark:text-medical-primary">
        <Moon size={14} />
      </div>
      
      <motion.div 
        animate={{ x: darkMode ? 32 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="w-6 h-6 bg-white rounded-full shadow-md z-10"
      />
    </div>
  );
};

export default ThemeToggle;
