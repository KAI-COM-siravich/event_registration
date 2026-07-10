import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const registrations = await prisma.registration.findMany({
    where: {
      customer: {
        user: {
          email: {
            not: {
              startsWith: 'copy_'
            }
          }
        }
      }
    },
    include: {
      customer: {
        include: {
          user: true,
          boothVisits: true,
          rewards: true
        }
      },
      checkIn: true,
      qrCode: true
    }
  });

  console.log(`Found ${registrations.length} original registrations. Duplicating...`);

  let count = 0;
  for (const reg of registrations) {
    const user = reg.customer.user;
    
    // Create new user
    const newUser = await prisma.user.create({
      data: {
        email: `copy_${count}_${Date.now()}_${user.email}`,
        phone: user.phone ? `copy_${count}_${Date.now()}_${user.phone}` : undefined,
        firstName: `${user.firstName} (Copy)`,
        lastName: user.lastName,
        company: user.company,
        jobPosition: user.jobPosition,
        role: user.role,
        status: user.status,
      }
    });

    // Create new customer
    const newCustomer = await prisma.customer.create({
      data: {
        userId: newUser.id
      }
    });

    // Create new registration
    const newReg = await prisma.registration.create({
      data: {
        customerId: newCustomer.id,
        eventId: reg.eventId,
        status: reg.status,
        travelMethod: reg.travelMethod,
        needHotel: reg.needHotel,
        salesRep: reg.salesRep,
        plannedUpgrade: reg.plannedUpgrade,
        projectByYear: reg.projectByYear,
        consent: reg.consent,
      }
    });

    // Duplicate CheckIn
    if (reg.checkIn) {
      await prisma.checkIn.create({
        data: {
          registrationId: newReg.id,
          date: reg.checkIn.date,
          badgePrinted: reg.checkIn.badgePrinted,
        }
      });
    }

    // Duplicate QRCode
    if (reg.qrCode) {
      await prisma.qRCode.create({
        data: {
          registrationId: newReg.id,
        }
      });
    }

    // Duplicate BoothVisits
    for (const visit of reg.customer.boothVisits) {
      await prisma.boothVisit.create({
        data: {
          boothId: visit.boothId,
          customerId: newCustomer.id,
          timestamp: visit.timestamp,
        }
      });
    }

    // Duplicate Rewards
    for (const reward of reg.customer.rewards) {
      await prisma.reward.create({
        data: {
          customerId: newCustomer.id,
          eventId: reward.eventId,
          createdAt: reward.createdAt,
        }
      });
    }

    count++;
  }

  console.log(`Duplicated ${registrations.length} registrations and related data successfully.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
