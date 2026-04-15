export const USER_ROLES = ['doctor', 'typist', 'receptionist', 'admin'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export type AuthUser = {
  user_id: string;
  name: string;
  email: string;
  role: UserRole;
};

export type AuthSession = {
  token: string;
  user: AuthUser;
};

const AUTH_SESSION_KEY = 'medical_builder_auth_session';

export const saveSession = (session: AuthSession) => {
  localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
};

export const getSession = (): AuthSession | null => {
  const raw = localStorage.getItem(AUTH_SESSION_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    localStorage.removeItem(AUTH_SESSION_KEY);
    return null;
  }
};

export const clearSession = () => {
  localStorage.removeItem(AUTH_SESSION_KEY);
};

export const getCurrentUser = (): AuthUser | null => {
  return getSession()?.user ?? null;
};

export const getAuthHeaders = (): Record<string, string> => {
  const session = getSession();
  if (!session) {
    return {};
  }

  return {
    Authorization: `Bearer ${session.token}`,
    'x-user-id': session.user.user_id,
    'x-user-role': session.user.role,
  };
};
