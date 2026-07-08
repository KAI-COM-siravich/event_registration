import prisma from "../lib/prisma";
import { generateId } from "../lib/idGenerator";

const modelsToMigrate = [
  { model: "user", name: "User", configKey: "ID_PREFIX_USER", defaultPrefix: "USR-" },
  { model: "customer", name: "Customer", configKey: "ID_PREFIX_CUSTOMER", defaultPrefix: "CUS-" },
  { model: "event", name: "Event", configKey: "ID_PREFIX_EVENT", defaultPrefix: "EVT-" },
  { model: "booth", name: "Booth", configKey: "ID_PREFIX_BOOTH", defaultPrefix: "BTH-" },
  { model: "registration", name: "Registration", configKey: "ID_PREFIX_REGISTRATION", defaultPrefix: "REG-" },
  { model: "qRCode", name: "QRCode", configKey: "ID_PREFIX_QRCODE", defaultPrefix: "QR-" },
  { model: "checkIn", name: "CheckIn", configKey: "ID_PREFIX_CHECKIN", defaultPrefix: "CHK-" },
  { model: "boothVisit", name: "BoothVisit", configKey: "ID_PREFIX_BOOTHVISIT", defaultPrefix: "BTV-" },
  { model: "reward", name: "Reward", configKey: "ID_PREFIX_REWARD", defaultPrefix: "RWD-" },
  { model: "blacklist", name: "Blacklist", configKey: "ID_PREFIX_BLACKLIST", defaultPrefix: "BLK-" }
];

async function main() {
  console.log("Starting ID Migration...");

  for (const table of modelsToMigrate) {
    console.log(`\nChecking ${table.name}...`);
    // @ts-ignore
    const modelDelegate = prisma[table.model];
    
    // Find all records that start with 'c' (cuid default)
    const records = await modelDelegate.findMany({
      where: {
        id: {
          startsWith: 'c'
        }
      }
    });
    
    console.log(`Found ${records.length} records to migrate in ${table.name}`);

    for (const record of records) {
      const newId = await generateId(table.name, table.configKey, table.defaultPrefix);
      await modelDelegate.update({
        where: { id: record.id },
        data: { id: newId }
      });
      console.log(`Migrated ${table.name}: ${record.id} -> ${newId}`);
    }
  }

  console.log("\nMigration completed successfully!");
}

main()
  .catch((e) => {
    console.error("Migration failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
