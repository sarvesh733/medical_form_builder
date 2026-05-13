import { Router } from 'express';
import { prisma } from '../config/db.js';
import { getRequestUser, hasAllowedRole } from '../middleware/requestContext.js';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const {
      pid,
      name,
      phone,
      address,
      age,
      dob,
      marital_status,
      martial_status,
      gender,
      state,
      country,
      aadhar_number,
      email,
      trimester,
      created_by,
    } = req.body as {
      pid?: string;
      name?: string;
      phone?: string;
      address?: string;
      age?: number | string;
      dob?: string;
      marital_status?: string;
      martial_status?: string;
      gender?: string;
      state?: string;
      country?: string;
      aadhar_number?: string;
      email?: string;
      trimester?: string;
      created_by?: string;
    };
    const requestUser = getRequestUser(req);

    if (!hasAllowedRole(requestUser.role, ['doctor', 'typist', 'receptionist', 'admin'])) {
      return res.status(403).json({
        message: 'Only doctor, typist, receptionist or admin can create patients',
      });
    }

    const creatorId = requestUser.userId || created_by;
    const maritalStatus = marital_status ?? martial_status;
    const parsedAge = typeof age === 'string' ? Number(age) : age;
    const parsedDob = dob ? new Date(dob) : null;
    const patientTrimester = trimester || 'Early pregnancy';
    
    const requiredFields = [
      pid,
      name,
      phone,
      address,
      maritalStatus,
      gender,
      state,
      country,
      aadhar_number,
      email,
      patientTrimester,
      creatorId,
    ];

    if (requiredFields.some((value) => !value) || !parsedAge || Number.isNaN(parsedAge) || !parsedDob || Number.isNaN(parsedDob.getTime())) {
      return res.status(400).json({
        message: 'pid, name, phone, address, age, dob, marital_status, gender, state, country, aadhar_number, email and user context are required',
      });
    }

    const creatorUserId = creatorId as string;
    const patientPid = pid as string;
    const patientName = name as string;
    const patientPhone = phone as string;
    const patientAddress = address as string;
    const patientAge = parsedAge as number;
    const patientDob = parsedDob as Date;
    const patientMaritalStatus = maritalStatus as string;
    const patientGender = gender as string;
    const patientState = state as string;
    const patientCountry = country as string;
    const patientAadhar = aadhar_number as string;
    const patientEmail = email as string;

    // Ensure the creator account exists in the local environment.
    await prisma.user.upsert({
      where: { user_id: creatorUserId },
      update: {
        role: requestUser.role,
      },
      create: {
        user_id: creatorUserId,
        name: `${requestUser.role} ${creatorUserId}`,
        role: requestUser.role,
        email: `${creatorUserId.toLowerCase()}@local.dev`,
      },
    });

    const patient = await prisma.patient.create({
      data: {
        pid: patientPid,
        name: patientName,
        phone: patientPhone,
        address: patientAddress,
        age: patientAge,
        dob: patientDob,
        marital_status: patientMaritalStatus,
        gender: patientGender,
        state: patientState,
        country: patientCountry,
        aadhar_number: patientAadhar,
        email: patientEmail,
        trimester: patientTrimester,
        scan_type: null,
        created_by: creatorUserId,
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
