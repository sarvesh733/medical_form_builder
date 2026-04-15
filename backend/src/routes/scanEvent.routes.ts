import { Router } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../config/db.js';
import { getRequestUser, hasAllowedRole } from '../middleware/requestContext.js';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const requestUser = getRequestUser(req);
    if (!hasAllowedRole(requestUser.role, ['doctor', 'typist', 'admin'])) {
      return res.status(403).json({
        message: 'Only doctor, typist, or admin can create scan events',
      });
    }

    const { patient_id, doctor_id, template_id, created_by } = req.body as {
      patient_id?: string;
      doctor_id?: string;
      template_id?: string;
      created_by?: string;
    };

    const actorId = requestUser.userId ?? created_by;

    if (!patient_id || !doctor_id || !template_id || !actorId) {
      return res.status(400).json({
        message: 'patient_id, doctor_id, template_id and creator context are required',
      });
    }

    const [patient, doctor, template] = await Promise.all([
      prisma.patient.findUnique({ where: { patient_id } }),
      prisma.user.findUnique({ where: { user_id: doctor_id } }),
      prisma.formTemplate.findUnique({ where: { template_id } }),
    ]);

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    const existingEvent = await prisma.scanEvent.findFirst({
      where: {
        patient_id,
        template_id,
      },
      orderBy: {
        updated_at: 'desc',
      },
    });

    if (existingEvent) {
      return res.status(200).json({
        ...existingEvent,
        reused: true,
      });
    }

    const event = await prisma.scanEvent.create({
      data: {
        patient_id,
        doctor_id,
        template_id,
        created_by: actorId,
        status: 'draft',
      },
    });

    return res.status(201).json({
      ...event,
      reused: false,
    });
  } catch (error) {
    console.error('Failed to create scan event:', error);
    return res.status(500).json({ message: 'Failed to create scan event' });
  }
});

router.post('/:id/data', async (req, res) => {
  try {
    const requestUser = getRequestUser(req);
    if (!hasAllowedRole(requestUser.role, ['doctor', 'typist', 'admin'])) {
      return res.status(403).json({
        message: 'Only doctor, typist, or admin can save scan data',
      });
    }

    const { id } = req.params;
    const { data } = req.body as { data?: Record<string, unknown> };

    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      return res.status(400).json({ message: 'data object is required' });
    }

    const event = await prisma.scanEvent.findUnique({
      where: { event_id: id },
      include: {
        template: {
          include: {
            fields: {
              select: {
                standard_key: true,
                field_type: true,
              },
            },
          },
        },
      },
    });

    if (!event) {
      return res.status(404).json({ message: 'Scan event not found' });
    }

    const allowedKeys = new Set(event.template.fields.map((field) => field.standard_key));
    const matrixRoots = event.template.fields
      .filter((field) => ['doppler-matrix', 'biometry-matrix'].includes(field.field_type))
      .map((field) => field.standard_key);

    const isAllowedDerivedKey = (key: string) => matrixRoots.some((root) => key.startsWith(`${root}_`));
    const invalidKeys = Object.keys(data).filter((key) => !allowedKeys.has(key) && !isAllowedDerivedKey(key));

    if (invalidKeys.length > 0) {
      return res.status(400).json({
        message: 'One or more keys are not part of this template',
        invalid_keys: invalidKeys,
      });
    }

    const payload = data as Prisma.InputJsonValue;

    await prisma.scanEventData.upsert({
      where: { event_id: id },
      update: { data: payload },
      create: {
        event_id: id,
        data: payload,
      },
    });

    await prisma.scanEvent.update({
      where: { event_id: id },
      data: { status: 'draft' },
    });

    return res.json({ message: 'Saved' });
  } catch (error) {
    console.error('Failed to save scan event data:', error);
    return res.status(500).json({ message: 'Failed to save scan event data' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const requestUser = getRequestUser(req);
    if (!hasAllowedRole(requestUser.role, ['doctor', 'typist', 'admin'])) {
      return res.status(403).json({
        message: 'Only doctor, typist, or admin can view scan events',
      });
    }

    const { id } = req.params;

    const event = await prisma.scanEvent.findUnique({
      where: { event_id: id },
      include: {
        data: true,
        patient: true,
        doctor: {
          select: {
            user_id: true,
            name: true,
            role: true,
            email: true,
          },
        },
        template: {
          include: {
            fields: {
              orderBy: [{ section_id: 'asc' }, { sort_order: 'asc' }],
            },
          },
        },
      },
    });

    if (!event) {
      return res.status(404).json({ message: 'Scan event not found' });
    }

    return res.json(event);
  } catch (error) {
    console.error('Failed to fetch scan event:', error);
    return res.status(500).json({ message: 'Failed to fetch scan event' });
  }
});

export default router;
