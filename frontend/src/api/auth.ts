import { AuthSession, UserRole } from '../auth';

const API_BASE_URL = 'http://localhost:5000';

type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
};

type LoginPayload = {
  email: string;
  password: string;
  role: UserRole;
};

const parseResponse = async (res: Response): Promise<AuthSession> => {
  if (!res.ok) {
    let message = 'Request failed';
    try {
      const errorBody = (await res.json()) as { message?: string };
      if (errorBody.message) {
        message = errorBody.message;
      }
    } catch {
      // Keep fallback message
    }
    throw new Error(message);
  }

  return (await res.json()) as AuthSession;
};

export const registerUser = async (payload: RegisterPayload): Promise<AuthSession> => {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  return parseResponse(res);
};

export const loginUser = async (payload: LoginPayload): Promise<AuthSession> => {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  return parseResponse(res);
};
