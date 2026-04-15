import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Layers, Settings, ChevronRight, Database, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { useStore } from './store';
import { MedicalTemplate } from './types';
import { DEFAULT_SCHEMAS } from './schemas';
import Sidebar from './components/Sidebar';
import Canvas from './components/Canvas';
import PropertiesPanel from './components/PropertiesPanel';
import Navbar from './components/Navbar';
import PrintLayout from './components/PrintLayout';
import { fetchScanEvent, saveScanEventData } from './api/scanEvents';

type EventPatient = {
  patient_id: string;
  pid: string;
  name: string;
  phone: string;
  address: string;
  age: number;
  dob: string;
  marital_status: string;
  gender: string;
  state: string;
  country: string;
  aadhar_number: string;
  email: string;
};

type TemplateFieldMeta = {
  standard_key: string;
  field_name?: string;
  field_type?: string;
};

const applyPatientPrefill = (
  existingValues: Record<string, any>,
  patient: EventPatient | undefined,
  templateFields: TemplateFieldMeta[],
) => {
  if (!patient) {
    return existingValues;
  }

  const next = { ...existingValues };
  const keyToValue = (key: string, label: string) => {
    const normalized = `${key} ${label}`.toLowerCase();

    if (normalized.includes('phone') || normalized.includes('mobile') || normalized.includes('contact')) return patient.phone;
    if (normalized.includes('aadhar')) return patient.aadhar_number;
    if (normalized.includes('email')) return patient.email;
    if (normalized.includes('address')) return patient.address;
    if (normalized.includes('marital')) return patient.marital_status;
    if (normalized.includes('gender') || normalized.includes('sex')) return patient.gender;
    if (normalized.includes('country')) return patient.country;
    if (normalized.includes('state')) return patient.state;
    if (normalized.includes('date of birth') || normalized.includes('dob')) return patient.dob;
    if (normalized.includes('age')) return String(patient.age);
    if (normalized.includes('patient id') || normalized.includes('patient_id') || normalized.includes('pid') || normalized.includes('uhid') || normalized.includes('uid')) return patient.pid;
    if (normalized.includes('patient name') || normalized.includes('name') || normalized.includes('ptsname')) return patient.name;

    return undefined;
  };

  templateFields.forEach((field) => {
    const fieldId = field.standard_key;
    const candidateValue = keyToValue(field.standard_key, field.field_name ?? '');
    if (candidateValue === undefined) {
      return;
    }

    const current = next[fieldId];
    const isEmpty =
      current === undefined ||
      current === null ||
      (typeof current === 'string' && current.trim() === '');

    if (isEmpty) {
      next[fieldId] = candidateValue;
    }
  });

  return next;
};

const AppBuilder: React.FC = () => {
  const [searchParams] = useSearchParams();
  const {
    activeTemplate,
    setActiveTemplate,
    loadTemplatesFromApi,
    formValues,
    setFormValues,
  } = useStore();
  const [isSavingReport, setIsSavingReport] = useState(false);
  const [reportStatus, setReportStatus] = useState<string | null>(null);
  const [eventPatient, setEventPatient] = useState<EventPatient | null>(null);

  const eventId = searchParams.get('eventId');
  const templateIdFromUrl = searchParams.get('templateId');
  const hasEventContext = Boolean(eventId);
  const isTemplateLocked = hasEventContext || Boolean(activeTemplate?.persisted);

  const reportPayload = useMemo(() => formValues, [formValues]);

  useEffect(() => {
    loadTemplatesFromApi().catch((error) => {
      console.error('Failed to load templates from backend:', error);
    });
  }, [loadTemplatesFromApi]);

  useEffect(() => {
    if (!templateIdFromUrl) {
      return;
    }

    setActiveTemplate(templateIdFromUrl);
  }, [setActiveTemplate, templateIdFromUrl]);

  useEffect(() => {
    if (!eventId) {
      return;
    }

    fetchScanEvent(eventId)
      .then((event) => {
        if (event.template_id) {
          setActiveTemplate(event.template_id);
        }

        const values = (event.data?.data ?? {}) as Record<string, any>;
        const templateFields = (event.template?.fields ?? []).map((field) => ({
          standard_key: field.standard_key,
          field_name: field.field_name,
          field_type: field.field_type,
        }));
        const mergedValues = applyPatientPrefill(values, event.patient, templateFields);

        setEventPatient(event.patient ?? null);
        setFormValues(mergedValues);
        setReportStatus(`Loaded event ${event.event_id}`);
      })
      .catch((error) => {
        console.error('Failed to load scan event:', error);
        setReportStatus(error instanceof Error ? error.message : 'Failed to load scan event');
      });
  }, [eventId, setActiveTemplate, setFormValues]);

  const handleSaveReport = async () => {
    if (!eventId) {
      return;
    }

    setIsSavingReport(true);
    setReportStatus(null);
    try {
      await saveScanEventData(eventId, reportPayload);
      setReportStatus(`Saved report data for event ${eventId}`);
    } catch (error) {
      console.error('Failed to save scan event data:', error);
      setReportStatus(error instanceof Error ? error.message : 'Failed to save report data');
    } finally {
      setIsSavingReport(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-medical-dark text-slate-800 dark:text-slate-200 selection:bg-medical-primary/30 transition-colors duration-300">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-medical-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-medical-accent/10 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]" />
      </div>

      <div className="relative z-10 flex flex-col h-screen">
        <Navbar onTogglePreview={() => {}} isPreview={false} lockTemplateEditing={isTemplateLocked} />

        {hasEventContext && (
          <div className="px-6 py-3 border-b border-slate-200 dark:border-white/10 bg-amber-50 dark:bg-amber-900/20 grid gap-3 md:grid-cols-[1fr_auto] md:items-start">
            <div>
              <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">Scan Event Mode: {eventId}</p>
              <p className="text-xs text-amber-600 dark:text-amber-200">Fill form values and save report JSON for this event.</p>
              {eventPatient && (
                <p className="text-xs text-slate-700 dark:text-slate-300 mt-1">
                  Patient: <span className="font-semibold">{eventPatient.name}</span> (PID: {eventPatient.pid}) | Phone: {eventPatient.phone}
                </p>
              )}
              {reportStatus && <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{reportStatus}</p>}
            </div>
            <button
              onClick={handleSaveReport}
              disabled={isSavingReport}
              className="px-4 py-2 rounded-lg bg-amber-500 text-slate-900 font-bold text-xs uppercase tracking-wider disabled:opacity-60"
            >
              {isSavingReport ? 'Saving...' : 'Save Report Data'}
            </button>
          </div>
        )}
        
        <main className="flex flex-1 overflow-hidden">
          {!activeTemplate ? (
            <Dashboard onNew={(template) => {
              useStore.setState((state) => ({
                activeTemplate: template,
                templates: [template, ...state.templates.filter((t) => t.id !== template.id)],
              }));
            }} />
          ) : (
            <>
              {!isTemplateLocked && <Sidebar className="hidden lg:flex" />}
              <div className="flex-1 overflow-y-auto custom-scrollbar bg-white/[0.02] border-x border-slate-200 dark:border-white/5">
                <Canvas isLocked={isTemplateLocked} />
              </div>
              {!isTemplateLocked && <PropertiesPanel className="hidden xl:flex" />}
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
    { name: '2nd and 3rd trimester OB USG', icon: '👶', description: 'Advanced growth & Doppler assessment' },
    { name: 'OB-USG-Early Pregnancy', icon: '🌱', description: 'Early gestation viability & biometry' },
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
      persisted: false,
      sections: base.sections || []
    };
    onNew(newTemplate);
  };

  return (
    <div className="flex-1 flex flex-col items-center p-8 overflow-y-auto custom-scrollbar">
      <div className="my-auto w-full flex flex-col items-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-6xl font-black mb-4 bg-gradient-to-r from-medical-primary via-medical-secondary dark:via-white to-medical-accent bg-clip-text text-transparent uppercase tracking-tighter py-2">
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
    </div>
  );
}

export default AppBuilder;
