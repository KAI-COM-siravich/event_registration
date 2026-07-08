import prisma from "./prisma";

export async function generateId(
  modelName: string,
  configKey: string,
  defaultPrefix: string,
  padding: number = 4
): Promise<string> {
  // Use a transaction to ensure atomic increment and retrieval of prefix
  // Wait, Prisma upsert is atomic, but fetching config is separate.
  // We can do it concurrently.
  const [seq, conf] = await Promise.all([
    prisma.sequence.upsert({
      where: { name: modelName },
      update: { value: { increment: 1 } },
      create: { name: modelName, value: 1 },
    }),
    prisma.systemConfig.findUnique({
      where: { key: configKey },
    }),
  ]);

  const prefix = conf?.value || defaultPrefix;
  return `${prefix}${String(seq.value).padStart(padding, "0")}`;
}
