import { prisma } from '../src/config/db.js';

async function deleteTestUsers() {
  try {
    console.log('Deleting all non-admin users and their related data...');
    
    // Get all non-admin users
    const testUsers = await prisma.user.findMany({
      where: {
        role: {
          not: 'admin',
        },
      },
      select: {
        user_id: true,
      },
    });

    console.log(`Found ${testUsers.length} non-admin users to delete`);

    // Delete in transaction to handle cascading deletes
    const result = await prisma.$transaction(async (tx) => {
      let deletedCount = 0;

      for (const user of testUsers) {
        // Delete scan events for patients created by this user (cascade deletes field values and history)
        await tx.scanEvent.deleteMany({
          where: {
            patient: {
              created_by: user.user_id,
            },
          },
        });

        // Delete scan events where this user is the doctor
        await tx.scanEvent.deleteMany({
          where: { doctor_id: user.user_id },
        });

        // Delete patients created by this user
        await tx.patient.deleteMany({
          where: { created_by: user.user_id },
        });

        // Delete templates created by this user
        await tx.formTemplate.deleteMany({
          where: { doctor_id: user.user_id },
        });

        // Delete the user
        await tx.user.delete({
          where: { user_id: user.user_id },
        });

        deletedCount++;
      }

      return deletedCount;
    });

    console.log(`✅ Deleted ${result} test users and their related data`);
    
    // Show remaining admin users
    const admins = await prisma.user.findMany({
      where: { role: 'admin' },
      select: {
        user_id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    console.log(`✅ Remaining admin users: ${admins.length}`);
    admins.forEach(admin => {
      console.log(`  - ${admin.name} (${admin.email})`);
    });

  } catch (error) {
    console.error('Error deleting users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteTestUsers();
