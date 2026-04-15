import { Router } from 'express';
import { prisma } from '../config/db.js';
import { getRequestUser, hasAllowedRole } from '../middleware/requestContext.js';

type IncomingField = {
  field_name?: string;
  standard_key?: string;
  field_type?: string;
  is_required?: boolean;
  sort_order?: number;
  section_id?: string;
  section_title?: string;
};

const router = Router();

router.post('/', async (req, res) => {
  try {
    const requestUser = getRequestUser(req);
    if (!hasAllowedRole(requestUser.role, ['doctor', 'admin'])) {
      return res.status(403).json({
        message: 'Only doctor or admin can create templates',
      });
    }

    const { doctor_id, scan_type, title, fields } = req.body as {
      doctor_id?: string;
      scan_type?: string;
      title?: string;
      fields?: IncomingField[];
    };

    if (!doctor_id || !scan_type || !Array.isArray(fields) || fields.length === 0) {
      return res.status(400).json({
        message: 'doctor_id, scan_type and non-empty fields are required',
      });
    }

    const createdTemplate = await prisma.$transaction(async (tx) => {
      // Week 2 uses hardcoded doctor_id in the frontend; auto-create doctor stub if missing.
      await tx.user.upsert({
        where: { user_id: doctor_id },
        update: {},
        create: {
          user_id: doctor_id,
          name: `Doctor ${doctor_id}`,
          role: 'doctor',
          email: `${doctor_id.toLowerCase()}@local.dev`,
        },
      });

      const latestTemplate = await tx.formTemplate.findFirst({
        where: { doctor_id, scan_type },
        orderBy: { version: 'desc' },
        select: { version: true },
      });

      const version = (latestTemplate?.version ?? 0) + 1;

      const template = await tx.formTemplate.create({
        data: {
          doctor_id,
          scan_type,
          title: title ?? `${scan_type} Template`,
          version,
        },
      });

      await tx.formField.createMany({
        data: fields.map((field, index) => ({
          template_id: template.template_id,
          section_id: field.section_id ?? 'default-section',
          section_title: field.section_title ?? 'Default Section',
          field_name: field.field_name ?? `Field ${index + 1}`,
          standard_key: field.standard_key ?? `field_${index + 1}`,
          field_type: field.field_type ?? 'text',
          is_required: field.is_required ?? false,
          sort_order: field.sort_order ?? index,
        })),
      });

      return tx.formTemplate.findUnique({
        where: { template_id: template.template_id },
        include: {
          fields: {
            orderBy: [{ section_id: 'asc' }, { sort_order: 'asc' }],
          },
        },
      });
    });

    return res.status(201).json(createdTemplate);
  } catch (error) {
    console.error('Failed to create template:', error);
    return res.status(500).json({ message: 'Failed to create template' });
  }
});

router.get('/', async (req, res) => {
  try {
    const requestUser = getRequestUser(req);
    if (!hasAllowedRole(requestUser.role, ['doctor', 'typist', 'admin'])) {
      return res.status(403).json({
        message: 'Role not allowed to view templates',
      });
    }

    const doctorId = req.query.doctor_id;

    if (typeof doctorId !== 'string' || !doctorId) {
      return res.status(400).json({ message: 'doctor_id query param is required' });
    }

    const templates = await prisma.formTemplate.findMany({
      where: { doctor_id: doctorId },
      include: {
        fields: {
          orderBy: [{ section_id: 'asc' }, { sort_order: 'asc' }],
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return res.json(templates);
  } catch (error) {
    console.error('Failed to fetch templates:', error);
    return res.status(500).json({ message: 'Failed to fetch templates' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const requestUser = getRequestUser(req);
    if (!hasAllowedRole(requestUser.role, ['doctor', 'typist', 'admin'])) {
      return res.status(403).json({
        message: 'Role not allowed to view template details',
      });
    }

    const { id } = req.params;
    const template = await prisma.formTemplate.findUnique({
      where: { template_id: id },
      include: {
        fields: {
          orderBy: [{ section_id: 'asc' }, { sort_order: 'asc' }],
        },
      },
    });

    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    return res.json(template);
  } catch (error) {
    console.error('Failed to fetch template by id:', error);
    return res.status(500).json({ message: 'Failed to fetch template' });
  }
});

export default router;
