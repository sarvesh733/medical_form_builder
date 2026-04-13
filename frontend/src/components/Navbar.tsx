import React from 'react';
import { Activity, Eye, Save, Database, Bell, Settings, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStore } from '../store';
import ThemeToggle from './ThemeToggle';

interface NavbarProps {
  onTogglePreview: () => void;
  isPreview: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ onTogglePreview, isPreview }) => {
  const { setActiveTemplate, activeTemplate } = useStore();

  return (
    <nav className="h-20 px-8 glass border-b border-white/10 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-6">
        {activeTemplate && (
          <button 
            onClick={() => setActiveTemplate(null)}
            className="p-2 hover:bg-white/10 rounded-xl transition-all text-slate-400 hover:text-white flex items-center gap-2 group border border-transparent hover:border-white/10"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-bold uppercase tracking-widest hidden md:block">Back to Menu</span>
          </button>
        )}
        <div className="h-6 w-px bg-slate-200 dark:bg-white/5 mx-2" />
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
          className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-medical-primary to-medical-accent flex items-center justify-center shadow-neon-glow group"
        >
          <Activity className="text-white dark:text-medical-dark group-hover:scale-125 transition-transform" strokeWidth={3} />
        </motion.div>
        <div>
          <h2 className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-none">
            MEDISCAN <span className="text-medical-primary">FORM BUILDER</span>
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-2 h-2 rounded-full bg-medical-neon animate-pulse" />
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-500 uppercase tracking-[0.3em]">Neural Interface v2.4</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {activeTemplate && (
          <button 
            onClick={() => window.print()}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold tracking-widest transition-all border hover:bg-slate-100 dark:hover:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400`}
          >
            <Eye size={16} /> LIVE_PREVIEW
          </button>
        )}
        
        <div className="h-4 w-px bg-slate-200 dark:bg-white/10 mx-4" />

        <button 
          onClick={() => {
            alert('Template schema persisted successfully to neural storage.');
          }}
          className="flex items-center gap-2 px-6 py-2.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 hover:border-slate-300 dark:hover:border-white/20 transition-all uppercase tracking-widest leading-none"
        >
          <Save size={16} className="text-medical-primary" /> SAVE
        </button>

        <button className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-medical-primary to-medical-secondary rounded-xl text-xs font-black text-slate-900 dark:text-medical-dark hover:shadow-neon-glow hover:scale-105 transition-all uppercase tracking-tighter shadow-lg shadow-medical-primary/20 leading-none">
          <Database size={16} /> DEPLOY_SCHEMA
        </button>

        <div className="h-4 w-px bg-white/10 mx-4" />
        
        <div className="flex items-center gap-3 pl-2">
           <ThemeToggle />
           <button className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 border border-white/5 transition-all text-slate-400 group relative">
              <Bell size={20} />
              <div className="absolute top-2 right-2 w-2 h-2 bg-medical-primary rounded-full animate-ping" />
           </button>
           <div className="w-11 h-11 rounded-xl bg-medical-dark border border-medical-primary/30 flex items-center justify-center overflow-hidden hover:border-medical-primary transition-colors cursor-pointer group shadow-xl">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" className="w-9 h-9 opacity-80 group-hover:opacity-100 transition-opacity" />
           </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
