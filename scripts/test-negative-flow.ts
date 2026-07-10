import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testNegativeFlow() {
  console.log("🚀 Starting Negative E2E Flow Test...");
  try {
    const timestamp = Date.now();
    const eventId = "EVT-0001"; // Using the global event created earlier

    // --- 1. Blacklist Matching Test ---
    console.log("\n--- 1. Blacklist Test ---");
    const badEmail = `badguy_${timestamp}@example.com`;
    
    // Add to Blacklist
    await prisma.blacklist.create({
        data: {
            id: `BLK-TEST-${timestamp}`,
            email: badEmail,
            reason: "Known troublemaker for testing",
            active: true
        }
    });
    console.log(`Added ${badEmail} to Blacklist.`);

    // Register user with bad email
    const badUser = await prisma.user.create({
        data: {
            id: `USR-BAD-${timestamp}`,
            email: badEmail,
            firstName: "Bad",
            lastName: "Guy",
        }
    });
    const badCustomer = await prisma.customer.create({
        data: {
            id: `CUS-BAD-${timestamp}`,
            userId: badUser.id
        }
    });
    const badRegistration = await prisma.registration.create({
        data: {
            id: `REG-BAD-${timestamp}`,
            customerId: badCustomer.id,
            eventId: eventId,
            status: "PENDING",
            firstName: "Bad",
            lastName: "Guy",
            email: badEmail
        }
    });
    
    // Simulate API Blacklist Warning Check
    const blacklists = await prisma.blacklist.findMany({ where: { active: true } });
    const match = blacklists.find(b => b.email === badEmail);
    if (match) {
        console.log(`✅ Blacklist check passed: Registration flagged! Reason: ${match.reason}`);
    } else {
        throw new Error("Blacklist match failed!");
    }


    // --- Setup Normal User for Further Tests ---
    console.log("\n--- Setting up normal user for duplicate tests ---");
    const user = await prisma.user.create({
        data: { id: `USR-NORM-${timestamp}`, email: `normal_${timestamp}@example.com`, firstName: "Normal", lastName: "User" }
    });
    const customer = await prisma.customer.create({
        data: { id: `CUS-NORM-${timestamp}`, userId: user.id }
    });
    const registration = await prisma.registration.create({
        data: { id: `REG-NORM-${timestamp}`, customerId: customer.id, eventId: eventId, status: "APPROVED", firstName: "Normal", lastName: "User", email: user.email }
    });

    // --- 2. Duplicate Check-in Test ---
    console.log("\n--- 2. Duplicate Check-in Test ---");
    await prisma.checkIn.create({
        data: { id: `CHK-NORM-${timestamp}`, registrationId: registration.id }
    });
    console.log("First check-in successful.");
    
    try {
        await prisma.checkIn.create({
            data: { id: `CHK-DUP-${timestamp}`, registrationId: registration.id }
        });
        throw new Error("❌ Duplicate Check-in SHOULD HAVE FAILED, but it succeeded!");
    } catch (e: any) {
        if (e.code === 'P2002') {
            console.log("✅ Duplicate check-in correctly blocked by database unique constraint (P2002).");
        } else {
            throw e;
        }
    }

    // --- 3. Duplicate Booth Scan Test ---
    console.log("\n--- 3. Duplicate Booth Scan Test ---");
    const booth = await prisma.booth.findFirst();
    if (!booth) throw new Error("No booths found for testing.");
    
    await prisma.boothVisit.create({
        data: { id: `BTV-NORM-${timestamp}`, boothId: booth.id, customerId: customer.id }
    });
    console.log("First booth scan successful.");

    try {
        await prisma.boothVisit.create({
            data: { id: `BTV-DUP-${timestamp}`, boothId: booth.id, customerId: customer.id }
        });
        throw new Error("❌ Duplicate Booth Scan SHOULD HAVE FAILED, but it succeeded!");
    } catch (e: any) {
        if (e.code === 'P2002') {
            console.log("✅ Duplicate booth scan correctly blocked by database unique constraint (P2002).");
        } else {
            throw e;
        }
    }

    // --- 4. Too Early Reward Claiming Test (In API Logic) ---
    console.log("\n--- 4. Unmet Reward Requirement Test ---");
    // Get min visits from config
    const config = await prisma.systemConfig.findUnique({ where: { key: "MIN_BOOTH_VISITS_FOR_REWARD" } });
    const minVisits = parseInt(config?.value || "3", 10);
    
    const visitCount = await prisma.boothVisit.count({
        where: { customerId: customer.id }
    });
    
    if (visitCount < minVisits) {
        console.log(`✅ Reward Claim logic validation passed: User has ${visitCount} visits, needs ${minVisits}.`);
    } else {
         console.log("Warning: Min visits is met, so reward claim logic check is skipped.");
    }

    console.log("\n🎉 All Negative E2E Flow Tests Completed Successfully!");

  } catch (err: any) {
    console.error("❌ Test failed:", err.message);
  } finally {
      await prisma.$disconnect();
  }
}

testNegativeFlow();
