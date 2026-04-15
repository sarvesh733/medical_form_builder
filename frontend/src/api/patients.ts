import { getAuthHeaders, getCurrentUser } from '../auth';

export type Patient = {
  patient_id: string;
  name: string;
  created_by: string;
  created_at: string;
  updated_at: string;
};

const API_BASE_URL = 'http://localhost:5000';
const DEFAULT_CREATOR_ID = 'SYSTEM';

export const createPatient = async (name: string, createdBy?: string): Promise<Patient> => {
  const user = getCurrentUser();
  const creatorId = createdBy ?? user?.user_id ?? DEFAULT_CREATOR_ID;

  const res = await fetch(`${API_BASE_URL}/patients`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({
      name,
      created_by: creatorId,
      user_id: creatorId,
      role: user?.role,
    }),
  });

  if (!res.ok) {
    throw new Error('Failed to create patient');
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
