import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

const prisma = new PrismaClient();

function generateToken() {
  return crypto.randomBytes(16).toString('hex');
}

async function main() {
  console.log('Seeding mock data...');

  // Clear existing mock data (except SystemConfig)
  await prisma.boothVisit.deleteMany();
  await prisma.reward.deleteMany();
  await prisma.checkIn.deleteMany();
  await prisma.qRCode.deleteMany();
  await prisma.registration.deleteMany();
  await prisma.booth.deleteMany();
  await prisma.event.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.blacklist.deleteMany();
  await prisma.user.deleteMany(); // Since this is a test environment, clearing all users is fine

  // Create Event
  const event = await prisma.event.create({
    data: {
      name: 'Global Tech Summit 2026',
      description: 'The largest technology conference of the year.',
      date: new Date('2026-08-15T09:00:00Z'),
      location: 'Grand Exhibition Center, Hall A',
    },
  });

  // Create Booths
  const boothsData = [
    { name: 'Google Cloud', eventId: event.id },
    { name: 'Microsoft Azure', eventId: event.id },
    { name: 'Amazon Web Services', eventId: event.id },
    { name: 'OpenAI', eventId: event.id },
    { name: 'Vercel', eventId: event.id },
  ];
  
  const booths = [];
  for (const b of boothsData) {
    booths.push(await prisma.booth.create({ data: b }));
  }

  // Create Users (Staff/Admin)
  await prisma.user.createMany({
    data: [
      {
        email: 'admin@event.local',
        firstName: 'Super',
        lastName: 'Admin',
        role: 'ADMIN',
        status: 'APPROVED',
      },
      {
        email: 'staff1@event.local',
        firstName: 'John',
        lastName: 'Doe',
        role: 'STAFF',
        status: 'APPROVED',
      },
    ],
  });

  // Create Blacklist
  await prisma.blacklist.create({
    data: {
      email: 'spammer@fake.com',
      reason: 'Known spammer',
    },
  });

  // Create Registrations (Attendees) - User -> Customer -> Registration
  const attendeesData = [
    {
      firstName: 'Alice',
      lastName: 'Smith',
      email: 'alice.smith@example.com',
      company: 'Tech Corp',
      status: 'APPROVED',
    },
    {
      firstName: 'Bob',
      lastName: 'Jones',
      email: 'bob.jones@example.com',
      company: 'Data Inc',
      status: 'CHECKEDIN',
    },
    {
      firstName: 'Charlie',
      lastName: 'Brown',
      email: 'charlie.brown@example.com',
      company: 'Design Co',
      status: 'PENDING',
    },
    {
      firstName: 'David',
      lastName: 'Wilson',
      email: 'david.wilson@example.com',
      company: 'Cloud Solutions',
      status: 'APPROVED',
    },
    {
      firstName: 'Eve',
      lastName: 'Davis',
      email: 'eve.davis@example.com',
      company: 'Security LLC',
      status: 'CANCELLED',
    },
  ];

  const regs = [];
  for (const a of attendeesData) {
    const user = await prisma.user.create({
      data: {
        email: a.email,
        firstName: a.firstName,
        lastName: a.lastName,
        company: a.company,
        role: 'CUSTOMER',
        status: 'APPROVED',
      }
    });

    const customer = await prisma.customer.create({
      data: {
        userId: user.id
      }
    });

    const registration = await prisma.registration.create({
      data: {
        customerId: customer.id,
        eventId: event.id,
        status: a.status,
        qrCode: {
          create: {
            token: generateToken()
          }
        }
      }
    });

    regs.push(registration);

    // If checked in, create checkIn record
    if (a.status === 'CHECKEDIN') {
      await prisma.checkIn.create({
        data: {
          registrationId: registration.id,
          badgePrinted: true,
        }
      });
    }
  }

  // Create Booth visits
  await prisma.boothVisit.create({
    data: {
      customerId: regs[1].customerId,
      boothId: booths[0].id,
    },
  });
  await prisma.boothVisit.create({
    data: {
      customerId: regs[1].customerId,
      boothId: booths[1].id,
    },
  });
  await prisma.boothVisit.create({
    data: {
      customerId: regs[0].customerId, // Alice
      boothId: booths[2].id,
    },
  });

  // Create Rewards
  await prisma.reward.create({
    data: {
      customerId: regs[1].customerId,
      eventId: event.id,
    },
  });

  console.log('Mock data seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
