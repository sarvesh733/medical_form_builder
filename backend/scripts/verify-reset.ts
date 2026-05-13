import { prisma } from '../src/config/db.js';

async function verifyReset() {
  const patientsCount = await prisma.patient.count();
  const users = await prisma.user.findMany({
    select: {
      email: true,
      role: true,
      is_approved: true,
    },
    orderBy: {
      email: 'asc',
    },
  });

  console.log('patients_count=', patientsCount);
  console.log('users=', users);
}

verifyReset()
  .catch((error) => {
    console.error('Verification failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
