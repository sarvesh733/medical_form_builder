import { getAuthHeaders, getCurrentUser } from '../auth';

const API_BASE_URL = 'http://localhost:5000';

type CreateScanEventPayload = {
  patient_id: string;
  doctor_id: string;
  template_id?: string;
  scan_type?: string;
  visit_date?: string;
};

export type ScanEventData = {
  event_data_id: string;
  event_id: string;
  data: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type ScanEventHistoryEntry = {
  history_id: string;
  event_id: string;
  old_data: Record<string, unknown>;
  new_data: Record<string, unknown>;
  edited_by: string;
  edited_role: string;
  edited_at: string;
  editor?: {
    user_id: string;
    name: string;
    role: string;
    email: string;
  };
};

export type ScanEventDetail = {
  event_id: string;
  patient_id: string;
  doctor_id: string;
  created_by: string | null;
  template_id: string;
  scan_type?: string;
  visit_date: string;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  data: ScanEventData | null;
  patient?: {
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
  doctor?: {
    user_id: string;
    name: string;
    role: string;
    email: string;
  };
  template?: {
    template_id: string;
    scan_type?: string;
    title?: string;
    fields?: Array<{
      standard_key: string;
      field_name?: string;
      field_type?: string;
    }>;
  };
};

const assertOk = async (res: Response, fallbackMessage: string) => {
  if (!res.ok) {
    let message = fallbackMessage;
    try {
      const body = (await res.json()) as { message?: string };
      if (body.message) {
        message = body.message;
      }
    } catch {
      // use fallback
    }
    throw new Error(message);
  }
};

export const createScanEvent = async (payload: CreateScanEventPayload) => {
  const user = getCurrentUser();
  
  const requestBody: any = {
    ...payload,
    created_by: user?.user_id,
    user_id: user?.user_id,
    role: user?.role,
  };
  
  // Debug logging
  console.log('[createScanEvent] Request body:', requestBody);
  
  const res = await fetch(`${API_BASE_URL}/scan-events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(requestBody),
  });

  await assertOk(res, 'Failed to create scan event');
  return (await res.json()) as { event_id: string };
};

export const saveScanEventData = async (eventId: string, data: Record<string, unknown>) => {
  const user = getCurrentUser();
  
  console.log('[saveScanEventData] Saving data for event:', eventId);
  console.log('[saveScanEventData] User:', user);
  console.log('[saveScanEventData] Data payload:', data);
  
  const res = await fetch(`${API_BASE_URL}/scan-events/${eventId}/data`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({
      data,
      user_id: user?.user_id,
      role: user?.role,
    }),
  });

  await assertOk(res, 'Failed to save scan data');
  const result = await res.json() as { message: string };
  console.log('[saveScanEventData] Save successful:', result);
  return result;
};

export const fetchScanEvent = async (eventId: string): Promise<ScanEventDetail> => {
  const user = getCurrentUser();
  const res = await fetch(`${API_BASE_URL}/scan-events/${eventId}`, {
    headers: {
      ...getAuthHeaders(),
      ...(user?.role ? { 'x-user-role': user.role } : {}),
    },
  });

  await assertOk(res, 'Failed to fetch scan event');
  return (await res.json()) as ScanEventDetail;
};

export const fetchPatientVisits = async (patientId: string): Promise<ScanEventDetail[]> => {
  const user = getCurrentUser();
  const res = await fetch(`${API_BASE_URL}/scan-events?patient_id=${patientId}`, {
    headers: {
      ...getAuthHeaders(),
      ...(user?.role ? { 'x-user-role': user.role } : {}),
    },
  });

  await assertOk(res, 'Failed to fetch patient visits');
  return (await res.json()) as ScanEventDetail[];
};

export const fetchScanEventHistory = async (eventId: string): Promise<ScanEventHistoryEntry[]> => {
  const user = getCurrentUser();
  const res = await fetch(`${API_BASE_URL}/scan-events/${eventId}/history`, {
    headers: {
      ...getAuthHeaders(),
      ...(user?.role ? { 'x-user-role': user.role } : {}),
    },
  });

  await assertOk(res, 'Failed to fetch scan event history');
  return (await res.json()) as ScanEventHistoryEntry[];
};
