import { Router } from 'express';
import { prisma } from '../config/db.js';
import { getRequestUser, hasAllowedRole } from '../middleware/requestContext.js';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const { name, created_by } = req.body as { name?: string; created_by?: string };
    const requestUser = getRequestUser(req);

    if (!hasAllowedRole(requestUser.role, ['receptionist', 'admin'])) {
      return res.status(403).json({
        message: 'Only receptionist or admin can create patients',
      });
    }

    const creatorId = requestUser.userId || created_by;

    if (!name || !creatorId) {
      return res.status(400).json({
        message: 'name and user context are required',
      });
    }

    // Ensure the creator account exists in the local environment.
    await prisma.user.upsert({
      where: { user_id: creatorId },
      update: {
        role: requestUser.role,
      },
      create: {
        user_id: creatorId,
        name: `${requestUser.role} ${creatorId}`,
        role: requestUser.role,
        email: `${creatorId.toLowerCase()}@local.dev`,
      },
    });

    const patient = await prisma.patient.create({
      data: {
        name,
        created_by: creatorId,
      },
    });

    return res.status(201).json(patient);
  } catch (error) {
    console.error('Failed to create patient:', error);
    return res.status(500).json({
      message: 'Failed to create patient',
    });
  }
});

router.get('/', async (_req, res) => {
  try {
    const requestUser = getRequestUser(_req);

    if (!hasAllowedRole(requestUser.role, ['doctor', 'typist', 'receptionist', 'admin'])) {
      return res.status(403).json({
        message: 'Role not allowed to view patients',
      });
    }

    const patients = await prisma.patient.findMany({
      orderBy: { created_at: 'desc' },
    });

    return res.json(patients);
  } catch (error) {
    console.error('Failed to fetch patients:', error);
    return res.status(500).json({
      message: 'Failed to fetch patients',
    });
  }
});

export default router;
