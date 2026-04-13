import React, { useState } from 'react';
import { Layout, Plus, FileJson, Layers, Settings, Eye, ChevronRight, Save, Database, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from './store';
import { MedicalTemplate } from './types';
import { DEFAULT_SCHEMAS } from './schemas';
import Sidebar from './components/Sidebar';
import Canvas from './components/Canvas';
import PropertiesPanel from './components/PropertiesPanel';
import Navbar from './components/Navbar';
import PrintLayout from './components/PrintLayout';

const App: React.FC = () => {
  const { activeTemplate, setActiveTemplate } = useStore();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-medical-dark text-slate-800 dark:text-slate-200 selection:bg-medical-primary/30 transition-colors duration-300">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-medical-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-medical-accent/10 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]" />
      </div>

      <div className="relative z-10 flex flex-col h-screen">
        <Navbar onTogglePreview={() => {}} isPreview={false} />
        
        <main className="flex flex-1 overflow-hidden">
          {!activeTemplate ? (
            <Dashboard onNew={(template) => {
              useStore.setState({ activeTemplate: template, templates: [template] });
            }} />
          ) : (
            <>
              <Sidebar className="hidden lg:flex" />
              <div className="flex-1 overflow-y-auto custom-scrollbar bg-white/[0.02] border-x border-slate-200 dark:border-white/5">
                <Canvas />
              </div>
              <PropertiesPanel className="hidden xl:flex" />
            </>
          )}
        </main>

        <footer className="h-8 glass border-t border-slate-200 dark:border-white/10 flex items-center justify-between px-4 text-[10px] uppercase tracking-wider text-slate-500 font-mono">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><Database size={12} className="text-medical-primary" /> System: Online</span>
            <span className="flex items-center gap-1"><Layers size={12} /> Version: 2.4.0-Alpha</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-medical-neon"><Settings size={12} /> Syncing...</span>
            <span className="flex items-center gap-1 cursor-pointer hover:text-slate-900 dark:hover:text-white" onClick={() => setActiveTemplate(null)}><User size={12} /> Dashboard</span>
          </div>
        </footer>
      </div>

      {/* Persistent Hidden Print Region */}
      <PrintLayout />
    </div>
  );
};

interface DashboardProps {
  onNew: (template: MedicalTemplate) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNew }) => {
  const types = [
    { name: 'Abdomen / Pelvis', icon: '腹', description: 'Comprehensive torso & pelvic scans' },
    { name: 'Fetal ECO', icon: '👶', description: 'Fetal echocardiography & growth' },
    { name: 'Medical History', icon: '📋', description: 'External scans & history' },
    { name: 'OB Case History', icon: '🤰', description: 'Obstetric specialized tracking (Full)' },
    { name: 'OB Case History + FTS', icon: '🧪', description: 'First Trimester Screening & ART' },
    { name: 'Whole Abdomen USG', icon: '🔍', description: 'Full USG scan profile' },
  ];

  const handleSelect = (typeName: string) => {
    const base = DEFAULT_SCHEMAS[typeName];
    const newTemplate: MedicalTemplate = {
      id: Math.random().toString(36).substr(2, 9),
      name: base.name || `New ${typeName} Template`,
      scanType: base.scanType as any,
      version: '1.0.0',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'Dr. Administrator',
      sections: base.sections || []
    };
    onNew(newTemplate);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 overflow-y-auto custom-scrollbar">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-6xl font-black mb-4 bg-gradient-to-r from-medical-primary via-medical-secondary dark:via-white to-medical-accent bg-clip-text text-transparent uppercase tracking-tighter">
          Template Studio
        </h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-lg mx-auto font-medium">
          Create sophisticated, AI-enhanced medical reporting templates with our advanced schema builder.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl w-full">
        {types.map((type, idx) => (
          <motion.button
            key={type.name}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ scale: 1.02, y: -5 }}
            onClick={() => handleSelect(type.name)}
            className="glass transition-all duration-300 hover:bg-white dark:hover:bg-white/[0.08] hover:border-medical-primary/50 p-6 rounded-3xl text-left flex flex-col gap-4 group relative overflow-hidden shadow-xl"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
               <span className="text-6xl font-bold">{type.icon}</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-medical-primary/10 flex items-center justify-center border border-medical-primary/20 group-hover:border-medical-primary transition-all">
              <Plus className="text-medical-primary" size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white group-hover:text-medical-primary transition-colors">{type.name}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">{type.description}</p>
            </div>
            <div className="mt-4 flex items-center text-xs font-black text-medical-primary opacity-0 group-hover:opacity-100 transition-all uppercase tracking-widest">
              CREATE_STUDY <ChevronRight size={14} className="ml-1" />
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

export default App;
