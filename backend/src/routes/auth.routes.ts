import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/db.js';
import { normalizeRole } from '../middleware/requestContext.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET ?? 'medical-builder-dev-secret';

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

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        role: normalizedRole,
        password_hash: passwordHash,
      },
      select: {
        user_id: true,
        name: true,
        email: true,
        role: true,
      },
    });

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
    });
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
      },
    });

    if (!user || !user.password_hash) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (user.role !== normalizedRole) {
      return res.status(403).json({ message: 'Selected role does not match this account' });
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

export default router;
