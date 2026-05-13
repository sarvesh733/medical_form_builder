import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Activity, Eye, Save, Database, Bell, Settings, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStore } from '../store';
import ThemeToggle from './ThemeToggle';
import { createPatient, fetchPatients, type Patient } from '../api/patients';
import { getCurrentUser } from '../auth';
import { DEFAULT_SCHEMAS } from '../schemas';
import { MedicalTemplate } from '../types';

type AuditHistoryEntry = {
  history_id: string;
  old_data: Record<string, unknown>;
  new_data: Record<string, unknown>;
  edited_role: string;
  edited_at: string;
  editor?: {
    name: string;
    email: string;
    role: string;
  };
};

const getTemplateStructureSignature = (template: MedicalTemplate) => {
  return template.sections.map((section) => ({
    sectionId: section.id,
    fieldIds: section.fields.map((field) => field.id),
  }));
};

const hasAddedOrRemovedDefaultFields = (template: MedicalTemplate) => {
  if (template.persisted) {
    return false;
  }

  const defaultSchema = Object.values(DEFAULT_SCHEMAS).find((schema) => schema.scanType === template.scanType);
  if (!defaultSchema?.sections) {
    return false;
  }

  const baselineTemplate: MedicalTemplate = {
    id: 'baseline-default',
    name: defaultSchema.name ?? `${template.scanType} Template`,
    scanType: template.scanType,
    sections: defaultSchema.sections,
    version: defaultSchema.version ?? '1.0.0',
    createdAt: '',
    updatedAt: '',
    createdBy: '',
  };

  const current = getTemplateStructureSignature(template);
  const baseline = getTemplateStructureSignature(baselineTemplate);

  return JSON.stringify(current) !== JSON.stringify(baseline);
};

interface NavbarProps {
  onTogglePreview: () => void;
  isPreview: boolean;
  lockTemplateEditing?: boolean;
  hasEventContext?: boolean;
  eventId?: string | null;
  eventPatientName?: string | null;
  eventPatientPid?: string | null;
  eventPatientPhone?: string | null;
  reportStatus?: string | null;
  isSavingReport?: boolean;
  onSaveReport?: () => void;
  canEditReport?: boolean;
  eventHistory?: AuditHistoryEntry[];
}

const Navbar: React.FC<NavbarProps> = ({
  onTogglePreview,
  isPreview,
  lockTemplateEditing = false,
  hasEventContext = false,
  eventId = null,
  eventPatientName = null,
  eventPatientPid = null,
  eventPatientPhone = null,
  reportStatus = null,
  isSavingReport = false,
  onSaveReport,
  canEditReport = true,
  eventHistory = [],
}) => {
  const user = getCurrentUser();
  const canSaveTemplate = user?.role === 'doctor' || user?.role === 'admin';
  const canCreatePatient = false;
  const { setActiveTemplate, activeTemplate, saveActiveTemplateToApi, templates } = useStore();
  const showLocalBack = Boolean(activeTemplate) && !lockTemplateEditing;
  const savedTemplates = templates.filter((template) => template.persisted);
  const [showSavedModal, setShowSavedModal] = useState(false);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [patientName, setPatientName] = useState('');
  const [patientList, setPatientList] = useState<Patient[]>([]);

  const fieldLabelByKey = new Map<string, string>();
  if (activeTemplate) {
    activeTemplate.sections.forEach((section) => {
      section.fields.forEach((field) => {
        fieldLabelByKey.set(field.id, field.label);
      });
    });
  }

  const toReadableKey = (key: string) => key.replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim().replace(/\b\w/g, (ch) => ch.toUpperCase());

  const toAuditFieldLabel = (key: string) => {
    const exact = fieldLabelByKey.get(key);
    if (exact) {
      return exact;
    }

    const prefixMatch = Array.from(fieldLabelByKey.entries()).find(([standardKey]) => key.startsWith(`${standardKey}_`));
    if (prefixMatch) {
      const suffix = key.slice(prefixMatch[0].length + 1);
      return `${prefixMatch[1]} - ${toReadableKey(suffix)}`;
    }

    return toReadableKey(key);
  };

  const getChangedKeys = (entry: AuditHistoryEntry) => {
    const oldData = entry.old_data ?? {};
    const newData = entry.new_data ?? {};
    const keys = new Set([...Object.keys(oldData), ...Object.keys(newData)]);

    return Array.from(keys).filter((key) => {
      return JSON.stringify(oldData[key]) !== JSON.stringify(newData[key]);
    });
  };

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
        trimester: 'Early pregnancy',
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
    <nav className="builder-topbar sticky top-0 z-50 border-b border-white/10 glass">
      <div className="mx-auto flex w-full max-w-screen-2xl flex-col gap-3 px-3 py-3 sm:px-4 md:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        {/* Back Button - separate row on mobile/tablet */}
        {showLocalBack && (
          <button
            onClick={() => setActiveTemplate(null)}
            className="w-fit flex shrink-0 items-center gap-2 rounded-xl border border-transparent p-2 text-slate-500 transition-all hover:border-white/10 hover:bg-white/10 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          >
            <ArrowLeft size={20} className="transition-transform group-hover:-translate-x-1" />
            <span className="hidden text-xs font-black uppercase tracking-[0.12em] md:block">Back to Menu</span>
          </button>
        )}

        {/* Logo and Title - centered on mobile/tablet, left on desktop */}
        <div className="flex min-w-0 items-center justify-center gap-2 sm:gap-3 md:gap-4 lg:justify-start lg:gap-6">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 20, ease: 'linear' }}
            className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-medical-primary/20 bg-white shadow-neon-glow group sm:h-11 sm:w-11 md:h-12 md:w-12"
          >
            <img src="/logo.png" alt="Mediscan Logo" className="h-8 w-8 object-contain transition-transform group-hover:scale-110 sm:h-9 sm:w-9 md:h-10 md:w-10" />
          </motion.div>
          <div className="min-w-0 shrink">
            <h2 className="text-base font-black uppercase leading-none tracking-tight text-slate-900 dark:text-white sm:text-lg md:text-xl lg:text-2xl">
              MEDISCAN <span className="text-medical-primary">FORM BUILDER</span>
            </h2>
          </div>
        </div>

        <div className="builder-topbar-actions flex min-w-0 flex-wrap items-center gap-2 sm:gap-2.5 md:gap-3 lg:justify-end">
          {activeTemplate && (
            <button
              onClick={() => window.print()}
              className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-xl border border-slate-200 px-3 py-2 text-[10px] font-black tracking-[0.08em] text-slate-700 transition-all hover:bg-slate-100 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/5 sm:px-4 sm:text-xs md:px-4 md:text-[11px] lg:px-6 lg:text-xs"
            >
              <Eye size={16} /> LIVE_PREVIEW
            </button>
          )}

          {hasEventContext && (
            <button
              onClick={() => setShowAuditModal(true)}
              className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-xl border border-slate-200 px-3 py-2 text-[10px] font-black tracking-[0.08em] text-slate-800 transition-all hover:bg-slate-100 dark:border-white/10 dark:text-slate-100 dark:hover:bg-white/5 sm:px-4 sm:text-xs md:px-4 md:text-[11px] lg:text-xs"
            >
              <Activity size={16} className="text-medical-primary" /> AUDIT
            </button>
          )}

          {hasEventContext && canEditReport && (
            <button
              onClick={onSaveReport}
              disabled={isSavingReport}
              className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-xl border border-amber-500/50 bg-amber-500 px-3 py-2 text-[10px] font-black tracking-[0.08em] text-slate-900 transition-all hover:bg-amber-400 disabled:opacity-60 sm:px-4 sm:text-xs md:px-4 md:text-[11px] lg:text-xs"
            >
              <Save size={16} /> {isSavingReport ? 'SAVING...' : 'SAVE REPORT DATA'}
            </button>
          )}

          <div className="h-4 w-px bg-slate-200 dark:bg-white/10 mx-2 sm:mx-3 md:mx-4" />

          {canSaveTemplate && !lockTemplateEditing && (
            <button
              onClick={async () => {
                if (!activeTemplate) {
                  return;
                }

                try {
                  let customName: string | undefined;

                  if (hasAddedOrRemovedDefaultFields(activeTemplate)) {
                    const enteredName = window.prompt(
                      'You changed default fields. Enter a custom template name before saving:',
                      activeTemplate.name,
                    );

                    if (enteredName === null) {
                      return;
                    }

                    const trimmedName = enteredName.trim();
                    if (!trimmedName) {
                      alert('Custom template name is required to save modified default templates.');
                      return;
                    }

                    customName = trimmedName;
                  }

                  await saveActiveTemplateToApi(customName);
                  setActiveTemplate(null);
                  alert('Template saved to backend database. Returning to Template Studio.');
                } catch (error) {
                  console.error('Failed to save template:', error);
                  alert('Failed to save template to backend. Check backend logs.');
                }
              }}
              disabled={!activeTemplate}
              className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-[10px] font-black uppercase leading-none tracking-[0.08em] text-slate-800 transition-all hover:border-slate-300 hover:bg-slate-200 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:hover:border-white/20 dark:hover:bg-white/10 sm:px-4 sm:text-xs md:px-4 md:text-[11px] lg:px-6 lg:text-xs"
            >
              <Save size={16} className="text-medical-primary" /> SAVE
            </button>
          )}

          <button
            onClick={() => setShowSavedModal(true)}
            className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-[10px] font-black uppercase leading-none tracking-[0.08em] text-slate-800 transition-all hover:border-slate-300 hover:bg-slate-200 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:hover:border-white/20 dark:hover:bg-white/10 sm:px-4 sm:text-xs md:px-4 md:text-[11px] lg:px-6 lg:text-xs"
          >
            SAVED_TEMPLATES
          </button>

          {canCreatePatient && (
            <button
              onClick={openPatientModal}
              className="flex items-center gap-2 whitespace-nowrap rounded-xl border border-slate-200 bg-slate-100 px-5 py-2.5 text-xs font-bold uppercase leading-none tracking-widest text-slate-800 transition-all hover:border-slate-300 hover:bg-slate-200 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:border-white/20 dark:hover:bg-white/10"
            >
              CREATE_PATIENT
            </button>
          )}

          <div className="flex shrink-0 items-center gap-3 pl-0 lg:pl-2">
            <ThemeToggle />
          </div>
        </div>
      </div>

      {showSavedModal &&
        createPortal(
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 p-4" onClick={() => setShowSavedModal(false)}>
            <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-slate-900" onClick={(e) => e.stopPropagation()}>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Saved Templates</h3>
                <button className="text-slate-500 hover:text-slate-900 dark:hover:text-white" onClick={() => setShowSavedModal(false)}>Close</button>
              </div>
              <div className="max-h-[340px] space-y-2 overflow-y-auto">
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
                      className="w-full rounded-xl border border-slate-200 p-3 text-left transition-all hover:border-medical-primary/50 hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/5"
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

      {showAuditModal &&
        createPortal(
          <div className="fixed inset-0 z-[220] flex items-center justify-center bg-black/40 p-4" onClick={() => setShowAuditModal(false)}>
            <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-slate-900" onClick={(e) => e.stopPropagation()}>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Scan Event Audit</h3>
                <button className="text-slate-500 hover:text-slate-900 dark:hover:text-white" onClick={() => setShowAuditModal(false)}>Close</button>
              </div>
              <div className="mb-4 space-y-2 text-sm">
                <p className="text-slate-700 dark:text-slate-300"><span className="font-semibold">Event ID:</span> {eventId ?? 'N/A'}</p>
                <p className="text-slate-700 dark:text-slate-300"><span className="font-semibold">Patient:</span> {eventPatientName ?? 'N/A'}</p>
                <p className="text-slate-700 dark:text-slate-300"><span className="font-semibold">PID:</span> {eventPatientPid ?? 'N/A'}</p>
                <p className="text-slate-700 dark:text-slate-300"><span className="font-semibold">Phone:</span> {eventPatientPhone ?? 'N/A'}</p>
                {reportStatus && <p className="text-slate-700 dark:text-slate-300"><span className="font-semibold">Last Status:</span> {reportStatus}</p>}
              </div>

              <div className="max-h-[340px] space-y-2 overflow-y-auto border-t border-slate-200 pt-4 dark:border-white/10">
                {eventHistory.length === 0 ? (
                  <p className="text-sm text-slate-500">No edit history available yet.</p>
                ) : (
                  eventHistory.map((entry) => {
                    const changedKeys = getChangedKeys(entry);
                    return (
                      <div key={entry.history_id} className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-slate-800/40">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                          {entry.editor?.name ?? 'Unknown user'} ({entry.editor?.role ?? entry.edited_role})
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(entry.edited_at).toLocaleString()}</p>
                        <p className="mt-2 text-xs text-slate-700 dark:text-slate-300">
                          <span className="font-semibold">Edited fields:</span>{' '}
                          {changedKeys.length > 0 ? changedKeys.map(toAuditFieldLabel).join(', ') : 'No field-level differences detected'}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>,
          document.body,
        )}

      {showPatientModal &&
        createPortal(
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 p-4" onClick={() => setShowPatientModal(false)}>
            <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-slate-900" onClick={(e) => e.stopPropagation()}>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Create Patient</h3>
                <button className="text-slate-500 hover:text-slate-900 dark:hover:text-white" onClick={() => setShowPatientModal(false)}>Close</button>
              </div>
              <div className="mb-4 flex gap-2">
                <input
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="Enter patient name"
                  className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-white/10 dark:bg-slate-800 dark:text-white"
                />
                <button onClick={handleCreatePatient} className="rounded-lg bg-medical-primary px-4 py-2 font-semibold text-white">Add</button>
              </div>
              <div className="max-h-[320px] space-y-2 overflow-y-auto">
                {patientList.length === 0 ? (
                  <p className="text-sm text-slate-500">No patients found.</p>
                ) : (
                  patientList.map((patient) => (
                    <div key={patient.patient_id} className="rounded-xl border border-slate-200 p-3 dark:border-white/10">
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
