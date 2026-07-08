import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const user = await prisma.user.update({
    where: { email: 'powerappadmin@netcube.co.th' },
    data: { role: 'ADMIN', status: 'APPROVED' }
  });
  console.log('Updated user:', user);
}
main().finally(() => prisma.$disconnect());
