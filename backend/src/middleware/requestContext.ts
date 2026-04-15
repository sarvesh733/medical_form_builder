import { Request } from 'express';

export const USER_ROLES = ['doctor', 'typist', 'receptionist', 'admin'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export type RequestUser = {
  userId: string | null;
  role: UserRole | null;
};

export const normalizeRole = (value: unknown): UserRole | null => {
  if (typeof value !== 'string') {
    return null;
  }

  const normalized = value.trim().toLowerCase();
  return USER_ROLES.includes(normalized as UserRole) ? (normalized as UserRole) : null;
};

export const getRequestUser = (req: Request): RequestUser => {
  const headerUserId = req.header('x-user-id');
  const headerRole = req.header('x-user-role');
  const bodyUserId = typeof req.body?.user_id === 'string' ? req.body.user_id : null;
  const bodyRole = req.body?.role;

  const userId = (headerUserId ?? bodyUserId ?? null) || null;
  const role = normalizeRole(headerRole ?? bodyRole);

  return { userId, role };
};

export const hasAllowedRole = (role: UserRole | null, allowedRoles: UserRole[]): role is UserRole => {
  return role !== null && allowedRoles.includes(role);
};
