import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const apps = await prisma.application.findMany({
    orderBy: { submittedAt: "desc" },
    take: 1,
    include: { candidateSignal: true },
  });

  console.log(JSON.stringify(apps, null, 2));

  const jobs = await prisma.$queryRaw`SELECT * FROM "pgboss"."job" ORDER BY created_on DESC LIMIT 5`;
  console.log("PG-BOSS JOBS:", JSON.stringify(jobs, (_, v) => typeof v === 'bigint' ? v.toString() : v, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
