import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, User, FileText, Search, Plus, Trash2 } from 'lucide-react';
import { createPatient, fetchPatients, Patient, updatePatient } from '../api/patients';
import { createScanEvent } from '../api/scanEvents';
import { getCurrentUser } from '../auth';


const TRIMESTERS = [
  'Early pregnancy',
  'First trimester',
  'Second trimester',
  'Third trimester',
];

const SCAN_MAPPING: Record<string, string[]> = {
  'Early pregnancy': ["Abdomen/Pelvis", "Fetal ECO", "Medical History", "OB Case History", "OB-USG-Early Pregnancy"],
  'First trimester': ["Abdomen/Pelvis", "Fetal ECO", "Medical History", "OB Case History", "OB Case History + FTS"],
  'Second trimester': ["2nd and 3rd trimester OB USG", "Abdomen/Pelvis", "Fetal ECO", "Medical History", "OB Case History"],
  'Third trimester': ["2nd and 3rd trimester OB USG", "Abdomen/Pelvis", "Fetal ECO", "Medical History", "OB Case History"]
};

export default function ReceptionistRegistration() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getCurrentUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [generatedPatientId, setGeneratedPatientId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    pid: '',
    name: '',
    phone: '',
    address: '',
    age: '',
    dob: '',
    marital_status: 'Single',
    gender: 'Male',
    trimester: 'Early pregnancy',
    state: '',
    country: '',
    aadhar_number: '',
    email: '',
  });
  const [visitDate, setVisitDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedScans, setSelectedScans] = useState<string[]>(['']);
  const [allPatients, setAllPatients] = useState<Patient[]>([]);
  const [isExistingPatient, setIsExistingPatient] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const availableScanTypes = React.useMemo(() => {
    // Get scans from mapping based on current trimester
    const mappedScans = SCAN_MAPPING[formData.trimester] || [];
    return Array.from(new Set([...mappedScans])).sort();
  }, [formData.trimester]);

  React.useEffect(() => {
    const loadData = async () => {
      try {
        const pts = await fetchPatients();
        setAllPatients(pts);
      } catch (err) {
        console.error('Failed to load patients:', err);
      }
    };
    loadData();
  }, []);

  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('mode') === 'existing') {
      setIsExistingPatient(true);
      setIsSearchOpen(true);
    } else {
      setIsExistingPatient(false);
    }
  }, [location.search]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const generatePatientId = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const id = `PAT-${timestamp}${random}`;
    setFormData(prev => ({
      ...prev,
      pid: id,
    }));
    setGeneratedPatientId(id);
  };

  const handleSelectExistingPatient = (patient: Patient) => {
    setFormData({
      pid: patient.pid,
      name: patient.name,
      phone: patient.phone,
      address: patient.address,
      age: patient.age.toString(),
      dob: patient.dob ? (patient.dob.includes('T') ? patient.dob.split('T')[0] : patient.dob) : '',
      marital_status: patient.marital_status,
      gender: patient.gender,
      trimester: patient.trimester,
      state: patient.state,
      country: patient.country,
      aadhar_number: patient.aadhar_number,
      email: patient.email,
    });
    setIsExistingPatient(true);
    setIsSearchOpen(false);
    setSearchQuery(`${patient.name} (${patient.pid})`);
  };

  const addScanField = () => setSelectedScans([...selectedScans, '']);
  const removeScanField = (index: number) => {
    const next = [...selectedScans];
    next.splice(index, 1);
    setSelectedScans(next);
  };
  const handleScanChange = (index: number, value: string) => {
    const next = [...selectedScans];
    next[index] = value;
    setSelectedScans(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (!formData.name || !formData.pid) {
        throw new Error('Patient Name and ID are required');
      }

      if (!formData.dob) {
        throw new Error('Please select a Date of Birth');
      }

      const requiredFields = [
        'name', 'phone', 'address', 'age', 'dob', 'marital_status',
        'gender', 'trimester', 'state', 'country', 'aadhar_number', 'email'
      ];

      const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      const age = parseInt(formData.age);
      if (isNaN(age) || age < 0 || age > 150) {
        throw new Error('Please enter a valid age between 0 and 150');
      }

      // Create or update patient
      let patientId = '';
      if (isExistingPatient) {
        const existing = allPatients.find(p => p.pid === formData.pid);
        if (existing) {
          patientId = existing.patient_id;
          try {
            await updatePatient(patientId, {
              ...formData,
              age: parseInt(formData.age),
            });
          } catch (err) {
            console.warn('Patient update failed, but proceeding to add scans:', err);
          }
        }
      } else {
        const patient = await createPatient({
          ...formData,
          age: parseInt(formData.age),
        });
        patientId = patient.patient_id;
      }

      // Create scan events
      const validScans = selectedScans.filter(s => s !== '');
      let createdCount = 0;

      for (const scanType of validScans) {
        try {
          await createScanEvent({
            patient_id: patientId,
            doctor_id: user?.user_id || 'D01',
            scan_type: scanType,
            visit_date: visitDate,
          });
          createdCount++;
        } catch (scanErr) {
          console.error(`Failed to create scan event for ${scanType}:`, scanErr);
          throw new Error(`Failed to register scan "${scanType}": ${scanErr instanceof Error ? scanErr.message : String(scanErr)}`);
        }
      }

      if (validScans.length > 0 && createdCount === 0) {
        throw new Error('Could not create scan events.');
      }

      setSuccess(`✅ ${isExistingPatient ? 'Scans added' : 'Patient registered'} successfully! (${createdCount} scan(s) registered for ${visitDate})`);
      
      // Reset form
      setTimeout(() => {
        setFormData({
          pid: '',
          name: '',
          phone: '',
          address: '',
          age: '',
          dob: '',
          marital_status: 'Single',
          gender: 'Male',
          trimester: 'Early pregnancy',
          state: '',
          country: '',
          aadhar_number: '',
          email: '',
        });
        setGeneratedPatientId(null);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to register patient');
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'receptionist' && user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4 text-slate-900 dark:text-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Access Denied</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-6">Only receptionists and admins can access this page.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-semibold transition-colors"
          >
            Back to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4 sm:p-6 md:p-10 text-slate-900 dark:text-white">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <FileText size={32} className="text-cyan-500" />
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              {isExistingPatient ? 'Add New Scan' : 'Patient Registration'}
            </h1>
          </div>
          <p className="text-slate-600 dark:text-slate-400">
            {isExistingPatient 
              ? 'Search and add additional scans for an existing patient' 
              : 'Enter patient details and choose scan types for a new registration'}
          </p>
        </motion.div>

        {/* Existing Patient Search */}
        {(new URLSearchParams(location.search).get('mode') === 'existing' || isExistingPatient) && (
          <div className="relative mb-6">
            <div className="relative group">
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setIsSearchOpen(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                  if (!e.target.value) {
                    const params = new URLSearchParams(location.search);
                    if (params.get('mode') !== 'existing') {
                      setIsExistingPatient(false);
                    }
                    setFormData(prev => ({ ...prev, pid: '' }));
                  }
                }}
                placeholder="Search existing patient by Name or ID to add a scan..."
                className="w-full px-5 py-4 rounded-2xl bg-white dark:bg-slate-800/50 backdrop-blur border border-cyan-500/30 dark:border-cyan-500/20 focus:outline-none focus:ring-4 focus:ring-cyan-500/10 shadow-lg transition-all pr-12 text-lg font-medium"
              />
              <div className="absolute right-5 top-1/2 -translate-y-1/2 text-cyan-500">
                <Search size={24} />
              </div>
            </div>

            {isSearchOpen && (
              <div className="absolute z-50 w-full mt-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="max-h-[300px] overflow-auto py-2">
                  {allPatients
                    .filter(p => 
                      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                      p.pid.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((patient) => (
                      <button
                        key={patient.patient_id}
                        onClick={() => handleSelectExistingPatient(patient)}
                        className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-cyan-500/10 transition-colors group"
                      >
                        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-sm font-black text-slate-500 group-hover:bg-cyan-500 group-hover:text-white transition-all">
                          {patient.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-base font-bold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400">{patient.name}</div>
                          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">PID: {patient.pid} • {patient.phone}</div>
                        </div>
                      </button>
                    ))}
                  {allPatients.filter(p => 
                    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                    p.pid.toLowerCase().includes(searchQuery.toLowerCase())
                  ).length === 0 && (
                    <div className="px-5 py-8 text-center text-slate-500">No patients found</div>
                  )}
                </div>
              </div>
            )}
            {isSearchOpen && <div className="fixed inset-0 z-40" onClick={() => setIsSearchOpen(false)} />}
          </div>
        )}

        {/* Messages */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3"
          >
            <AlertCircle size={20} className="text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex items-start gap-3"
          >
            <CheckCircle size={20} className="text-green-500 mt-0.5 flex-shrink-0" />
            <p className="text-green-700 dark:text-green-300">{success}</p>
          </motion.div>
        )}

        {/* Form */}
        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onSubmit={handleSubmit}
          className="bg-white dark:bg-slate-800/50 backdrop-blur border border-slate-200 dark:border-white/10 rounded-2xl p-8 space-y-6"
        >
          {!isExistingPatient && (
            <div className="bg-gradient-to-r from-cyan-50 to-sky-50 dark:from-cyan-500/10 dark:to-slate-900/30 border border-cyan-200 dark:border-cyan-500/30 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-extrabold text-cyan-700 dark:text-cyan-300 uppercase tracking-wider">
                  Patient ID
                </label>
                {!isExistingPatient && (
                  <button
                    type="button"
                    onClick={generatePatientId}
                    className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-600 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                  >
                    Generate New ID
                  </button>
                )}
              </div>
              <input
                type="text"
                name="pid"
                value={formData.pid}
                readOnly
                placeholder={isExistingPatient ? "" : "Click 'Generate ID' to create patient ID"}
                className="w-full bg-white dark:bg-slate-950/50 border border-cyan-300 dark:border-cyan-500/30 rounded-lg p-3 text-slate-800 dark:text-slate-200 placeholder:text-slate-500 dark:placeholder:text-slate-500 font-mono text-sm"
              />
            </div>
          )}
          
          {!isExistingPatient && (
            <>
              {/* Basic Information */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Patient's full name"
                      className="w-full bg-white dark:bg-slate-950/40 border border-slate-300 dark:border-white/10 rounded-lg p-3 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-600 focus:border-cyan-500/50 focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Patient's email"
                      className="w-full bg-white dark:bg-slate-950/40 border border-slate-300 dark:border-white/10 rounded-lg p-3 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-600 focus:border-cyan-500/50 focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest mb-2">
                      Age *
                    </label>
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleInputChange}
                      placeholder="Age"
                      min="0"
                      max="150"
                      className="w-full bg-white dark:bg-slate-950/40 border border-slate-300 dark:border-white/10 rounded-lg p-3 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-600 focus:border-cyan-500/50 focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest mb-2">
                      Gender *
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="w-full bg-white dark:bg-slate-950/40 border border-slate-300 dark:border-white/10 rounded-lg p-3 text-slate-900 dark:text-white focus:border-cyan-500/50 focus:outline-none transition-colors [color-scheme:light] dark:[color-scheme:dark]"
                    >
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest mb-2">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Phone number"
                      className="w-full bg-white dark:bg-slate-950/40 border border-slate-300 dark:border-white/10 rounded-lg p-3 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-600 focus:border-cyan-500/50 focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest mb-2">
                      Address *
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Street address"
                      className="w-full bg-white dark:bg-slate-950/40 border border-slate-300 dark:border-white/10 rounded-lg p-3 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-600 focus:border-cyan-500/50 focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest mb-2">
                      State *
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      placeholder="State"
                      className="w-full bg-white dark:bg-slate-950/40 border border-slate-300 dark:border-white/10 rounded-lg p-3 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-600 focus:border-cyan-500/50 focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest mb-2">
                      Country *
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      placeholder="Country"
                      className="w-full bg-white dark:bg-slate-950/40 border border-slate-300 dark:border-white/10 rounded-lg p-3 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-600 focus:border-cyan-500/50 focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Additional Details */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Additional Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest mb-2">
                      Date of Birth *
                    </label>
                    <input
                      type="date"
                      name="dob"
                      value={formData.dob}
                      onChange={handleInputChange}
                      className="w-full bg-white dark:bg-slate-950/40 border border-slate-300 dark:border-white/10 rounded-lg p-3 text-slate-900 dark:text-white focus:border-cyan-500/50 focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest mb-2">
                      Marital Status *
                    </label>
                    <select
                      name="marital_status"
                      value={formData.marital_status}
                      onChange={handleInputChange}
                      className="w-full bg-white dark:bg-slate-950/40 border border-slate-300 dark:border-white/10 rounded-lg p-3 text-slate-900 dark:text-white focus:border-cyan-500/50 focus:outline-none transition-colors [color-scheme:light] dark:[color-scheme:dark]"
                    >
                      <option>Single</option>
                      <option>Married</option>
                      <option>Divorced</option>
                      <option>Widowed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest mb-2">
                      Aadhar Number *
                    </label>
                    <input
                      type="text"
                      name="aadhar_number"
                      value={formData.aadhar_number}
                      onChange={handleInputChange}
                      placeholder="12-digit Aadhar number"
                      className="w-full bg-white dark:bg-slate-950/40 border border-slate-300 dark:border-white/10 rounded-lg p-3 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-600 focus:border-cyan-500/50 focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest mb-2">
                      Trimester *
                    </label>
                    <select
                      name="trimester"
                      value={formData.trimester}
                      onChange={handleInputChange}
                      className="w-full bg-white dark:bg-slate-950/40 border border-slate-300 dark:border-white/10 rounded-lg p-3 text-slate-900 dark:text-white focus:border-cyan-500/50 focus:outline-none transition-colors [color-scheme:light] dark:[color-scheme:dark]"
                    >
                      {TRIMESTERS.map((item) => (
                        <option key={item} value={item}>{item}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Scan Type Selection (Moved to bottom) */}
          <div className="bg-gradient-to-br from-emerald-50/50 to-cyan-50/50 dark:from-emerald-500/5 dark:to-cyan-500/5 border border-emerald-200/50 dark:border-emerald-500/20 rounded-2xl p-8 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Requested Scans</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Available scans for {formData.trimester}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex flex-col">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1 ml-1">Scan Date</label>
                  <input
                    type="date"
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:border-cyan-500 outline-none transition-all"
                  />
                </div>
                <button
                  type="button"
                  onClick={addScanField}
                  className="mt-4 flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black rounded-xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                >
                  <Plus size={16} /> Add Scan
                </button>
              </div>
            </div>
            <div className="space-y-4">
              {selectedScans.map((scan, idx) => (
                <div key={idx} className="flex gap-3 group animate-in slide-in-from-left-2 duration-300">
                  <div className="flex-1 relative">
                    <select
                      value={scan}
                      onChange={(e) => handleScanChange(idx, e.target.value)}
                      className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-sm font-bold text-slate-900 dark:text-white focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 outline-none transition-all appearance-none cursor-pointer"
                    >
                      <option value="">Choose a procedure...</option>
                      {availableScanTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                    </div>
                  </div>
                  {selectedScans.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeScanField(idx)}
                      className="w-12 h-12 flex items-center justify-center rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all active:scale-90"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-6">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="flex-1 py-3 px-6 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-all uppercase tracking-wider"
            >
              {loading ? (isExistingPatient ? 'Adding Scan...' : 'Registering...') : (isExistingPatient ? 'Add Scan(s)' : 'Register Patient')}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 border border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-white font-bold rounded-lg transition-colors uppercase tracking-wider"
            >
              Cancel
            </motion.button>
          </div>
        </motion.form>
      </div>
    </div>
  );
}
