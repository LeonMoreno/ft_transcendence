import { PrismaClient } from '@prisma/client';

import { dataUsers } from './data';
import { dataGames } from './data/games';

const prisma = new PrismaClient();

async function main() {
  await prisma.user.deleteMany();
  console.info(`🔴 Deleted all users`);

  const createdUsers = await prisma.user.createMany({
    data: dataUsers,
  });
  console.info(`🟢 Created ${createdUsers.count} users`);

  const foundUsers = await prisma.user.findMany();
  const dataGamesWithUserId = dataGames.map((game) => {
    const inviter = foundUsers.find((user) => {
      if (user.username == game.inviteeUsername) return user;
    });
    const invitee = foundUsers.find((user) => {
      if (user.username == game.inviteeUsername) return user;
    });
    return {
      inviterId: inviter.id,
      inviteeId: invitee.id,
      invitationStatus: game.invitationStatus,
    };
  });
  await prisma.game.deleteMany();
  console.info(`🔴 Deleted all games`);

  const createdGames = await prisma.game.createMany({
    data: dataGamesWithUserId,
  });
  console.info(`🟢 Created ${createdGames.count} games`);
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
