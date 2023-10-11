import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const createdUser = await prisma.user.create({
    data: {
      email: 'jnicolas@student.42quebec.com',
      nickname: 'Jonathan',
      username: 'jnicolas',
    },
  });
  console.log(createdUser);
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
