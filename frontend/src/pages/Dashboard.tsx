import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearSession, getCurrentUser } from '../auth';
import { createPatient, fetchPatients, Patient } from '../api/patients';
import { fetchTemplates } from '../api/templates';
import { createScanEvent } from '../api/scanEvents';
import { MedicalTemplate } from '../types';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientName, setPatientName] = useState('');
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [patientError, setPatientError] = useState<string | null>(null);
  const [templates, setTemplates] = useState<MedicalTemplate[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [scanError, setScanError] = useState<string | null>(null);
  const [scanLoading, setScanLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  const canCreatePatient = user?.role === 'receptionist' || user?.role === 'admin';
  const canViewPatients = user?.role === 'doctor' || user?.role === 'typist' || user?.role === 'receptionist' || user?.role === 'admin';
  const canOpenBuilder = user?.role === 'doctor' || user?.role === 'typist' || user?.role === 'admin';
  const canCreateScanEvent = user?.role === 'doctor' || user?.role === 'typist' || user?.role === 'admin';

  const roleDescription = useMemo(() => {
    switch (user?.role) {
      case 'doctor':
        return 'Create templates, review patient data, and finalize reports.';
      case 'typist':
        return 'Fill scan data using doctor templates and maintain draft reports.';
      case 'receptionist':
        return 'Create and manage patient onboarding records.';
      case 'admin':
        return 'Manage users and oversee workflow controls.';
      default:
        return '';
    }
  }, [user?.role]);

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
      return;
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
        return;
      }

      try {
        const rows = await fetchTemplates();
        setTemplates(rows);
      } catch (error) {
        setScanError(error instanceof Error ? error.message : 'Failed to load templates');
      }
    };

    loadPatients();
    loadTemplates();
  }, [canCreateScanEvent, canViewPatients, navigate, user]);

  if (!user) {
    return null;
  }

  const handleLogout = () => {
    clearSession();
    navigate('/login', { replace: true });
  };

  const handleCreatePatient = async () => {
    if (!patientName.trim()) {
      return;
    }

    setCreateLoading(true);
    setPatientError(null);
    try {
      const created = await createPatient(patientName.trim());
      setPatients((prev) => [created, ...prev]);
      setPatientName('');
    } catch (error) {
      setPatientError(error instanceof Error ? error.message : 'Failed to create patient');
    } finally {
      setCreateLoading(false);
    }
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
    if (!selectedPatientId || !selectedTemplateId) {
      setScanError('Select both patient and template');
      return;
    }

    const selectedTemplate = templates.find((template) => template.id === selectedTemplateId);
    if (!selectedTemplate) {
      setScanError('Selected template not found');
      return;
    }

    setScanError(null);
    setScanLoading(true);
    try {
      const doctorId = selectedTemplate.createdBy || user.user_id;
      const event = await createScanEvent({
        patient_id: selectedPatientId,
        doctor_id: doctorId,
        template_id: selectedTemplateId,
      });

      navigate(`/builder?eventId=${event.event_id}&templateId=${selectedTemplateId}`);
    } catch (error) {
      setScanError(error instanceof Error ? error.message : 'Failed to create scan event');
    } finally {
      setScanLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 md:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tight">{user.role} Dashboard</h1>
              <p className="text-slate-300 mt-2">{user.name} ({user.email})</p>
              <p className="text-slate-400 mt-3">{roleDescription}</p>
            </div>
            <div className="flex gap-2">
              {canOpenBuilder && (
                <button
                  onClick={() => navigate('/builder')}
                  className="px-4 py-2 rounded-lg bg-cyan-500 text-slate-900 font-semibold hover:bg-cyan-400"
                >
                  Open Builder
                </button>
              )}
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg border border-slate-700 hover:bg-slate-800"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {canCreatePatient && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
            <h2 className="text-xl font-bold mb-4">Create Patient</h2>
            <div className="flex gap-2">
              <input
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="Enter patient name"
                className="flex-1 px-4 py-2 rounded-lg bg-slate-950 border border-slate-700 focus:outline-none focus:border-cyan-500"
              />
              <button
                onClick={handleCreatePatient}
                disabled={createLoading || !patientName.trim()}
                className="px-4 py-2 rounded-lg bg-emerald-500 text-slate-900 font-semibold disabled:opacity-60"
              >
                {createLoading ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        )}

        {canViewPatients && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Patients</h2>
              <button
                onClick={refreshPatients}
                className="px-3 py-1 rounded-md border border-slate-700 hover:bg-slate-800 text-xs uppercase tracking-wider"
              >
                Refresh
              </button>
            </div>
            {patientError && <p className="text-rose-400 text-sm mb-3">{patientError}</p>}
            {loadingPatients ? (
              <p className="text-slate-400">Loading patients...</p>
            ) : patients.length === 0 ? (
              <p className="text-slate-400">No patients found.</p>
            ) : (
              <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                {patients.map((patient) => (
                  <div key={patient.patient_id} className="rounded-lg border border-slate-800 p-3 bg-slate-950/40">
                    <div className="font-semibold">{patient.name}</div>
                    <div className="text-xs text-slate-400 mt-1">ID: {patient.patient_id}</div>
                    <div className="text-xs text-slate-500">Created by: {patient.created_by}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {canCreateScanEvent && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
            <h2 className="text-xl font-bold mb-4">Start Scan Event</h2>
            {scanError && <p className="text-rose-400 text-sm mb-3">{scanError}</p>}
            <div className="grid gap-3 md:grid-cols-2">
              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className="px-4 py-2 rounded-lg bg-slate-950 border border-slate-700 focus:outline-none focus:border-cyan-500"
              >
                <option value="">Select patient</option>
                {patients.map((patient) => (
                  <option key={patient.patient_id} value={patient.patient_id}>
                    {patient.name} ({patient.patient_id.slice(0, 8)})
                  </option>
                ))}
              </select>

              <select
                value={selectedTemplateId}
                onChange={(e) => setSelectedTemplateId(e.target.value)}
                className="px-4 py-2 rounded-lg bg-slate-950 border border-slate-700 focus:outline-none focus:border-cyan-500"
              >
                <option value="">Select template</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name} ({template.scanType})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleCreateScanEvent}
              disabled={scanLoading || !selectedPatientId || !selectedTemplateId}
              className="mt-4 px-4 py-2 rounded-lg bg-cyan-500 text-slate-900 font-semibold disabled:opacity-60"
            >
              {scanLoading ? 'Creating Event...' : 'Create Scan Event'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
