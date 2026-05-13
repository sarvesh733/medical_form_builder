import { Router } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../config/db.js';
import { getRequestUser, hasAllowedRole } from '../middleware/requestContext.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const requestUser = getRequestUser(req);
    if (!hasAllowedRole(requestUser.role, ['doctor', 'typist', 'receptionist', 'admin'])) {
      return res.status(403).json({
        message: 'Only doctor, typist, receptionist, or admin can view scan events',
      });
    }

    const { patient_id } = req.query as { patient_id?: string };

    if (!patient_id) {
      return res.status(400).json({ message: 'patient_id query parameter is required' });
    }

    const events = await prisma.scanEvent.findMany({
      where: { patient_id },
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
      orderBy: { visit_date: 'desc' },
    });

    return res.json(events);
  } catch (error) {
    console.error('Failed to fetch patient scan events:', error);
    return res.status(500).json({ message: 'Failed to fetch patient scan events' });
  }
});

router.post('/', async (req, res) => {
  try {
    const requestUser = getRequestUser(req);
    if (!hasAllowedRole(requestUser.role, ['doctor', 'typist', 'receptionist', 'admin'])) {
      return res.status(403).json({
        message: 'Only doctor, typist, receptionist, or admin can create scan events',
      });
    }

    const { patient_id, doctor_id, template_id, scan_type, visit_date, created_by } = req.body as {
      patient_id?: string;
      doctor_id?: string;
      template_id?: string;
      scan_type?: string;
      visit_date?: string;
      created_by?: string;
    };

    // Use userId from request context, or created_by from body, or fallback to role
    const actorId = requestUser.userId ?? created_by ?? (requestUser.role ? `${requestUser.role}_user` : null);

    // Either template_id OR scan_type must be provided
    if (!patient_id || !doctor_id || !actorId || (!template_id && !scan_type)) {
      console.error('[scanEvent POST] Validation failed:', {
        patient_id,
        doctor_id,
        actorId,
        template_id,
        scan_type,
        requestUser,
        created_by,
      });
      return res.status(400).json({
        message: 'patient_id, doctor_id, creator context, and either template_id or scan_type are required',
      });
    }

    const [patient, doctor, template] = await Promise.all([
      prisma.patient.findUnique({ where: { patient_id } }),
      prisma.user.findUnique({ where: { user_id: doctor_id } }),
      template_id ? prisma.formTemplate.findUnique({ where: { template_id } }) : Promise.resolve(null),
    ]);

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    if (!doctor) {
      // Auto-create doctor stub if missing (for system defaults like D01)
      const newDoctor = await prisma.user.create({
        data: {
          user_id: doctor_id,
          name: `Doctor ${doctor_id}`,
          role: 'doctor',
          email: `${doctor_id.toLowerCase()}@local.dev`,
        },
      });
      console.log(`Auto-created doctor stub: ${doctor_id}`);
    }

    if (template_id && !template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    // Use provided visit_date or default to today
    const eventVisitDate = visit_date ? new Date(visit_date) : new Date();
    const scanTypeToUse = scan_type || template?.scan_type || 'Unknown';

    const event = await prisma.$transaction(async (tx) => {
      await tx.patient.update({
        where: { patient_id },
        data: { scan_type: scanTypeToUse },
      });

      return tx.scanEvent.create({
        data: {
          patient_id,
          doctor_id,
          template_id: template_id || null,
          scan_type: scanTypeToUse,
          visit_date: eventVisitDate,
          created_by: actorId,
          status: 'draft',
        },
      });
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
    if (!hasAllowedRole(requestUser.role, ['doctor', 'typist', 'receptionist', 'admin'])) {
      return res.status(403).json({
        message: 'Only doctor, typist, receptionist, or admin can save scan data',
      });
    }

    const { id } = req.params;
    const { data } = req.body as { data?: Record<string, unknown> };
    const actorUserId = requestUser.userId || `${requestUser.role}_user`;
    const actorRole = requestUser.role;

    if (!actorUserId) {
      return res.status(400).json({ message: 'user_id context is required' });
    }

    if (!actorRole) {
      return res.status(400).json({ message: 'role context is required' });
    }

    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      return res.status(400).json({ message: 'data object is required' });
    }

    const event = await prisma.scanEvent.findUnique({
      where: { event_id: id },
      include: {
        data: true,
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

    // If template exists, validate keys against template fields
    if (event.template && event.template.fields) {
      const allowedKeys = new Set(event.template.fields.map((field) => field.standard_key));
      const matrixRoots = event.template.fields
        .filter((field) => ['doppler-matrix', 'biometry-matrix'].includes(field.field_type))
        .map((field) => field.standard_key);

      const isAllowedDerivedKey = (key: string) => matrixRoots.some((root) => key.startsWith(`${root}_`));
      const invalidKeys = Object.keys(data).filter((key) => !allowedKeys.has(key) && !isAllowedDerivedKey(key));

      if (invalidKeys.length > 0) {
        console.warn(`[scanEvent data] Invalid keys for template: ${invalidKeys.join(', ')}`);
        // Continue anyway - don't reject, just log warning
      }
    } else {
      console.log(`[scanEvent data] No template for event ${id}, saving data without field validation`);
    }

    const payload = data as Prisma.InputJsonValue;

    const oldData = ((event.data?.data as Record<string, unknown> | null) ?? {}) as Prisma.InputJsonValue;

    await prisma.$transaction(async (tx) => {
      await tx.scanEventData.upsert({
        where: { event_id: id },
        update: { data: payload },
        create: {
          event_id: id,
          data: payload,
        },
      });

      await tx.scanEvent.update({
        where: { event_id: id },
        data: { status: 'completed' },
      });

      await tx.scanEventHistory.create({
        data: {
          event_id: id,
          old_data: oldData,
          new_data: payload,
          edited_by: actorUserId,
          edited_role: actorRole,
        },
      });
    });

    return res.json({ message: 'Saved' });
  } catch (error) {
    console.error('Failed to save scan event data:', error);
    if (error instanceof Error) {
      return res.status(500).json({ message: `Failed to save scan event data: ${error.message}` });
    }
    return res.status(500).json({ message: 'Failed to save scan event data' });
  }
});

router.get('/:id/history', async (req, res) => {
  try {
    const requestUser = getRequestUser(req);
    if (!hasAllowedRole(requestUser.role, ['doctor', 'typist', 'receptionist', 'admin'])) {
      return res.status(403).json({
        message: 'Only doctor, typist, receptionist, or admin can view scan event history',
      });
    }

    const { id } = req.params;

    const history = await prisma.scanEventHistory.findMany({
      where: { event_id: id },
      include: {
        editor: {
          select: {
            user_id: true,
            name: true,
            role: true,
            email: true,
          },
        },
      },
      orderBy: { edited_at: 'desc' },
    });

    return res.json(history);
  } catch (error) {
    console.error('Failed to fetch scan event history:', error);
    return res.status(500).json({ message: 'Failed to fetch scan event history' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const requestUser = getRequestUser(req);
    if (!hasAllowedRole(requestUser.role, ['doctor', 'typist', 'receptionist', 'admin'])) {
      return res.status(403).json({
        message: 'Only doctor, typist, receptionist, or admin can view scan events',
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
