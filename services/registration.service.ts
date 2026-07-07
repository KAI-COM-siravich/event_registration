import prisma from '../lib/prisma';

export async function saveRegistration(data: {
  customerId: string;
  eventId: string;
}) {
  // Check for existing registration for this customer+event
  const existingRegistration = await prisma.registration.findFirst({
    where: {
      customerId: data.customerId,
      eventId: data.eventId,
    },
  });

  if (existingRegistration) {
    throw new Error('This customer is already registered for this event.');
  }

  // Check if customer's linked user email is blacklisted
  const customer = await prisma.customer.findUnique({
    where: { id: data.customerId },
    include: { user: true },
  });

  if (customer?.user?.email) {
    const blacklisted = await prisma.blacklist.findUnique({
      where: { email: customer.user.email },
    });

    if (blacklisted?.active) {
      throw new Error('This customer is blacklisted.');
    }
  }

  // Save registration with status PENDING
  const newRegistration = await prisma.registration.create({
    data: {
      customerId: data.customerId,
      eventId: data.eventId,
      status: 'PENDING',
    },
  });

  return newRegistration;
}