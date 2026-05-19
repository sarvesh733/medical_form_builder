import { AuthSession, UserRole } from '../auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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

type ApprovedRegisterResponse = AuthSession & {
  message?: string;
};

type PendingRegisterResponse = {
  token?: never;
  user: {
    user_id: string;
    name: string;
    email: string;
    role: string;
    is_approved: boolean;
  };
  requiresApproval: true;
  message?: string;
};

type RegisterResponse = ApprovedRegisterResponse | PendingRegisterResponse;

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

export const registerUser = async (payload: RegisterPayload): Promise<RegisterResponse> => {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let message = 'Registration failed';
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

  return (await res.json()) as RegisterResponse;
};

export const loginUser = async (payload: LoginPayload): Promise<AuthSession> => {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  return parseResponse(res);
};
