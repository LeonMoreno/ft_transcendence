import { PrismaClient } from '@prisma/client';

import { dataUsers } from './data';

const prisma = new PrismaClient();

async function main() {
  await prisma.user.deleteMany();
  console.info(`🔴 Deleted all users`);

  const createdUsers = await prisma.user.createMany({
    data: dataUsers,
  });
  console.info(`🟢 Created ${createdUsers.count} users`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
