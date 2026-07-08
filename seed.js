const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database with mock data...");
  
  await prisma.reward.deleteMany();
  await prisma.boothVisit.deleteMany();
  await prisma.checkIn.deleteMany();
  await prisma.qRCode.deleteMany();
  await prisma.registration.deleteMany();
  await prisma.booth.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.event.deleteMany();
  await prisma.user.deleteMany({ where: { role: "CUSTOMER" } });

  // 1. Create Events
  const event1 = await prisma.event.create({
    data: { name: "Global Tech Summit 2026", location: "Bangkok", date: new Date("2026-08-01") },
  });
  const event2 = await prisma.event.create({
    data: { name: "AI Developer Conference", location: "Singapore", date: new Date("2026-09-15") },
  });

  // 2. Create Booths
  const booth1 = await prisma.booth.create({
    data: { name: "Microsoft Azure", eventId: event1.id },
  });
  const booth2 = await prisma.booth.create({
    data: { name: "Google Cloud", eventId: event1.id },
  });
  const booth3 = await prisma.booth.create({
    data: { name: "DeepMind", eventId: event2.id },
  });

  // 3. Create Users & Customers & Registrations
  const users = [
    { email: "john.doe@example.com", firstName: "John", lastName: "Doe", company: "TechCorp", status: "APPROVED", eventId: event1.id },
    { email: "jane.smith@example.com", firstName: "Jane", lastName: "Smith", company: "StartupInc", status: "CHECKEDIN", eventId: event1.id },
    { email: "bob.wilson@example.com", firstName: "Bob", lastName: "Wilson", company: "Enterprise LLC", status: "PENDING", eventId: event2.id },
    { email: "alice.chen@example.com", firstName: "Alice", lastName: "Chen", company: "AI Labs", status: "CHECKEDIN", eventId: event2.id },
    { email: "charlie.brown@example.com", firstName: "Charlie", lastName: "Brown", company: "DevStudio", status: "APPROVED", eventId: event2.id },
  ];

  for (const u of users) {
    // Create User
    const user = await prisma.user.create({
      data: {
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        phone: "555" + Date.now().toString().slice(-7) + Math.floor(Math.random() * 100),
        company: u.company,
        role: "CUSTOMER",
        status: "APPROVED",
      },
    });

    // Create Customer
    const customer = await prisma.customer.create({
      data: { userId: user.id },
    });

    // Create Registration
    const registration = await prisma.registration.create({
      data: {
        customerId: customer.id,
        eventId: u.eventId,
        status: u.status,
      },
    });

    // If APPROVED or CHECKEDIN, create QR code
    if (u.status === "APPROVED" || u.status === "CHECKEDIN") {
      const qrCode = await prisma.qRCode.create({
        data: { registrationId: registration.id },
      });

      // If CHECKEDIN, create checkin record
      if (u.status === "CHECKEDIN") {
        await prisma.checkIn.create({
          data: { registrationId: registration.id, badgePrinted: true },
        });

        // Add some booth visits
        if (u.eventId === event1.id) {
          await prisma.boothVisit.create({
            data: { boothId: booth1.id, customerId: customer.id }
          });
          await prisma.boothVisit.create({
            data: { boothId: booth2.id, customerId: customer.id }
          });
          // And a reward
          await prisma.reward.create({
            data: { customerId: customer.id, eventId: event1.id }
          });
        } else {
          await prisma.boothVisit.create({
            data: { boothId: booth3.id, customerId: customer.id }
          });
        }
      }
    }
  }

  console.log("Mock data seeded successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
