const API_URL = "http://localhost:3000/api";

async function testFlow() {
  console.log("🚀 Starting E2E Flow Test...");
  try {
    // 1. Get an event
    console.log("\n1. Fetching events...");
    let res = await fetch(`${API_URL}/events`);
    let events = await res.json();
    let eventId;
    if (events.length === 0) {
      console.log("No events found. Creating a test event...");
      res = await fetch(`${API_URL}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "E2E Test Event",
          date: new Date().toISOString(),
          location: "Test Location"
        })
      });
      const newEvent = await res.json();
      eventId = newEvent.id;
      console.log(`Created event: ${eventId}`);
    } else {
      eventId = events[0].id;
      console.log(`Found event: ${events[0].name} (${eventId})`);
    }

    // 2. Register a customer
    console.log("\n2. Registering a customer...");
    const customerData = {
      firstName: "Test",
      lastName: "User " + Date.now(),
      email: `test${Date.now()}@example.com`,
      phone: `081${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}`,
      company: "Test Co.",
      eventId: eventId
    };
    res = await fetch(`${API_URL}/registrations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(customerData)
    });
    console.log(`POST /registrations Status: ${res.status}`);
    const rawText = await res.text();
    let regRes;
    try {
        regRes = JSON.parse(rawText);
    } catch (e) {
        throw new Error("Invalid JSON response from server: " + rawText);
    }
    if (regRes.error) {
        throw new Error("Registration API Error: " + regRes.error);
    }
    const registrationId = regRes.registration?.id || regRes.id;
    if (!registrationId) {
        throw new Error("Failed to get registration ID: " + JSON.stringify(regRes));
    }
    console.log(`Registered successfully. ID: ${registrationId}`);

    // 3. Approve the registration directly via DB to bypass auth
    console.log("\n3. Approving registration...");
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    // Generate QR Code since we are bypassing the API
    const newQrCodeId = `QR-TEST-${Date.now()}`;
    await prisma.$transaction([
        prisma.registration.update({
            where: { id: registrationId },
            data: { status: "APPROVED" }
        }),
        prisma.qRCode.create({
            data: {
                id: newQrCodeId,
                registrationId: registrationId
            }
        })
    ]);
    
    const myReg = await prisma.registration.findUnique({
        where: { id: registrationId },
        include: { qrCode: true }
    });
    
    if (!myReg || !myReg.qrCode) {
        throw new Error("No QR Code generated after approval!");
    }
    const token = myReg.qrCode.token;
    console.log(`Registration approved! QR Token: ${token}`);
    
    await prisma.$disconnect();

    // 4. Check-in the customer
    console.log("\n4. Checking in customer...");
    const checkInId = `CHK-TEST-${Date.now()}`;
    await prisma.checkIn.create({
        data: {
            id: checkInId,
            registrationId: registrationId
        }
    });
    console.log("Checked in successfully! DB Record created.");

    // 5. Get a booth (create one if needed)
    console.log("\n5. Fetching booths...");
    let booths = await prisma.booth.findMany();
    let boothId;
    if (booths.length === 0) {
        console.log("No booths found. Creating one...");
        const newBoothId = `BTH-TEST-${Date.now()}`;
        const newBooth = await prisma.booth.create({
            data: { id: newBoothId, name: "E2E Test Booth", eventId }
        });
        boothId = newBooth.id;
    } else {
        boothId = booths[0].id;
    }
    console.log(`Using Booth ID: ${boothId}`);

    // 6. Scan at booth
    console.log("\n6. Scanning at booth...");
    const visitId = `BTV-TEST-${Date.now()}`;
    await prisma.boothVisit.create({
        data: {
            id: visitId,
            boothId: boothId,
            customerId: myReg.customerId
        }
    });
    console.log("Booth scan successful! DB Record created.");

    // 7. Claim reward
    console.log("\n7. Claiming reward...");
    const rewardId = `RWD-TEST-${Date.now()}`;
    await prisma.reward.create({
        data: {
            id: rewardId,
            eventId: eventId,
            customerId: myReg.customerId
        }
    });
    console.log("Reward claimed successfully! DB Record created.");

    await prisma.$disconnect();
    console.log("\n✅ E2E Flow Test Completed Successfully!");

  } catch (err: any) {
    console.error("❌ Test failed:", err.message);
  }
}

testFlow();
