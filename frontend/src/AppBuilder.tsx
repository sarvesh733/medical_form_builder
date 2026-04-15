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
import { fetchScanEvent, fetchScanEventHistory, saveScanEventData, type ScanEventHistoryItem } from './api/scanEvents';

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
  const [historyRows, setHistoryRows] = useState<ScanEventHistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const eventId = searchParams.get('eventId');
  const templateIdFromUrl = searchParams.get('templateId');
  const hasEventContext = Boolean(eventId);

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
        setFormValues(values);
        setReportStatus(`Loaded event ${event.event_id}`);
      })
      .catch((error) => {
        console.error('Failed to load scan event:', error);
        setReportStatus(error instanceof Error ? error.message : 'Failed to load scan event');
      });
  }, [eventId, setActiveTemplate, setFormValues]);

  useEffect(() => {
    if (!eventId) {
      return;
    }

    setIsLoadingHistory(true);
    fetchScanEventHistory(eventId)
      .then((rows) => {
        setHistoryRows(rows);
      })
      .catch((error) => {
        console.error('Failed to load scan event history:', error);
      })
      .finally(() => {
        setIsLoadingHistory(false);
      });
  }, [eventId]);

  const handleSaveReport = async () => {
    if (!eventId) {
      return;
    }

    setIsSavingReport(true);
    setReportStatus(null);
    try {
      await saveScanEventData(eventId, reportPayload);
      setReportStatus(`Saved report data for event ${eventId}`);
      const rows = await fetchScanEventHistory(eventId);
      setHistoryRows(rows);
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
        <Navbar onTogglePreview={() => {}} isPreview={false} />

        {hasEventContext && (
          <div className="px-6 py-3 border-b border-slate-200 dark:border-white/10 bg-amber-50 dark:bg-amber-900/20 grid gap-3 md:grid-cols-[1fr_auto] md:items-start">
            <div>
              <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">Scan Event Mode: {eventId}</p>
              <p className="text-xs text-amber-600 dark:text-amber-200">Fill form values and save report JSON for this event.</p>
              {reportStatus && <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{reportStatus}</p>}
            </div>
            <button
              onClick={handleSaveReport}
              disabled={isSavingReport}
              className="px-4 py-2 rounded-lg bg-amber-500 text-slate-900 font-bold text-xs uppercase tracking-wider disabled:opacity-60"
            >
              {isSavingReport ? 'Saving...' : 'Save Report Data'}
            </button>

            <div className="md:col-span-2 rounded-lg border border-amber-300/40 bg-white/70 dark:bg-slate-900/40 px-3 py-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-200">Edit Audit Trail</p>
                <button
                  onClick={async () => {
                    if (!eventId) return;
                    setIsLoadingHistory(true);
                    try {
                      const rows = await fetchScanEventHistory(eventId);
                      setHistoryRows(rows);
                    } finally {
                      setIsLoadingHistory(false);
                    }
                  }}
                  className="text-[10px] uppercase tracking-wider text-amber-700 dark:text-amber-300"
                >
                  Refresh
                </button>
              </div>

              {isLoadingHistory ? (
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2">Loading history...</p>
              ) : historyRows.length === 0 ? (
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2">No edits recorded yet. First save creates current state, second save onwards creates history records.</p>
              ) : (
                <div className="mt-2 max-h-32 overflow-y-auto space-y-1 pr-1">
                  {historyRows.slice(0, 10).map((row) => (
                    <div key={row.history_id} className="text-[11px] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10 rounded px-2 py-1 bg-white/60 dark:bg-slate-950/40">
                      <div className="font-semibold">
                        {row.editor?.name ?? row.edited_by} ({row.edited_role}) at {new Date(row.edited_at).toLocaleString()}
                      </div>
                      <div className="opacity-80">
                        Old: {JSON.stringify(row.old_data)}
                      </div>
                      <div className="opacity-80">
                        New: {JSON.stringify(row.new_data)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
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
