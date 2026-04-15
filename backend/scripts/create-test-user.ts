import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { email: 'dr.test@example.com' },
    update: {},
    create: {
      name: 'Dr Test',
      role: 'doctor',
      email: 'dr.test@example.com',
    },
  });

  console.log(JSON.stringify(user, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
