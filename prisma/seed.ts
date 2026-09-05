import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.js";
import bcrypt from "bcryptjs";

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {

  await prisma.task.deleteMany();
  await prisma.user.deleteMany();

  const password = await bcrypt.hash("secret123", 10);
  const adminPassword = await bcrypt.hash("password123", 10);

  const user1 = await prisma.user.create({
    data: {
      id: 1,
      name: "Test User 1",
      email: "user1@example.com",
      password,
      role: "USER",
    },
  });

  const user2 = await prisma.user.create({
    data: {
      id: 2,
      name: "John",
      email: "john@example.com",
      password,
      role: "USER",
    },
  });

  const john = await prisma.user.create({
    data: {
      id: 3,
      name: "John Primary",
      email: "john@exampleq.com",
      password,
      role: "USER",
    },
  });

  const admin = await prisma.user.create({
    data: {
      id: 4,
      name: "Satyo",
      email: "satyo@gmail.com",
      password: adminPassword,
      role: "ADMIN",
    },
  });
  
  await prisma.task.createMany({
    data: [
      { title: "Task 1", userId: user1.id },
      { title: "Task 2", userId: user1.id },
      { title: "Task 3", userId: user1.id },
      { title: "Task 4", userId: user1.id },
      { title: "Task 5", userId: user1.id },
      { title: "Task 6", userId: user1.id },
      { title: "Task 7", userId: user2.id },
      { title: "Task 8", userId: john.id },
      { title: "Task 9", userId: john.id },
    ],
  });

  console.log("Seed data created.");
  console.log("John ID:", john.id);
  console.log("Admin ID:", admin.id);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });