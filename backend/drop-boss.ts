import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Dropping pgboss schema...");
  try {
    await prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS pgboss CASCADE;`);
    console.log("pgboss schema dropped successfully.");
  } catch(e) {
    console.error("Error dropping schema:", e);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
