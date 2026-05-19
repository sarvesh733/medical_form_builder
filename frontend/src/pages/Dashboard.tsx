import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearSession, getCurrentUser } from '../auth';
import { fetchPatients, Patient } from '../api/patients';
import { fetchTemplates, saveTemplate } from '../api/templates';
import { createScanEvent, fetchPatientVisits, type ScanEventDetail } from '../api/scanEvents';
import { MedicalTemplate } from '../types';
import ThemeToggle from '../components/ThemeToggle';
import { DEFAULT_SCHEMAS } from '../schemas';

const buildDefaultTemplates = (doctorId: string): MedicalTemplate[] => {
  return Object.entries(DEFAULT_SCHEMAS)
    .filter(([, schema]) => schema.scanType && schema.sections)
    .map(([key, schema]) => ({
      id: `default-${key.replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase()}`,
      name: schema.name ?? `${schema.scanType} Template`,
      scanType: schema.scanType as MedicalTemplate['scanType'],
      sections: schema.sections ?? [],
      version: schema.version ?? '1.0.0',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: doctorId,
      persisted: false,
      isDefault: true,
    }));
};

const mergeTemplatesWithDefaults = (rows: MedicalTemplate[], doctorId: string): MedicalTemplate[] => {
  const defaults = buildDefaultTemplates(doctorId);
  const defaultSignatures = new Set(
    defaults.map((template) => `${template.scanType}::${template.name.toLowerCase()}`),
  );

  const normalizedRows = rows.map((template) => {
    const signature = `${template.scanType}::${template.name.toLowerCase()}`;
    const isDefaultTemplate =
      template.createdBy === 'D01' ||
      template.isDefault ||
      defaultSignatures.has(signature);

    return {
      ...template,
      isDefault: Boolean(isDefaultTemplate),
    };
  });

  const existingDefaultSignatures = new Set(
    normalizedRows
      .filter((template) => template.isDefault)
      .map((template) => `${template.scanType}::${template.name.toLowerCase()}`),
  );

  const missingDefaults = defaults.filter(
    (template) => !existingDefaultSignatures.has(`${template.scanType}::${template.name.toLowerCase()}`),
  );

  return [...normalizedRows, ...missingDefaults];
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [patientError, setPatientError] = useState<string | null>(null);
  const [patientSearch, setPatientSearch] = useState('');
  const [templates, setTemplates] = useState<MedicalTemplate[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [selectedScanType, setSelectedScanType] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [visitDate, setVisitDate] = useState(new Date().toISOString().split('T')[0]);
  const [expandedPatientId, setExpandedPatientId] = useState<string | null>(null);
  const [visitHistories, setVisitHistories] = useState<Record<string, ScanEventDetail[]>>({});
  const [selectedVisitDateByPatient, setSelectedVisitDateByPatient] = useState<Record<string, string>>({});
  const [loadingVisitHistory, setLoadingVisitHistory] = useState<Record<string, boolean>>({});
  const [scanError, setScanError] = useState<string | null>(null);
  const [templateMode, setTemplateMode] = useState<'saved' | 'builder' | 'loading'>('loading');
  const [scanLoading, setScanLoading] = useState(false);
  const [templatesLoaded, setTemplatesLoaded] = useState(false);
  const [expandedScanDate, setExpandedScanDate] = useState<string | null>(null);
  const [patientSearchQuery, setPatientSearchQuery] = useState('');
  const [isPatientListOpen, setIsPatientListOpen] = useState(false);

  const canCreatePatient = user?.role === 'receptionist' || user?.role === 'admin';
  const canViewPatients = user?.role === 'doctor' || user?.role === 'typist' || user?.role === 'receptionist' || user?.role === 'admin';
  const canOpenBuilder = user?.role === 'doctor' || user?.role === 'typist' || user?.role === 'admin';
  const canCreateScanEvent = user?.role === 'doctor' || user?.role === 'typist' || user?.role === 'admin';

  const roleDescription = useMemo(() => {
    switch (user?.role) {
      case 'doctor':
        // return 'Create templates, review patient data, and finalize reports.';
        return '';
      case 'typist':
        // return 'Fill scan data using doctor templates and maintain draft reports.';
        return '';
      case 'receptionist':
        // return 'Create patient records, register scans, and manage patient visits.';
        return '';
      case 'admin':
        // return 'Manage users and oversee workflow controls.';
        return '';
      default:
        return '';
    }
  }, [user?.role]);

  useEffect(() => {
    if (selectedPatientId && !visitHistories[selectedPatientId]) {
      toggleVisitHistory(selectedPatientId);
    }
  }, [selectedPatientId]);

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }

    if (templatesLoaded) {
      return; // Already initialized, don't re-run
    }

    const loadPatients = async () => {
      setLoadingPatients(true);
      setPatientError(null);
      try {
        if (canViewPatients) {
          const rows = await fetchPatients();
          setPatients(rows);
        }
      } catch (error) {
        setPatientError(error instanceof Error ? error.message : 'Failed to load patients');
      } finally {
        setLoadingPatients(false);
      }
    };

    const loadTemplates = async () => {
      if (!canCreateScanEvent) {
        setTemplatesLoaded(true);
        return;
      }

      try {
        const rows = await fetchTemplates();
        const mergedTemplates = mergeTemplatesWithDefaults(rows, user.user_id);
        setTemplates(mergedTemplates);
        setTemplateMode('saved');
      } catch (error) {
        console.error('Failed to load templates:', error);
        const defaults = buildDefaultTemplates(user.user_id);
        setTemplates(defaults);
        setTemplateMode('saved');
      } finally {
        setTemplatesLoaded(true);
      }
    };

    loadPatients();
    loadTemplates();
  }, [user, navigate, canViewPatients, canCreateScanEvent]);

  if (!user) {
    return null;
  }

  const handleLogout = () => {
    clearSession();
    navigate('/login', { replace: true });
  };

  const refreshPatients = async () => {
    if (!canViewPatients) {
      return;
    }

    setLoadingPatients(true);
    setPatientError(null);
    try {
      const rows = await fetchPatients();
      setPatients(rows);
    } catch (error) {
      setPatientError(error instanceof Error ? error.message : 'Failed to load patients');
    } finally {
      setLoadingPatients(false);
    }
  };

  const handleCreateScanEvent = async () => {
    const effectivePatientId = selectedPatientId;

    if (!effectivePatientId) {
      setScanError('Select patient');
      return;
    }

    if (!visitDate) {
      setScanError('Please select a visit date');
      return;
    }

    let resolvedScanType = selectedScanType;
    let resolvedTemplateId = selectedTemplateId;

    if (user?.role === 'doctor' || user?.role === 'typist') {
      const activePatient = patients.find(p => p.patient_id === effectivePatientId);
      if (!activePatient || !activePatient.scan_type) {
        setScanError('Patient has no scan type assigned from reception.');
        return;
      }
      resolvedScanType = activePatient.scan_type;

      const matchingTemplates = templates.filter(t => t.scanType === resolvedScanType);
      const customTemplates = matchingTemplates.filter(t => !t.isDefault).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      const defaultTemplates = matchingTemplates.filter(t => t.isDefault).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

      const chosenTemplate = customTemplates.length > 0 ? customTemplates[0] : defaultTemplates[0];
      if (!chosenTemplate) {
        setScanError(`No template found for scan type: ${resolvedScanType}`);
        return;
      }
      resolvedTemplateId = chosenTemplate.id;
    } else {
      if (!resolvedScanType || !resolvedTemplateId) {
        setScanError('Select patient, scan type and template');
        return;
      }
    }

    const selectedTemplate = templates.find((template) => template.id === resolvedTemplateId);
    if (!selectedTemplate) {
      setScanError('Selected template not found');
      return;
    }

    setScanError(null);
    setScanLoading(true);
    try {
      let resolvedTemplate = selectedTemplate;

      if (!resolvedTemplate.persisted) {
        resolvedTemplate = await saveTemplate({
          ...resolvedTemplate,
          createdBy: user.user_id,
          isDefault: resolvedTemplate.isDefault ?? true,
        });

        setTemplates((prev) => [
          resolvedTemplate,
          ...prev.filter((template) => template.id !== selectedTemplate.id),
        ]);
        setSelectedTemplateId(resolvedTemplate.id);
      }

      const doctorId = resolvedTemplate.createdBy || user.user_id;
      const event = await createScanEvent({
        patient_id: effectivePatientId,
        doctor_id: doctorId,
        template_id: resolvedTemplate.id,
        visit_date: visitDate,
      });

      navigate(`/builder?eventId=${event.event_id}&templateId=${resolvedTemplate.id}&scanType=${encodeURIComponent(resolvedTemplate.scanType)}`);
    } catch (error) {
      setScanError(error instanceof Error ? error.message : 'Failed to create scan event');
    } finally {
      setScanLoading(false);
    }
  };

  const filteredPatients = useMemo(() => {
    const query = patientSearch.trim().toLowerCase();
    if (!query) {
      return patients;
    }

    return patients.filter((patient) =>
      [
        patient.pid,
        patient.name,
        patient.phone,
        patient.email,
        patient.aadhar_number,
        patient.scan_type,
        patient.trimester,
      ]
        .some((value) => typeof value === 'string' && value.toLowerCase().includes(query)),
    );
  }, [patients, patientSearch]);

  const availableScanTypes = useMemo(() => {
    return Array.from(new Set(templates.map((template) => template.scanType))).sort();
  }, [templates]);

  const filteredTemplatesByScanType = useMemo(() => {
    if (!selectedScanType) {
      return templates;
    }

    return templates.filter((template) => template.scanType === selectedScanType);
  }, [templates, selectedScanType]);

  const groupedTemplates = useMemo(() => {
    const sortedTemplates = [...filteredTemplatesByScanType].sort((a, b) => a.name.localeCompare(b.name));

    const defaultTemplatesBySignature = new Map<string, MedicalTemplate>();
    sortedTemplates
      .filter((template) => template.isDefault)
      .forEach((template) => {
        const signature = `${template.scanType}::${template.name.trim().toLowerCase()}`;
        const existing = defaultTemplatesBySignature.get(signature);

        if (!existing) {
          defaultTemplatesBySignature.set(signature, template);
          return;
        }

        const existingUpdatedAt = Number(new Date(existing.updatedAt)) || 0;
        const candidateUpdatedAt = Number(new Date(template.updatedAt)) || 0;
        const shouldReplace =
          (!existing.persisted && Boolean(template.persisted)) ||
          candidateUpdatedAt > existingUpdatedAt;

        if (shouldReplace) {
          defaultTemplatesBySignature.set(signature, template);
        }
      });

    return {
      defaultTemplates: Array.from(defaultTemplatesBySignature.values()),
      customTemplates: sortedTemplates.filter((template) => !template.isDefault),
    };
  }, [filteredTemplatesByScanType]);

  const toggleVisitHistory = async (patientId: string) => {
    if (expandedPatientId === patientId) {
      setExpandedPatientId(null);
      return;
    }

    setExpandedPatientId(patientId);

    if (visitHistories[patientId]) {
      return;
    }

    setLoadingVisitHistory((prev) => ({ ...prev, [patientId]: true }));
    try {
      const visits = await fetchPatientVisits(patientId);
      setVisitHistories((prev) => ({ ...prev, [patientId]: visits }));
      if (visits.length > 0) {
        const firstVisitDate = visits[0].visit_date.slice(0, 10);
        setSelectedVisitDateByPatient((prev) => ({
          ...prev,
          [patientId]: firstVisitDate,
        }));
      }
    } catch (error) {
      console.error('Failed to fetch visit history:', error);
    } finally {
      setLoadingVisitHistory((prev) => ({ ...prev, [patientId]: false }));
    }
  };

  const getDateLabel = (dateValue: string) => {
    const date = new Date(dateValue);
    return date.toLocaleDateString();
  };

  const getVisitGroups = (visits: ScanEventDetail[]) => {
    const grouped = new Map<string, ScanEventDetail[]>();

    visits.forEach((visit) => {
      const key = visit.visit_date.slice(0, 10);
      const existing = grouped.get(key) ?? [];
      existing.push(visit);
      grouped.set(key, existing);
    });

    return Array.from(grouped.entries()).map(([date, items]) => ({
      date,
      items,
    }));
  };

  const handleOpenVisitForm = (visit: ScanEventDetail) => {
    const templateQuery = visit.template_id ? `&templateId=${visit.template_id}` : '';
    const scanType = visit.scan_type || visit.patient?.scan_type;
    const scanTypeQuery = scanType ? `&scanType=${encodeURIComponent(scanType)}` : '';
    navigate(`/builder?eventId=${visit.event_id}${templateQuery}${scanTypeQuery}`);
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 sm:p-6 md:p-10 transition-colors">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight truncate">{user.role} Dashboard</h1>
              <p className="text-slate-600 dark:text-slate-300 mt-1 text-sm md:text-base truncate">{user.name} ({user.email})</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
              <div className="mr-1 flex items-center">
                <ThemeToggle />
              </div>
              {canOpenBuilder && (
                <button
                  onClick={() => navigate('/builder')}
                  className="px-3 py-2 sm:px-4 sm:py-2 rounded-lg bg-cyan-500 text-slate-900 font-semibold hover:bg-cyan-400 text-sm sm:text-base"
                >
                  Open Builder
                </button>
              )}
              {canCreatePatient && (
                <div className="flex gap-2">
                    <button
                      onClick={() => navigate('/register-patient?mode=existing')}
                      className="px-3 py-2 sm:px-4 sm:py-2 rounded-lg bg-sky-500 text-white font-semibold hover:bg-sky-400 text-sm sm:text-base"
                    >
                      Add Scan (Existing)
                    </button>
                    <button
                      onClick={() => navigate('/register-patient')}
                      className="px-3 py-2 sm:px-4 sm:py-2 rounded-lg bg-emerald-500 text-slate-900 font-semibold hover:bg-emerald-400 text-sm sm:text-base"
                    >
                      Register Patient
                    </button>
                </div>
              )}
              {user?.role === 'admin' && (
                  <button
                    onClick={() => navigate('/admin/users')}
                    className="px-3 py-2 sm:px-4 sm:py-2 rounded-lg bg-amber-500 text-slate-900 font-semibold hover:bg-amber-400 text-sm sm:text-base"
                  >
                    Manage Users
                  </button>
              )}
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 sm:px-4 sm:py-2 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 text-sm sm:text-base font-semibold"
                >
                  Logout
                </button>
            </div>
          </div>
        </div>

        {canViewPatients && (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Patients</h2>
              <div className="flex items-center gap-2">
                <input
                  value={patientSearch}
                  onChange={(e) => setPatientSearch(e.target.value)}
                  placeholder="Search by PID, name, phone, email, scan type"
                  className="w-72 max-w-[45vw] px-3 py-1.5 rounded-md bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs focus:outline-none focus:border-cyan-500"
                />
                <button
                  onClick={refreshPatients}
                  className="px-3 py-1 rounded-md border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 text-xs uppercase tracking-wider"
                >
                  Refresh
                </button>
              </div>
            </div>
            {patientError && <p className="text-rose-400 text-sm mb-3">{patientError}</p>}
            {patients.length === 0 && loadingPatients ? (
              <p className="text-slate-400">Loading patients...</p>
            ) : filteredPatients.length === 0 ? (
              <p className="text-slate-400">No patients found.</p>
            ) : (
              <>
                {loadingPatients && <p className="text-xs text-slate-500 dark:text-slate-500 mb-2">Refreshing patient list...</p>}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-950/40">
                  <div className="max-h-[460px] overflow-auto">
                    <table className="w-full min-w-[1120px] text-xs">
                      <thead className="bg-slate-100 dark:bg-slate-900 sticky top-0 z-10">
                        <tr className="border-b border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                          <th className="text-left px-3 py-2 font-semibold">Patient ID</th>
                          <th className="text-left px-3 py-2 font-semibold">First Name</th>
                          <th className="text-left px-3 py-2 font-semibold">Age</th>
                          <th className="text-left px-3 py-2 font-semibold">Gender</th>
                          <th className="text-left px-3 py-2 font-semibold">Phone</th>
                          <th className="text-left px-3 py-2 font-semibold">Email</th>
                          <th className="text-left px-3 py-2 font-semibold">Trimester</th>
                          <th className="text-left px-3 py-2 font-semibold">Type of Scan</th>
                          <th className="text-left px-3 py-2 font-semibold">Location</th>
                          <th className="text-left px-3 py-2 font-semibold">Visits</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPatients.map((patient) => {
                          const isExpanded = expandedPatientId === patient.patient_id;
                          return (
                            <React.Fragment key={patient.patient_id}>
                              <tr className="border-b border-slate-200 dark:border-slate-800 odd:bg-slate-50 even:bg-white dark:odd:bg-slate-950/20 dark:even:bg-slate-900/20 hover:bg-cyan-500/5 cursor-pointer" onClick={() => toggleVisitHistory(patient.patient_id)}>
                                <td className="px-3 py-2 font-semibold text-cyan-700 dark:text-cyan-300">{patient.pid}</td>
                                <td className="px-3 py-2 text-slate-900 dark:text-slate-100">{patient.name}</td>
                                <td className="px-3 py-2 text-slate-700 dark:text-slate-300">{patient.age}</td>
                                <td className="px-3 py-2 text-slate-700 dark:text-slate-300">{patient.gender}</td>
                                <td className="px-3 py-2 text-slate-800 dark:text-slate-200">{patient.phone}</td>
                                <td className="px-3 py-2 text-slate-700 dark:text-slate-300">{patient.email}</td>
                                <td className="px-3 py-2 text-slate-700 dark:text-slate-300">{patient.trimester || 'Early pregnancy'}</td>
                                <td className="px-3 py-2 text-slate-800 dark:text-slate-200">{patient.scan_type || 'Not selected'}</td>
                                <td className="px-3 py-2 text-slate-500 dark:text-slate-400">{patient.state}, {patient.country}</td>
                                <td className="px-3 py-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleVisitHistory(patient.patient_id);
                                    }}
                                    className="px-2 py-1 rounded border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 text-[11px] whitespace-nowrap"
                                  >
                                    {isExpanded ? 'Hide History' : 'View History'}
                                  </button>
                                </td>
                              </tr>
                              {isExpanded && (
                                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/30">
                                  <td colSpan={10} className="px-3 py-3">
                                    {loadingVisitHistory[patient.patient_id] ? (
                                      <p className="text-xs text-slate-400">Loading visit history...</p>
                                    ) : visitHistories[patient.patient_id]?.length === 0 ? (
                                      <p className="text-xs text-slate-400">No visits recorded.</p>
                                    ) : (
                                      <div className="grid gap-4 lg:grid-cols-2">
                                        <div className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950/30 overflow-hidden">
                                          <div className="px-3 py-2 border-b border-slate-300 dark:border-slate-700 text-[11px] font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">Visits</div>
                                          <div className="max-h-[220px] overflow-auto">
                                            <table className="w-full text-[11px]">
                                              <thead>
                                                <tr className="border-b border-slate-300 dark:border-slate-800 text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                                  <th className="text-left py-1.5 px-3">Date</th>
                                                  <th className="text-left py-1.5 px-3">Scans</th>
                                                </tr>
                                              </thead>
                                              <tbody>
                                                {getVisitGroups(visitHistories[patient.patient_id] ?? []).map((group) => {
                                                  const isSelected = selectedVisitDateByPatient[patient.patient_id] === group.date;
                                                  return (
                                                    <tr
                                                      key={`${patient.patient_id}-${group.date}`}
                                                      className={`border-b border-slate-300/70 dark:border-slate-800/70 cursor-pointer ${isSelected ? 'bg-cyan-500/10' : 'hover:bg-slate-100 dark:hover:bg-slate-800/50'}`}
                                                      onClick={() => setSelectedVisitDateByPatient((prev) => ({ ...prev, [patient.patient_id]: group.date }))}
                                                    >
                                                      <td className="py-1.5 px-3 text-slate-800 dark:text-slate-200">{getDateLabel(group.date)}</td>
                                                      <td className="py-1.5 px-3 text-slate-700 dark:text-slate-300">{group.items.length}</td>
                                                    </tr>
                                                  );
                                                })}
                                              </tbody>
                                            </table>
                                          </div>
                                        </div>

                                        <div className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950/30 overflow-hidden">
                                          <div className="px-3 py-2 border-b border-slate-300 dark:border-slate-700 text-[11px] font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">Scans On Selected Date</div>
                                          <div className="max-h-[220px] overflow-auto">
                                            <table className="w-full text-[11px]">
                                              <thead>
                                                <tr className="border-b border-slate-300 dark:border-slate-800 text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                                  <th className="text-left py-1.5 px-3">Type of Scan</th>
                                                  <th className="text-left py-1.5 px-3">Doctor</th>
                                                  <th className="text-left py-1.5 px-3">Status</th>
                                                  <th className="text-left py-1.5 px-3">Open</th>
                                                </tr>
                                              </thead>
                                              <tbody>
                                                {(visitHistories[patient.patient_id] ?? [])
                                                  .filter((visit) => {
                                                    const selectedDate = selectedVisitDateByPatient[patient.patient_id];
                                                    if (!selectedDate) {
                                                      return false;
                                                    }
                                                    return visit.visit_date.slice(0, 10) === selectedDate;
                                                  })
                                                  .map((visit, idx) => (
                                                    <tr key={`${patient.patient_id}-scan-${idx}`} className="border-b border-slate-300/70 dark:border-slate-800/70">
                                                      <td className="py-1.5 px-3 text-slate-800 dark:text-slate-200">{visit.scan_type || visit.template?.scan_type || visit.template?.title || 'Scan'}</td>
                                                      <td className="py-1.5 px-3 text-slate-700 dark:text-slate-300">{visit.doctor?.name || 'N/A'}</td>
                                                      <td className="py-1.5 px-3">
                                                        <span className={visit.status === 'completed' ? 'text-emerald-400' : 'text-yellow-400'}>{visit.status}</span>
                                                      </td>
                                                      <td className="py-1.5 px-3">
                                                        <button
                                                          onClick={() => handleOpenVisitForm(visit)}
                                                          className="px-2 py-1 rounded border border-cyan-600/60 text-cyan-300 hover:bg-cyan-500/10 text-[11px]"
                                                        >
                                                          Open Form
                                                        </button>
                                                      </td>
                                                    </tr>
                                                  ))}
                                              </tbody>
                                            </table>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {canCreateScanEvent && (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 p-6">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h2 className="text-xl font-bold">Search Patients</h2>
            </div>

            {templateMode !== 'loading' && (user?.role !== 'doctor' && user?.role !== 'typist') && (
              <div className="flex items-center gap-3 mb-4">
                <button
                  onClick={() => setTemplateMode('saved')}
                  className={`px-3 py-1 rounded-md text-xs uppercase tracking-wider border ${templateMode === 'saved' ? 'border-cyan-500 text-cyan-700 dark:text-cyan-300 bg-cyan-500/10' : 'border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                >
                  Use Saved Template
                </button>
              </div>
            )}

            {scanError && <p className="text-rose-400 text-sm mb-3">{scanError}</p>}

            {templateMode === 'loading' ? (
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/40 p-4">
                <p className="text-sm text-slate-700 dark:text-slate-300">Loading templates...</p>
              </div>
            ) : templateMode === 'saved' ? (
              templates.length === 0 ? (
                <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/40 p-4">
                  <p className="text-sm text-slate-800 dark:text-slate-200">No saved templates yet.</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Switch to the form builder to create one, then return here to start a scan event.</p>
                </div>
              ) : (
                <>
                  <div className="grid gap-3 md:grid-cols-2 relative">
                    <div className={`relative ${(user?.role === 'doctor' || user?.role === 'typist') ? 'md:col-span-2' : 'md:col-span-2 lg:col-span-1'}`}>
                      <div className="relative group">
                        <input
                          type="text"
                          value={patientSearchQuery}
                          onFocus={() => setIsPatientListOpen(true)}
                          onChange={(e) => {
                            setPatientSearchQuery(e.target.value);
                            setIsPatientListOpen(true);
                            if (!e.target.value) setSelectedPatientId('');
                          }}
                          placeholder="Search patient by Name or ID..."
                          className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 shadow-sm transition-all pr-10"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                        </div>
                      </div>

                      {isPatientListOpen && (
                        <div className="absolute z-50 w-full mt-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                          <div className="max-h-[320px] overflow-auto py-2">
                            {patients
                              .filter(p =>
                                p.name.toLowerCase().includes(patientSearchQuery.toLowerCase()) ||
                                p.pid.toLowerCase().includes(patientSearchQuery.toLowerCase())
                              )
                              .map((patient) => (
                                <button
                                  key={patient.patient_id}
                                  onClick={() => {
                                    setSelectedPatientId(patient.patient_id);
                                    setPatientSearchQuery(`${patient.name} (${patient.pid})`);
                                    setIsPatientListOpen(false);
                                  }}
                                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-cyan-500/10 transition-colors group"
                                >
                                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-black text-slate-500 dark:text-slate-400 group-hover:bg-cyan-500 group-hover:text-white transition-all">
                                    {patient.name.charAt(0)}
                                  </div>
                                  <div>
                                    <div className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400">{patient.name}</div>
                                    <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-0.5 uppercase tracking-wider">Patient Code: {patient.pid}</div>
                                  </div>
                                </button>
                              ))}
                            {patients.filter(p =>
                              p.name.toLowerCase().includes(patientSearchQuery.toLowerCase()) ||
                              p.pid.toLowerCase().includes(patientSearchQuery.toLowerCase())
                            ).length === 0 && (
                                <div className="px-4 py-8 text-center">
                                  <div className="text-slate-300 dark:text-slate-700 mb-2">
                                    <svg className="mx-auto" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                                  </div>
                                  <p className="text-sm text-slate-500">No patients found</p>
                                </div>
                              )}
                          </div>
                        </div>
                      )}

                      {/* Click outside listener */}
                      {isPatientListOpen && (
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setIsPatientListOpen(false)}
                        />
                      )}
                    </div>

                    {selectedPatientId && (
                      <div className="md:col-span-2 mt-4 space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Registered Scans / Visit History</h3>
                          {loadingVisitHistory[selectedPatientId] && <span className="text-xs text-cyan-500 animate-pulse">Loading...</span>}
                        </div>

                        {visitHistories[selectedPatientId]?.length === 0 && !loadingVisitHistory[selectedPatientId] ? (
                          <p className="text-xs text-slate-500 italic">No previous scans found for this patient.</p>
                        ) : (
                          <div className="space-y-3">
                            {getVisitGroups(visitHistories[selectedPatientId] ?? [])
                              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                              .map((group) => {
                                const isDateExpanded = expandedScanDate === group.date;
                                return (
                                  <div key={group.date} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/40 overflow-hidden transition-all duration-300 hover:border-cyan-500/30">
                                    <button
                                      onClick={() => setExpandedScanDate(isDateExpanded ? null : group.date)}
                                      className="w-full flex items-center justify-between p-4 text-left group"
                                    >
                                      <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex flex-col items-center justify-center border border-cyan-500/20 group-hover:bg-cyan-500/20 transition-colors">
                                          <span className="text-[10px] font-black text-cyan-600 dark:text-cyan-400 uppercase leading-none">
                                            {new Date(group.date).toLocaleDateString(undefined, { month: 'short' })}
                                          </span>
                                          <span className="text-lg font-black text-slate-900 dark:text-white leading-none mt-1">
                                            {new Date(group.date).getDate()}
                                          </span>
                                        </div>
                                        <div>
                                          <div className="text-sm font-black text-slate-900 dark:text-white">
                                            {new Date(group.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric' })}
                                          </div>
                                          <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] mt-0.5">
                                            {group.items.length} {group.items.length === 1 ? 'Registered Scan' : 'Registered Scans'}
                                          </div>
                                        </div>
                                      </div>
                                      <div className={`w-8 h-8 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center transition-transform duration-300 ${isDateExpanded ? 'rotate-180 bg-slate-50 dark:bg-slate-900' : ''}`}>
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                      </div>
                                    </button>

                                    {isDateExpanded && (
                                      <div className="px-4 pb-4 flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                        {group.items.map((visit) => (
                                          <button
                                            key={visit.event_id}
                                            onClick={() => handleOpenVisitForm(visit)}
                                            className="flex flex-col p-2 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-white/[0.02] hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all text-left group/scan relative min-w-[140px]"
                                          >
                                            <div className="flex items-center justify-between w-full gap-3">
                                              <span className="text-[9px] font-black uppercase tracking-wider text-cyan-600 dark:text-cyan-400 leading-none">
                                                {visit.scan_type || visit.template?.scan_type || 'General Scan'}
                                              </span>
                                              <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase shrink-0 leading-none ${visit.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                                {visit.status}
                                              </span>
                                            </div>
                                            <div className="flex items-center justify-between w-full mt-1.5 gap-3">
                                              <div className="text-[10px] font-bold text-slate-800 dark:text-slate-200 truncate leading-none">
                                                {patients.find(p => p.patient_id === selectedPatientId)?.name} • {new Date(visit.visit_date).toLocaleDateString()}
                                              </div>
                                              <span className="text-[9px] text-cyan-500 font-bold opacity-0 group-hover/scan:opacity-100 transition-opacity shrink-0 leading-none">OPEN →</span>
                                            </div>
                                          </button>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )
            ) : (
              <div className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 p-4">
                <p className="text-sm text-cyan-800 dark:text-cyan-100">Open the form builder to create or edit templates.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
