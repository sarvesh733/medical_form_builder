import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Activity, Eye, Save, Database, Bell, Settings, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStore } from '../store';
import ThemeToggle from './ThemeToggle';
import { createPatient, fetchPatients, type Patient } from '../api/patients';
import { getCurrentUser } from '../auth';

interface NavbarProps {
  onTogglePreview: () => void;
  isPreview: boolean;
  lockTemplateEditing?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ onTogglePreview, isPreview, lockTemplateEditing = false }) => {
  const user = getCurrentUser();
  const canSaveTemplate = user?.role === 'doctor' || user?.role === 'admin';
  const canCreatePatient = false;
  const { setActiveTemplate, activeTemplate, saveActiveTemplateToApi, templates } = useStore();
  const savedTemplates = templates.filter((template) => template.persisted);
  const [showSavedModal, setShowSavedModal] = useState(false);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [patientName, setPatientName] = useState('');
  const [patientList, setPatientList] = useState<Patient[]>([]);

  const openPatientModal = async () => {
    setShowPatientModal(true);
    try {
      const patients = await fetchPatients();
      setPatientList(patients);
    } catch (error) {
      console.error('Failed to fetch patients:', error);
    }
  };

  const handleCreatePatient = async () => {
    if (!patientName.trim()) {
      alert('Patient name is required.');
      return;
    }

    try {
      const now = Date.now();
      const created = await createPatient({
        pid: `PID-${now}`,
        name: patientName.trim(),
        phone: 'NA',
        address: 'NA',
        age: 0,
        dob: new Date().toISOString(),
        marital_status: 'unknown',
        gender: 'unknown',
        state: 'unknown',
        country: 'unknown',
        aadhar_number: `TEMP-${now}`,
        email: `temp-${now}@local.dev`,
      });
      setPatientName('');
      setPatientList((prev) => [created, ...prev]);
      alert('Patient created successfully.');
    } catch (error) {
      console.error('Failed to create patient:', error);
      alert('Failed to create patient.');
    }
  };

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
          className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-neon-glow group overflow-hidden border border-medical-primary/20"
        >
          <img src="/logo.png" alt="Mediscan Logo" className="w-10 h-10 object-contain group-hover:scale-110 transition-transform" />
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

        {canSaveTemplate && !lockTemplateEditing && (
          <button 
            onClick={async () => {
              if (!activeTemplate) {
                return;
              }

              try {
                await saveActiveTemplateToApi();
                alert('Template saved to backend database.');
              } catch (error) {
                console.error('Failed to save template:', error);
                alert('Failed to save template to backend. Check backend logs.');
              }
            }}
            disabled={!activeTemplate}
            className="flex items-center gap-2 px-6 py-2.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 hover:border-slate-300 dark:hover:border-white/20 transition-all uppercase tracking-widest leading-none"
          >
            <Save size={16} className="text-medical-primary" /> SAVE
          </button>
        )}

        <button
          onClick={() => setShowSavedModal(true)}
          className="flex items-center gap-2 px-6 py-2.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 hover:border-slate-300 dark:hover:border-white/20 transition-all uppercase tracking-widest leading-none"
        >
          SAVED_TEMPLATES
        </button>

        {canCreatePatient && (
          <button
            onClick={openPatientModal}
            className="flex items-center gap-2 px-6 py-2.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 hover:border-slate-300 dark:hover:border-white/20 transition-all uppercase tracking-widest leading-none"
          >
            CREATE_PATIENT
          </button>
        )}

        {!lockTemplateEditing && (
          <button className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-medical-primary to-medical-secondary rounded-xl text-xs font-black text-slate-900 dark:text-medical-dark hover:shadow-neon-glow hover:scale-105 transition-all uppercase tracking-tighter shadow-lg shadow-medical-primary/20 leading-none">
            <Database size={16} /> DEPLOY_SCHEMA
          </button>
        )}

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

      {showSavedModal && createPortal(
        <div className="fixed inset-0 z-[200] bg-black/40 flex items-center justify-center p-4" onClick={() => setShowSavedModal(false)}>
          <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Saved Templates</h3>
              <button className="text-slate-500 hover:text-slate-900 dark:hover:text-white" onClick={() => setShowSavedModal(false)}>Close</button>
            </div>
            <div className="space-y-2 max-h-[340px] overflow-y-auto">
              {savedTemplates.length === 0 ? (
                <p className="text-sm text-slate-500">No templates found.</p>
              ) : (
                savedTemplates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => {
                      setActiveTemplate(template.id);
                      setShowSavedModal(false);
                    }}
                    className="w-full text-left p-3 rounded-xl border border-slate-200 dark:border-white/10 hover:border-medical-primary/50 hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
                  >
                    <div className="font-semibold text-slate-900 dark:text-white">{template.name}</div>
                    <div className="text-xs text-slate-500">{template.scanType} • v{template.version}</div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>,
        document.body,
      )}

      {showPatientModal && createPortal(
        <div className="fixed inset-0 z-[200] bg-black/40 flex items-center justify-center p-4" onClick={() => setShowPatientModal(false)}>
          <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Create Patient</h3>
              <button className="text-slate-500 hover:text-slate-900 dark:hover:text-white" onClick={() => setShowPatientModal(false)}>Close</button>
            </div>
            <div className="flex gap-2 mb-4">
              <input
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="Enter patient name"
                className="flex-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
              <button
                onClick={handleCreatePatient}
                className="px-4 py-2 rounded-lg bg-medical-primary text-white font-semibold"
              >
                Add
              </button>
            </div>
            <div className="space-y-2 max-h-[320px] overflow-y-auto">
              {patientList.length === 0 ? (
                <p className="text-sm text-slate-500">No patients found.</p>
              ) : (
                patientList.map((patient) => (
                  <div key={patient.patient_id} className="p-3 rounded-xl border border-slate-200 dark:border-white/10">
                    <div className="font-semibold text-slate-900 dark:text-white">{patient.name}</div>
                    <div className="text-xs text-slate-500">{patient.patient_id}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>,
        document.body,
      )}
    </nav>
  );
};

export default Navbar;
