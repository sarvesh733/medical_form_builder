import bcrypt from 'bcryptjs';
import { prisma } from '../src/config/db.js';

const MAIN_ADMIN_EMAIL = (process.env.MAIN_ADMIN_EMAIL ?? 'mainadmin@hospital.com').toLowerCase();
const MAIN_ADMIN_PASSWORD = process.env.MAIN_ADMIN_PASSWORD ?? 'MainAdmin@123';
const MAIN_ADMIN_NAME = process.env.MAIN_ADMIN_NAME ?? 'Main Admin';

async function resetSystemData() {
  console.log('Starting system reset...');
  console.log(`Main admin email: ${MAIN_ADMIN_EMAIL}`);

  const passwordHash = await bcrypt.hash(MAIN_ADMIN_PASSWORD, 10);

  await prisma.$transaction(async (tx) => {
    // Delete dependent entities first, then parent entities.
    await tx.scanEventHistory.deleteMany();
    await tx.scanFieldValue.deleteMany();
    await tx.scanEventData.deleteMany();
    await tx.scanEvent.deleteMany();
    await tx.formField.deleteMany();
    await tx.formTemplate.deleteMany();
    await tx.patient.deleteMany();
    await tx.user.deleteMany();

    await tx.user.create({
      data: {
        name: MAIN_ADMIN_NAME,
        email: MAIN_ADMIN_EMAIL,
        role: 'admin',
        password_hash: passwordHash,
        is_approved: true,
        approved_at: new Date(),
      },
    });
  });

  console.log('Reset completed successfully.');
  console.log('All patients and users were deleted.');
  console.log(`Main admin recreated: ${MAIN_ADMIN_EMAIL}`);
}

resetSystemData()
  .catch((error) => {
    console.error('Reset failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
