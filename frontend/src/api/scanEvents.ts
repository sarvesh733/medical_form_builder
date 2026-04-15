import { getAuthHeaders, getCurrentUser } from '../auth';

const API_BASE_URL = 'http://localhost:5000';

type CreateScanEventPayload = {
  patient_id: string;
  doctor_id: string;
  template_id: string;
};

export type ScanEventData = {
  event_data_id: string;
  event_id: string;
  data: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type ScanEventDetail = {
  event_id: string;
  patient_id: string;
  doctor_id: string;
  created_by: string | null;
  template_id: string;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  data: ScanEventData | null;
};

export type ScanEventHistoryItem = {
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
  const res = await fetch(`${API_BASE_URL}/scan-events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({
      ...payload,
      created_by: user?.user_id,
      user_id: user?.user_id,
      role: user?.role,
    }),
  });

  await assertOk(res, 'Failed to create scan event');
  return (await res.json()) as { event_id: string };
};

export const saveScanEventData = async (eventId: string, data: Record<string, unknown>) => {
  const user = getCurrentUser();
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
  return (await res.json()) as { message: string };
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

export const fetchScanEventHistory = async (eventId: string): Promise<ScanEventHistoryItem[]> => {
  const user = getCurrentUser();
  const res = await fetch(`${API_BASE_URL}/scan-events/${eventId}/history`, {
    headers: {
      ...getAuthHeaders(),
      ...(user?.role ? { 'x-user-role': user.role } : {}),
    },
  });

  await assertOk(res, 'Failed to fetch scan event history');
  return (await res.json()) as ScanEventHistoryItem[];
};
