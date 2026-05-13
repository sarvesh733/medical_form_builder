import { getAuthHeaders, getCurrentUser } from '../auth';

export type Patient = {
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
  trimester: string;
  scan_type: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type CreatePatientPayload = {
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
  trimester: string;
};

const API_BASE_URL = 'http://localhost:5000';
const DEFAULT_CREATOR_ID = 'SYSTEM';

export const createPatient = async (payload: CreatePatientPayload, createdBy?: string): Promise<Patient> => {
  const user = getCurrentUser();
  const creatorId = createdBy ?? user?.user_id ?? DEFAULT_CREATOR_ID;

  const res = await fetch(`${API_BASE_URL}/patients`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({
      ...payload,
      created_by: creatorId,
      user_id: creatorId,
      role: user?.role,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to create patient');
  }

  return (await res.json()) as Patient;
};

export const fetchPatients = async (): Promise<Patient[]> => {
  const user = getCurrentUser();
  const res = await fetch(`${API_BASE_URL}/patients`, {
    headers: {
      ...getAuthHeaders(),
      ...(user?.role ? { 'x-user-role': user.role } : {}),
    },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch patients');
  }

  return (await res.json()) as Patient[];
};

export const updatePatient = async (patientId: string, payload: Partial<CreatePatientPayload>): Promise<Patient> => {
  const res = await fetch(`${API_BASE_URL}/patients/${patientId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to update patient');
  }

  return (await res.json()) as Patient;
};
