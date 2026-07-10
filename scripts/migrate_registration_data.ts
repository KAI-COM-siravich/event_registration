import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const registrations = await prisma.registration.findMany({
    include: {
      customer: {
        include: {
          user: true
        }
      }
    }
  });

  console.log(`Found ${registrations.length} registrations to migrate...`);

  let count = 0;
  for (const reg of registrations) {
    if (reg.customer && reg.customer.user) {
      await prisma.registration.update({
        where: { id: reg.id },
        data: {
          firstName: reg.customer.user.firstName,
          lastName: reg.customer.user.lastName,
          email: reg.customer.user.email,
          phone: reg.customer.user.phone,
          company: reg.customer.user.company,
          jobPosition: reg.customer.user.jobPosition,
        }
      });
      count++;
    }
  }

  console.log(`Migrated ${count} registrations successfully.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
