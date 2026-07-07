import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function saveRegistration(data: any) {
  // Check for duplicate email
  const existingCustomer = await prisma.Registration.findUnique({
    where: { email: data.email },
  });

  if (existingCustomer) {
    throw new Error('A customer with this email is already registered.');
  }

  // Check blacklist
  const blacklisted = await prisma.Blacklist.findUnique({
    where: { email: data.email },
  });

  if (blacklisted) {
    throw new Error('This email is blacklisted.');
  }

  // Save registration with status Pending
  const newRegistration = await prisma.Registration.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      jobPosition: data.jobPosition,
      company: data.company,
      travelMethod: data.travelMethod,
      needHotel: data.needHotel,
      plannedUpgrade: data.plannedUpgrade,
      projectByYear: data.projectByYear,
      salesOwner: data.salesOwner,
      status: 'PENDING',
    },
  });

  return newRegistration;
}