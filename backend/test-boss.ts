import PgBoss from "pg-boss";
import dotenv from "dotenv";
dotenv.config();

async function main() {
  const boss = new PgBoss(process.env.DATABASE_URL!);
  
  boss.on("error", (error) => console.error("PgBoss Error:", error));
  
  await boss.start();
  console.log("Started pg-boss instance.");

  const jobId = await boss.send("extract-signals", { test: true });
  console.log("Send returned:", jobId);
  
  await boss.stop();
}

main().catch(console.error);
