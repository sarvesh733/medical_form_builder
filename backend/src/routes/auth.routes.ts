import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/db.js';
import { normalizeRole } from '../middleware/requestContext.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET ?? 'medical-builder-dev-secret';
const MAIN_ADMIN_EMAIL = (process.env.MAIN_ADMIN_EMAIL ?? 'mainadmin@hospital.com').toLowerCase();

const isMainAdminUser = (user: { role: string; email: string } | null): boolean => {
  if (!user) {
    return false;
  }

  return user.role === 'admin' && user.email.toLowerCase() === MAIN_ADMIN_EMAIL;
};

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body as {
      name?: string;
      email?: string;
      password?: string;
      role?: string;
    };

    const normalizedRole = normalizeRole(role);

    if (!name || !email || !password || !normalizedRole) {
      return res.status(400).json({
        message: 'name, email, password and valid role are required',
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: 'Password must be at least 8 characters long',
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return res.status(409).json({ message: 'Email is already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Only the designated main admin is auto-approved on registration.
    // Any other admin registration stays pending until the main admin approves.
    const isMainAdminRegistration = normalizedRole === 'admin' && email.toLowerCase() === MAIN_ADMIN_EMAIL;

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        role: normalizedRole,
        password_hash: passwordHash,
        is_approved: isMainAdminRegistration,
        approved_at: isMainAdminRegistration ? new Date() : null,
      },
      select: {
        user_id: true,
        name: true,
        email: true,
        role: true,
        is_approved: true,
      },
    });

    // Only issue token if user is approved.
    if (user.is_approved) {
      const token = jwt.sign(
        {
          sub: user.user_id,
          role: user.role,
          email: user.email,
        },
        JWT_SECRET,
        { expiresIn: '12h' },
      );

      return res.status(201).json({
        token,
        user,
        message: 'Registration successful. You are logged in.',
      });
    } else {
      return res.status(201).json({
        user,
        message: 'Registration successful. Awaiting admin approval.',
        requiresApproval: true,
      });
    }
  } catch (error) {
    console.error('Failed to register user:', error);
    return res.status(500).json({ message: 'Failed to register user' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body as {
      email?: string;
      password?: string;
      role?: string;
    };

    const normalizedRole = normalizeRole(role);

    if (!email || !password || !normalizedRole) {
      return res.status(400).json({
        message: 'email, password and role are required',
      });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        user_id: true,
        name: true,
        email: true,
        role: true,
        password_hash: true,
        is_approved: true,
      },
    });

    if (!user || !user.password_hash) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (user.role !== normalizedRole) {
      return res.status(403).json({ message: 'Selected role does not match this account' });
    }

    // Check if user is approved
    if (!user.is_approved) {
      return res.status(403).json({ 
        message: 'Your account is pending admin approval. Please wait for approval before logging in.',
        requiresApproval: true,
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      {
        sub: user.user_id,
        role: user.role,
        email: user.email,
      },
      JWT_SECRET,
      { expiresIn: '12h' },
    );

    return res.json({
      token,
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Failed to login user:', error);
    return res.status(500).json({ message: 'Failed to login user' });
  }
});

// Get pending user approvals (admin only)
router.get('/pending-users', async (req, res) => {
  try {
    const adminRole = req.headers['x-user-role'];
    
    if (adminRole !== 'admin') {
      return res.status(403).json({ message: 'Only admins can view pending users' });
    }

    const pendingUsers = await prisma.user.findMany({
      where: {
        is_approved: false,
      },
      select: {
        user_id: true,
        name: true,
        email: true,
        role: true,
        created_at: true,
      },
      orderBy: {
        created_at: 'asc',
      },
    });

    return res.json({
      pendingUsers,
      count: pendingUsers.length,
    });
  } catch (error) {
    console.error('Failed to fetch pending users:', error);
    return res.status(500).json({ message: 'Failed to fetch pending users' });
  }
});

// Approve a user (admin only)
router.post('/users/:userId/approve', async (req, res) => {
  try {
    const adminRole = req.headers['x-user-role'];
    const adminId = req.headers['x-user-id'] as string;
    const { userId } = req.params;

    if (adminRole !== 'admin') {
      return res.status(403).json({ message: 'Only admins can approve users' });
    }

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const approver = await prisma.user.findUnique({
      where: { user_id: adminId },
      select: {
        role: true,
        email: true,
      },
    });

    if (!approver || approver.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can approve users' });
    }

    const targetUser = await prisma.user.findUnique({
      where: { user_id: userId },
      select: {
        user_id: true,
        role: true,
      },
    });

    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Admin accounts can only be approved by the main admin.
    if (targetUser.role === 'admin' && !isMainAdminUser(approver)) {
      return res.status(403).json({ message: 'Only the main admin can approve admin accounts' });
    }

    const user = await prisma.user.update({
      where: { user_id: userId },
      data: {
        is_approved: true,
        approved_at: new Date(),
        approver_id: adminId,
      },
      select: {
        user_id: true,
        name: true,
        email: true,
        role: true,
        is_approved: true,
        approved_at: true,
      },
    });

    return res.json({
      message: 'User approved successfully',
      user,
    });
  } catch (error) {
    console.error('Failed to approve user:', error);
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.status(500).json({ message: 'Failed to approve user' });
  }
});

// Reject a user (admin only)
router.post('/users/:userId/reject', async (req, res) => {
  try {
    const adminRole = req.headers['x-user-role'];
    const { userId } = req.params;

    if (adminRole !== 'admin') {
      return res.status(403).json({ message: 'Only admins can reject users' });
    }

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    await prisma.user.delete({
      where: { user_id: userId },
    });

    return res.json({
      message: 'User rejected and account deleted successfully',
    });
  } catch (error) {
    console.error('Failed to reject user:', error);
    if (error instanceof Error && error.message.includes('Record to delete not found')) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.status(500).json({ message: 'Failed to reject user' });
  }
});

// Get all users (admin only)
router.get('/all-users', async (req, res) => {
  try {
    const adminRole = req.headers['x-user-role'];
    
    if (adminRole !== 'admin') {
      return res.status(403).json({ message: 'Only admins can view all users' });
    }

    const users = await prisma.user.findMany({
      select: {
        user_id: true,
        name: true,
        email: true,
        role: true,
        is_approved: true,
        created_at: true,
        approved_at: true,
      },
      orderBy: [
        { is_approved: 'asc' },
        { created_at: 'desc' },
      ],
    });

    return res.json({
      users,
      count: users.length,
    });
  } catch (error) {
    console.error('Failed to fetch all users:', error);
    return res.status(500).json({ message: 'Failed to fetch all users' });
  }
});

// Delete a user (admin only) - can delete any user including approved ones
router.delete('/users/:userId', async (req, res) => {
  try {
    const adminRole = req.headers['x-user-role'];
    const adminId = req.headers['x-user-id'] as string;
    const { userId } = req.params;

    if (adminRole !== 'admin') {
      return res.status(403).json({ message: 'Only admins can delete users' });
    }

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const actingAdmin = await prisma.user.findUnique({
      where: { user_id: adminId },
      select: {
        role: true,
        email: true,
      },
    });

    if (!actingAdmin || actingAdmin.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can delete users' });
    }

    // Prevent admin from deleting themselves
    if (userId === adminId) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    const user = await prisma.user.findUnique({
      where: { user_id: userId },
      select: { name: true, email: true, role: true },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Main admin account cannot be deleted.
    if (user.role === 'admin' && user.email.toLowerCase() === MAIN_ADMIN_EMAIL) {
      return res.status(403).json({ message: 'Main admin account cannot be deleted' });
    }

    // Check if user has related records that would prevent deletion
    const patientCount = await prisma.patient.count({
      where: { created_by: userId },
    });

    const scanEventCount = await prisma.scanEvent.count({
      where: { doctor_id: userId },
    });

    if (patientCount > 0 || scanEventCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete user. They have ${patientCount} patient(s) created and/or are assigned to ${scanEventCount} scan event(s). Please reassign or remove their records first.` 
      });
    }

    await prisma.user.delete({
      where: { user_id: userId },
    });

    return res.json({
      message: 'User deleted successfully',
      deletedUser: user,
    });
  } catch (error) {
    console.error('Failed to delete user:', error);
    if (error instanceof Error && error.message.includes('Record to delete not found')) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.status(500).json({ message: 'Failed to delete user' });
  }
});

export default router;
