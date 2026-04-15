import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearSession, getCurrentUser } from '../auth';
import { createPatient, fetchPatients, Patient } from '../api/patients';
import { fetchTemplates } from '../api/templates';
import { createScanEvent } from '../api/scanEvents';
import { MedicalTemplate } from '../types';

type PatientFormState = {
  pid: string;
  name: string;
  phone: string;
  address: string;
  age: string;
  dob: string;
  marital_status: string;
  gender: string;
  state: string;
  country: string;
  aadhar_number: string;
  email: string;
};

const emptyPatientForm: PatientFormState = {
  pid: '',
  name: '',
  phone: '',
  address: '',
  age: '',
  dob: '',
  marital_status: '',
  gender: '',
  state: '',
  country: '',
  aadhar_number: '',
  email: '',
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientForm, setPatientForm] = useState<PatientFormState>(emptyPatientForm);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [patientError, setPatientError] = useState<string | null>(null);
  const [templates, setTemplates] = useState<MedicalTemplate[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [selectedPatientPid, setSelectedPatientPid] = useState('');
  const [patientLookupStatus, setPatientLookupStatus] = useState<string | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [scanError, setScanError] = useState<string | null>(null);
  const [templateMode, setTemplateMode] = useState<'saved' | 'builder' | 'loading'>('loading');
  const [scanLoading, setScanLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [patientStatus, setPatientStatus] = useState<string | null>(null);
  const [templatesLoaded, setTemplatesLoaded] = useState(false);

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
        setTemplates(rows);
        setTemplateMode(rows.length > 0 ? 'saved' : 'builder');
      } catch (error) {
        console.error('Failed to load templates:', error);
        setTemplates([]);
        setTemplateMode('builder');
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

  const handleCreatePatient = async () => {
    const hasEmpty = Object.values(patientForm).some((value) => !value.trim());
    if (hasEmpty) {
      setPatientError('All patient fields are required.');
      return;
    }

    setCreateLoading(true);
    setPatientError(null);
    setPatientStatus(null);
    try {
      const created = await createPatient({
        pid: patientForm.pid.trim(),
        name: patientForm.name.trim(),
        phone: patientForm.phone.trim(),
        address: patientForm.address.trim(),
        age: Number(patientForm.age),
        dob: patientForm.dob,
        marital_status: patientForm.marital_status.trim(),
        gender: patientForm.gender.trim(),
        state: patientForm.state.trim(),
        country: patientForm.country.trim(),
        aadhar_number: patientForm.aadhar_number.trim(),
        email: patientForm.email.trim(),
      });
      setPatients((prev) => [created, ...prev]);
      setPatientForm(emptyPatientForm);
      setPatientStatus(`Patient ${created.name} (${created.pid}) created successfully.`);
      await refreshPatients();
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
    const enteredPid = selectedPatientPid.trim().toLowerCase();
    const matchedPatient = enteredPid
      ? patients.find((patient) => patient.pid.trim().toLowerCase() === enteredPid)
      : undefined;
    const effectivePatientId = selectedPatientId || matchedPatient?.patient_id || '';

    if (!effectivePatientId || !selectedTemplateId) {
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
        patient_id: effectivePatientId,
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

  const handleLookupPatientByPid = () => {
    const entered = selectedPatientPid.trim().toLowerCase();
    if (!entered) {
      setPatientLookupStatus('Enter patient PID first.');
      return;
    }

    const matched = patients.find((patient) => patient.pid.trim().toLowerCase() === entered);
    if (!matched) {
      setSelectedPatientId('');
      setPatientLookupStatus('No patient found for this PID.');
      return;
    }

    setSelectedPatientId(matched.patient_id);
    setPatientLookupStatus(`Matched ${matched.name} (${matched.pid}).`);
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
            {patientStatus && <p className="text-emerald-400 text-sm mb-3">{patientStatus}</p>}
            {patientError && <p className="text-rose-400 text-sm mb-3">{patientError}</p>}
            <div className="grid gap-3 md:grid-cols-2">
              <input
                value={patientForm.pid}
                onChange={(e) => setPatientForm((prev) => ({ ...prev, pid: e.target.value }))}
                placeholder="Patient ID (PID)"
                className="px-4 py-2 rounded-lg bg-slate-950 border border-slate-700 focus:outline-none focus:border-cyan-500"
              />
              <input
                value={patientForm.name}
                onChange={(e) => setPatientForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Patient Name"
                className="px-4 py-2 rounded-lg bg-slate-950 border border-slate-700 focus:outline-none focus:border-cyan-500"
              />
              <input
                value={patientForm.phone}
                onChange={(e) => setPatientForm((prev) => ({ ...prev, phone: e.target.value }))}
                placeholder="Phone Number"
                className="px-4 py-2 rounded-lg bg-slate-950 border border-slate-700 focus:outline-none focus:border-cyan-500"
              />
              <input
                value={patientForm.email}
                onChange={(e) => setPatientForm((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="Email"
                className="px-4 py-2 rounded-lg bg-slate-950 border border-slate-700 focus:outline-none focus:border-cyan-500"
              />
              <input
                value={patientForm.address}
                onChange={(e) => setPatientForm((prev) => ({ ...prev, address: e.target.value }))}
                placeholder="Address"
                className="px-4 py-2 rounded-lg bg-slate-950 border border-slate-700 focus:outline-none focus:border-cyan-500"
              />
              <input
                type="number"
                value={patientForm.age}
                onChange={(e) => setPatientForm((prev) => ({ ...prev, age: e.target.value }))}
                placeholder="Age"
                className="px-4 py-2 rounded-lg bg-slate-950 border border-slate-700 focus:outline-none focus:border-cyan-500"
              />
              <input
                type="date"
                value={patientForm.dob}
                onChange={(e) => setPatientForm((prev) => ({ ...prev, dob: e.target.value }))}
                className="px-4 py-2 rounded-lg bg-slate-950 border border-slate-700 focus:outline-none focus:border-cyan-500"
              />
              <select
                value={patientForm.marital_status}
                onChange={(e) => setPatientForm((prev) => ({ ...prev, marital_status: e.target.value }))}
                className="px-4 py-2 rounded-lg bg-slate-950 border border-slate-700 focus:outline-none focus:border-cyan-500"
              >
                <option value="">Select Marital Status</option>
                <option value="single">Single</option>
                <option value="married">Married</option>
                <option value="divorced">Divorced</option>
                <option value="widowed">Widowed</option>
              </select>
              <select
                value={patientForm.gender}
                onChange={(e) => setPatientForm((prev) => ({ ...prev, gender: e.target.value }))}
                className="px-4 py-2 rounded-lg bg-slate-950 border border-slate-700 focus:outline-none focus:border-cyan-500"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              <input
                value={patientForm.state}
                onChange={(e) => setPatientForm((prev) => ({ ...prev, state: e.target.value }))}
                placeholder="State"
                className="px-4 py-2 rounded-lg bg-slate-950 border border-slate-700 focus:outline-none focus:border-cyan-500"
              />
              <input
                value={patientForm.country}
                onChange={(e) => setPatientForm((prev) => ({ ...prev, country: e.target.value }))}
                placeholder="Country"
                className="px-4 py-2 rounded-lg bg-slate-950 border border-slate-700 focus:outline-none focus:border-cyan-500"
              />
              <input
                value={patientForm.aadhar_number}
                onChange={(e) => setPatientForm((prev) => ({ ...prev, aadhar_number: e.target.value }))}
                placeholder="Aadhar Number (12 digits)"
                className="px-4 py-2 rounded-lg bg-slate-950 border border-slate-700 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={handleCreatePatient}
                disabled={createLoading}
                className="px-4 py-2 rounded-lg bg-emerald-500 text-slate-900 font-semibold disabled:opacity-60 hover:bg-emerald-400"
              >
                {createLoading ? 'Creating...' : 'Create Patient'}
              </button>
              <button
                onClick={() => {
                  setPatientForm(emptyPatientForm);
                  setPatientError(null);
                  setPatientStatus(null);
                }}
                className="px-4 py-2 rounded-lg border border-slate-700 hover:bg-slate-800"
              >
                Clear
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
            {patients.length === 0 && loadingPatients ? (
              <p className="text-slate-400">Loading patients...</p>
            ) : patients.length === 0 ? (
              <p className="text-slate-400">No patients found.</p>
            ) : (
              <>
                {loadingPatients && <p className="text-xs text-slate-500 mb-2">Refreshing patient list...</p>}
              <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                {patients.map((patient) => (
                  <div key={patient.patient_id} className="rounded-lg border border-slate-800 p-3 bg-slate-950/40">
                    <div className="font-semibold">{patient.name} ({patient.pid})</div>
                    <div className="text-xs text-slate-400 mt-1">ID: {patient.patient_id}</div>
                    <div className="text-xs text-slate-400">Phone: {patient.phone} • Age: {patient.age} • Gender: {patient.gender}</div>
                    <div className="text-xs text-slate-500">Email: {patient.email} • {patient.state}, {patient.country}</div>
                    <div className="text-xs text-slate-500">Created by: {patient.created_by}</div>
                  </div>
                ))}
              </div>
              </>
            )}
          </div>
        )}

        {canCreateScanEvent && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h2 className="text-xl font-bold">Start Scan Event</h2>
              <button
                onClick={() => navigate('/builder')}
                className="px-3 py-1 rounded-md border border-cyan-500/60 text-xs uppercase tracking-wider text-cyan-300 hover:bg-cyan-500/10"
              >
                Open Form Builder
              </button>
            </div>

            {templateMode !== 'loading' && (
              <div className="flex items-center gap-3 mb-4">
                <button
                  onClick={() => setTemplateMode('saved')}
                  className={`px-3 py-1 rounded-md text-xs uppercase tracking-wider border ${templateMode === 'saved' ? 'border-cyan-500 text-cyan-300 bg-cyan-500/10' : 'border-slate-700 text-slate-300 hover:bg-slate-800'}`}
                >
                  Use Saved Template
                </button>
                <button
                  onClick={() => {
                    setTemplateMode('builder');
                    navigate('/builder');
                  }}
                  className={`px-3 py-1 rounded-md text-xs uppercase tracking-wider border ${templateMode === 'builder' ? 'border-cyan-500 text-cyan-300 bg-cyan-500/10' : 'border-slate-700 text-slate-300 hover:bg-slate-800'}`}
                >
                  Open Form Builder
                </button>
              </div>
            )}

            {scanError && <p className="text-rose-400 text-sm mb-3">{scanError}</p>}

            {templateMode === 'loading' ? (
              <div className="rounded-lg border border-slate-700 bg-slate-950/40 p-4">
                <p className="text-sm text-slate-300">Loading templates...</p>
              </div>
            ) : templateMode === 'saved' ? (
              templates.length === 0 ? (
                <div className="rounded-lg border border-slate-700 bg-slate-950/40 p-4">
                  <p className="text-sm text-slate-200">No saved templates yet.</p>
                  <p className="text-xs text-slate-400 mt-1">Switch to the form builder to create one, then return here to start a scan event.</p>
                </div>
              ) : (
                <>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="flex gap-2 md:col-span-2">
                      <input
                        value={selectedPatientPid}
                        onChange={(e) => {
                          setSelectedPatientPid(e.target.value);
                          setPatientLookupStatus(null);
                        }}
                        placeholder="Enter Patient PID"
                        className="flex-1 px-4 py-2 rounded-lg bg-slate-950 border border-slate-700 focus:outline-none focus:border-cyan-500"
                      />
                      <button
                        onClick={handleLookupPatientByPid}
                        className="px-4 py-2 rounded-lg border border-slate-700 hover:bg-slate-800 text-xs uppercase tracking-wider"
                      >
                        Find
                      </button>
                    </div>

                    {patientLookupStatus && (
                      <p className={`md:col-span-2 text-xs ${patientLookupStatus.startsWith('Matched') ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {patientLookupStatus}
                      </p>
                    )}

                    <select
                      value={selectedPatientId}
                      onChange={(e) => {
                        const nextPatientId = e.target.value;
                        setSelectedPatientId(nextPatientId);
                        const patient = patients.find((row) => row.patient_id === nextPatientId);
                        if (patient) {
                          setSelectedPatientPid(patient.pid);
                        }
                      }}
                      className="px-4 py-2 rounded-lg bg-slate-950 border border-slate-700 focus:outline-none focus:border-cyan-500"
                    >
                      <option value="">Select patient</option>
                      {patients.map((patient) => (
                        <option key={patient.patient_id} value={patient.patient_id}>
                          {patient.name} - {patient.pid}
                        </option>
                      ))}
                    </select>

                    <select
                      value={selectedTemplateId}
                      onChange={(e) => setSelectedTemplateId(e.target.value)}
                      className="px-4 py-2 rounded-lg bg-slate-950 border border-slate-700 focus:outline-none focus:border-cyan-500"
                    >
                      <option value="">Choose saved template</option>
                      {templates.map((template) => (
                        <option key={template.id} value={template.id}>
                          {template.name} ({template.scanType})
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={handleCreateScanEvent}
                    disabled={scanLoading || (!selectedPatientId && !selectedPatientPid.trim()) || !selectedTemplateId}
                    className="mt-4 px-4 py-2 rounded-lg bg-cyan-500 text-slate-900 font-semibold disabled:opacity-60 hover:bg-cyan-400"
                  >
                    {scanLoading ? 'Opening Event...' : 'Open Patient Form'}
                  </button>
                </>
              )
            ) : (
              <div className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 p-4">
                <p className="text-sm text-cyan-100">Open the form builder to create or edit templates.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
