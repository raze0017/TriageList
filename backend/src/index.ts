import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;

app.get("/", (_req, res) => {
  res.json({
    message: "API is running",
    timestamp: new Date().toISOString(),
  });
});
app.post("/seed", async (_req, res) => {
  try {
    const user = await prisma.user.create({
      data: {
        email: `user${Date.now()}@example.com`,
        name: "Test User",
      },
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error });
  }
});

app.get("/users", async (_req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

app.get("/health", (_req, res) => {
  res.status(200).send("OK");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
