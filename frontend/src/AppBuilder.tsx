import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Plus, ChevronRight, Menu, X, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { useStore } from './store';
import { MedicalTemplate } from './types';
import { DEFAULT_SCHEMAS } from './schemas';
import { getCurrentUser } from './auth';
import { fetchTemplates } from './api/templates';
import Sidebar from './components/Sidebar';
import Canvas from './components/Canvas';
import PropertiesPanel from './components/PropertiesPanel';
import Navbar from './components/Navbar';
import PrintLayout from './components/PrintLayout';
import { fetchScanEvent, fetchScanEventHistory, saveScanEventData, type ScanEventHistoryEntry } from './api/scanEvents';

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
  scan_type?: string;
};

type TemplateFieldMeta = {
  standard_key: string;
  field_name?: string;
  field_type?: string;
};

type EventTemplateField = {
  standard_key: string;
  field_name?: string;
  field_type?: string;
  section_id?: string;
  section_title?: string;
  is_required?: boolean;
  sort_order?: number;
  options_json?: Array<{ label: string; value: string }> | null;
  conditional_json?: {
    fieldId: string;
    operator: 'equals' | 'not_equals' | 'contains' | 'truthy' | 'greater_than' | 'less_than';
    value: unknown;
  } | null;
};

const getDefaultSectionMeta = (scanType: string | undefined, sectionId: string) => {
  if (!scanType) {
    return undefined;
  }

  const matchingSchemas = Object.values(DEFAULT_SCHEMAS).filter((schema) => schema.scanType === scanType);

  for (const schema of matchingSchemas) {
    const section = schema.sections?.find((item) => item.id === sectionId);
    if (section) {
      return section;
    }
  }

  return undefined;
};

const buildTemplateFromEvent = (event: {
  template_id: string;
  template?: {
    title?: string;
    scan_type?: string;
    fields?: EventTemplateField[];
  };
  created_at?: string;
  updated_at?: string;
  doctor_id?: string;
}): MedicalTemplate | null => {
  const fields = event.template?.fields ?? [];
  if (fields.length === 0) {
    return null;
  }

  // Get the schema definition to merge metadata like section conditionals
  const schemaEntry = Object.entries(DEFAULT_SCHEMAS).find(([key, s]) => {
    const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');
    const target = normalize(event.template?.scan_type || '');
    return normalize(key) === target || normalize(s.scanType || '') === target;
  });
  const schemaTemplate = schemaEntry ? schemaEntry[1] : undefined;

  const sectionMap = new Map<string, MedicalTemplate['sections'][number]>();

  fields
    .slice()
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .forEach((field) => {
      const sectionId = field.section_id ?? 'section_default';
      const sectionTitle = field.section_title ?? 'Section';
      const defaultSection = getDefaultSectionMeta(event.template?.scan_type, sectionId);

      if (!sectionMap.has(sectionId)) {
        sectionMap.set(sectionId, {
          id: sectionId,
          title: sectionTitle,
          fields: [],
          layout: defaultSection?.layout,
          isCollapsible: defaultSection?.isCollapsible,
          conditional: defaultSection?.conditional,
        });
      }

      const section = sectionMap.get(sectionId)!;
      const defaultField = defaultSection?.fields.find((item) => item.id === field.standard_key);

      section.fields.push({
        id: field.standard_key,
        type: (defaultField?.type || field.field_type) as MedicalTemplate['sections'][number]['fields'][number]['type'],
        label: field.field_name ?? '',
        required: Boolean(field.is_required),
        options: defaultField?.options || field.options_json || undefined,
        conditional: defaultField?.conditional || (field.conditional_json
          ? {
            fieldId: field.conditional_json.fieldId,
            operator: field.conditional_json.operator,
            value: field.conditional_json.value,
          }
          : undefined),
        placeholder: defaultField?.placeholder || '',
        defaultValue: defaultField?.defaultValue,
        columns: defaultField?.columns,
        tableType: defaultField?.tableType,
        rows: defaultField?.rows,
        vessels: defaultField?.vessels,
        variables: defaultField?.variables,
        metadata: defaultField?.metadata,
      });
    });

  // Merge with schema to ensure all sections from schema are present with their conditionals
  let finalSections = Array.from(sectionMap.values());
  if (schemaTemplate) {
    finalSections = (schemaTemplate.sections || []).map((schemaSection) => {
      const dbSection = sectionMap.get(schemaSection.id);
      if (dbSection) {
        // Merge database section with schema section, keeping database fields but schema metadata
        return {
          ...dbSection,
          conditional: schemaSection.conditional, // Use schema's conditional logic
          layout: dbSection.layout || schemaSection.layout,
          isCollapsible: dbSection.isCollapsible !== undefined ? dbSection.isCollapsible : schemaSection.isCollapsible,
        };
      }
      // Return schema section as-is if not in database
      return schemaSection;
    });
  }

  return {
    id: event.template_id,
    name: event.template?.title ?? `${event.template?.scan_type ?? 'Scan'} Template`,
    scanType: (event.template?.scan_type as MedicalTemplate['scanType']) ?? 'Medical History',
    version: '1',
    createdAt: event.created_at ?? new Date().toISOString(),
    updatedAt: event.updated_at ?? new Date().toISOString(),
    createdBy: event.doctor_id ?? 'D01',
    persisted: true,
    sections: finalSections,
  };
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

const resolveTemplateFromScanType = async (scanType: string | undefined): Promise<MedicalTemplate | null> => {
  if (!scanType) {
    return null;
  }

  try {
    const currentUser = getCurrentUser();
    
    // Fetch ALL templates for this scan_type across all doctors
    console.log(`[resolveTemplate] Fetching all templates for scan_type: ${scanType}`);
    const response = await fetch(
      `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/templates?scan_type=${encodeURIComponent(scanType)}&all_for_scantype=true`,
      {
        headers: {
          'x-user-id': currentUser?.user_id || '',
          'x-user-role': currentUser?.role || '',
        },
      }
    );

    if (!response.ok) {
      console.error(`Failed to fetch templates for scan_type: ${response.statusText}`);
      throw new Error('Failed to fetch templates');
    }

    const templates = await response.json() as Array<{
      template_id: string;
      doctor_id: string;
      scan_type: string;
      title: string;
      version: number;
      created_at: string;
      updated_at: string;
      fields: any[];
    }>;

    if (templates.length === 0) {
      // Fall back to system default
      const schemaEntry = Object.entries(DEFAULT_SCHEMAS).find(([key, s]) => {
        const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');
        return normalize(key) === normalize(scanType) || normalize(s.scanType || '') === normalize(scanType);
      });
      const schema = schemaEntry ? schemaEntry[1] : undefined;

      if (schema) {
        console.log(`[resolveTemplate] Using system default for ${scanType}`);
        return {
          id: `default-${scanType.replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase()}`,
          name: schema.name ?? `${scanType} Template`,
          scanType: schema.scanType as MedicalTemplate['scanType'],
          sections: schema.sections ?? [],
          version: schema.version ?? '1.0.0',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: 'system',
          persisted: false,
          isDefault: true,
        } as MedicalTemplate;
      }
      return null;
    }

    // Convert backend templates to MedicalTemplate format
    const convert = (template: any): MedicalTemplate => {
      // Get schema to merge metadata like section conditionals
      const schemaTemplate = Object.values(DEFAULT_SCHEMAS).find(s => {
        const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');
        return normalize(s.scanType || '') === normalize(template.scan_type);
      });

      const sectionMap = new Map<string, any>();

      (template.fields || [])
        .sort((a: any, b: any) => a.sort_order - b.sort_order)
        .forEach((fieldRow: any) => {
          const sectionId = fieldRow.section_id ?? 'default-section';
          const sectionTitle = fieldRow.section_title ?? 'Default Section';
          const schemaSection = schemaTemplate?.sections?.find((s) => s.id === sectionId);

          if (!sectionMap.has(sectionId)) {
            sectionMap.set(sectionId, {
              id: sectionId,
              title: sectionTitle,
              fields: [],
              layout: schemaSection?.layout,
              isCollapsible: schemaSection?.isCollapsible,
              conditional: schemaSection?.conditional,
            });
          }

          const section = sectionMap.get(sectionId);
          const schemaField = schemaSection?.fields?.find((f) => f.id === fieldRow.standard_key);
          
          section.fields.push({
            id: fieldRow.standard_key,
            type: fieldRow.field_type || schemaField?.type || 'text',
            label: fieldRow.field_name,
            required: fieldRow.is_required,
            placeholder: schemaField?.placeholder,
            conditional: fieldRow.conditional_json || schemaField?.conditional,
            options: fieldRow.options_json || schemaField?.options,
          });
        });

      // Merge with schema to ensure all sections from schema are present with their conditionals
      let finalSections = Array.from(sectionMap.values());
      if (schemaTemplate) {
        finalSections = (schemaTemplate.sections || []).map((schemaSection) => {
          const dbSection = sectionMap.get(schemaSection.id);
          if (dbSection && dbSection.fields.length > 0) {
            return dbSection;
          }
          return schemaSection;
        });
      }

      return {
        id: template.template_id,
        name: template.title || `${template.scan_type} Template`,
        scanType: template.scan_type as MedicalTemplate['scanType'],
        version: String(template.version),
        createdAt: template.created_at,
        updatedAt: template.updated_at,
        createdBy: template.doctor_id,
        persisted: true,
        sections: finalSections,
      };
    };

    // Priority 1: Current doctor's custom templates
    const doctorCustom = templates.filter(t => t.doctor_id === currentUser?.user_id && t.doctor_id !== 'D01');
    if (doctorCustom[0]) {
      console.log(`[resolveTemplate] Using ${currentUser?.name}'s custom template for ${scanType}: ${doctorCustom[0].template_id}`);
      return convert(doctorCustom[0]);
    }

    // Priority 2: System default template (D01) - skip other doctors' custom
    const defaults = templates.filter(t => t.doctor_id === 'D01');
    if (defaults[0]) {
      console.log(`[resolveTemplate] Using default template for ${scanType}: ${defaults[0].template_id}`);
      return convert(defaults[0]);
    }

    // Priority 3: Fallback to first available (shouldn't reach here usually)
    return convert(templates[0]);
  } catch (error) {
    console.error('Failed to resolve template from scan type:', error);
    // Try system defaults as fallback
    const schemaEntry = Object.entries(DEFAULT_SCHEMAS).find(([key, s]) => {
      const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');
      return normalize(key) === normalize(scanType) || normalize(s.scanType || '') === normalize(scanType);
    });
    const schema = schemaEntry ? schemaEntry[1] : undefined;
    if (schema) {
      console.log(`[resolveTemplate] Fallback to system default for ${scanType}`);
      return {
        id: `default-${scanType.replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase()}`,
        name: schema.name ?? `${scanType} Template`,
        scanType: schema.scanType as MedicalTemplate['scanType'],
        sections: schema.sections ?? [],
        version: schema.version ?? '1.0.0',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'system',
        persisted: false,
        isDefault: true,
      } as MedicalTemplate;
    }
    return null;
  }
};

const AppBuilder: React.FC = () => {
  const [searchParams] = useSearchParams();
  const currentUser = getCurrentUser();
  const isTypist = currentUser?.role === 'typist';
  const isDoctor = currentUser?.role === 'doctor';
  const isAdmin = currentUser?.role === 'admin';
  const isReceptionist = currentUser?.role === 'receptionist';
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
  const [eventHistory, setEventHistory] = useState<ScanEventHistoryEntry[]>([]);
  const [showSidebarMobile, setShowSidebarMobile] = useState(false);
  const [showPropertiesMobile, setShowPropertiesMobile] = useState(false);

  const eventId = searchParams.get('eventId');
  const templateIdFromUrl = searchParams.get('templateId');
  const hasEventContext = Boolean(eventId);

  // Template structure is locked if we are filling an event or if the template is already saved/persisted
  const isTemplateLocked = hasEventContext || Boolean(activeTemplate?.persisted);

  // Data is read-only only if the user is a receptionist or if we are in builder mode without an event
  // Doctors and typists should ALWAYS be able to edit data when there is an event context
  const isReadOnlyData = isReceptionist || (!hasEventContext && isTemplateLocked);

  const reportPayload = useMemo(() => formValues, [formValues]);

  useEffect(() => {
    loadTemplatesFromApi().catch((error) => {
      console.error('Failed to load templates from backend:', error);
    });
  }, [loadTemplatesFromApi]);

  useEffect(() => {
    if (!eventId && !templateIdFromUrl) {
      setActiveTemplate(null);
      return;
    }

    if (!templateIdFromUrl) {
      return;
    }

    console.log(`[AppBuilder] Setting active template: ${templateIdFromUrl}`);
    setActiveTemplate(templateIdFromUrl);
  }, [eventId, templateIdFromUrl, setActiveTemplate]);

  useEffect(() => {
    if (!eventId) {
      return;
    }

    fetchScanEvent(eventId)
      .then(async (event) => {
        let resolvedTemplate: MedicalTemplate | null = null;

        const scanTypeToResolve = event.scan_type || event.patient?.scan_type;
        if (!event.template_id && scanTypeToResolve) {
          console.log(`[AppBuilder] No template_id for event, resolving from scan_type: ${scanTypeToResolve}`);
          resolvedTemplate = await resolveTemplateFromScanType(scanTypeToResolve);
          
          if (resolvedTemplate) {
            console.log(`[AppBuilder] Resolved template: ${resolvedTemplate.id}`);
            event.template_id = resolvedTemplate.id;
          } else {
            console.warn(`[AppBuilder] Could not resolve template for scan_type: ${scanTypeToResolve}`);
          }
        }

        if (event.template_id) {
          const store = useStore.getState();
          const hasTemplateInStore = store.templates.some((template) => template.id === event.template_id);

          if (hasTemplateInStore) {
            setActiveTemplate(event.template_id);
          } else if (resolvedTemplate) {
            // Use the resolved template we just found
            useStore.setState((state) => ({
              templates: [resolvedTemplate, ...state.templates.filter((template) => template.id !== resolvedTemplate.id)],
              activeTemplate: resolvedTemplate,
            }));
          } else {
            const rebuiltTemplate = buildTemplateFromEvent(event as any);
            if (rebuiltTemplate) {
              useStore.setState((state) => ({
                templates: [rebuiltTemplate, ...state.templates.filter((template) => template.id !== rebuiltTemplate.id)],
                activeTemplate: rebuiltTemplate,
              }));
            } else {
              setActiveTemplate(event.template_id);
            }
          }
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

  useEffect(() => {
    if (!eventId) {
      setEventHistory([]);
      return;
    }

    fetchScanEventHistory(eventId)
      .then((history) => {
        setEventHistory(history);
      })
      .catch((error) => {
        console.error('Failed to load scan event history:', error);
      });
  }, [eventId, isSavingReport]);

  const handleSaveReport = async () => {
    if (!eventId || isReceptionist) {
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
    <div className="tablet-autoscale min-h-screen bg-slate-50 dark:bg-medical-dark text-slate-800 dark:text-slate-200 selection:bg-medical-primary/30 transition-colors duration-300">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-medical-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-medical-accent/10 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col no-print">
        <Navbar
          onTogglePreview={() => { }}
          isPreview={false}
          lockTemplateEditing={isTemplateLocked}
          hasEventContext={hasEventContext}
          eventId={eventId}
          eventPatientName={eventPatient?.name ?? null}
          eventPatientPid={eventPatient?.pid ?? null}
          eventPatientPhone={eventPatient?.phone ?? null}
          reportStatus={reportStatus}
          isSavingReport={isSavingReport}
          onSaveReport={handleSaveReport}
          canEditReport={!isReceptionist}
          eventHistory={eventHistory}
        />

        <main className="builder-main-shell flex flex-1 min-h-0 overflow-hidden">
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
              <div className="builder-canvas-shell relative flex-1 overflow-y-auto custom-scrollbar bg-white/[0.02] border-x border-slate-200 dark:border-white/5">
                {!isTemplateLocked && (
                  <>
                    <button
                      onClick={() => setShowSidebarMobile(!showSidebarMobile)}
                      className="fixed bottom-6 right-6 z-40 flex items-center justify-center w-12 h-12 rounded-xl bg-medical-primary text-white shadow-lg hover:shadow-neon-glow transition-all lg:hidden"
                    >
                      {showSidebarMobile ? <X size={20} /> : <Menu size={20} />}
                    </button>
                    <button
                      onClick={() => setShowPropertiesMobile(!showPropertiesMobile)}
                      className="fixed bottom-20 right-6 z-40 flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-600 text-white shadow-lg hover:shadow-neon-glow transition-all xl:hidden"
                    >
                      {showPropertiesMobile ? <X size={20} /> : <Settings size={20} />}
                    </button>
                  </>
                )}
                <Canvas isLocked={isTemplateLocked} isReadOnlyData={isReadOnlyData} />
              </div>
              {!isTemplateLocked && <PropertiesPanel className="hidden xl:flex" />}

              {showSidebarMobile && !isTemplateLocked && createPortal(
                <div
                  className="fixed inset-0 z-30 bg-black/40 lg:hidden"
                  onClick={() => setShowSidebarMobile(false)}
                >
                  <div
                    className="absolute left-0 top-0 h-full w-72 shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Sidebar className="flex" />
                  </div>
                </div>,
                document.body,
              )}

              {showPropertiesMobile && !isTemplateLocked && createPortal(
                <div
                  className="fixed inset-0 z-30 bg-black/40 xl:hidden"
                  onClick={() => setShowPropertiesMobile(false)}
                >
                  <div
                    className="absolute right-0 top-0 h-full w-80 shadow-2xl overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <PropertiesPanel className="flex" />
                  </div>
                </div>,
                document.body,
              )}
            </>
          )}
        </main>

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
    <div className="flex-1 flex flex-col items-center w-full px-4 sm:px-6 md:px-8 py-8 sm:py-10 overflow-y-auto custom-scrollbar">
      <div className="my-auto w-full max-w-6xl flex flex-col items-center">
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

        <div className="grid w-full grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3 md:gap-6">
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
