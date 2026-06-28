import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { auth } from "../src/lib/auth";

async function main() {
  const existing = await prisma.user.findUnique({
    where: { email: "admin@ticketapp.com" },
  });

  if (existing) {
    console.log("Admin already exists — skipping seed.");
    return;
  }

  const response = await auth.api.signUpEmail({
    body: {
      name: "Admin",
      email: "admin@ticketapp.com",
      password: "Admin@123456",
    },
  });

  if (!response) {
    throw new Error("Sign-up failed — no response returned.");
  }

  await prisma.user.update({
    where: { email: "admin@ticketapp.com" },
    data: { role: "admin" },
  });

  console.log("Admin seeded: admin@ticketapp.com / Admin@123456");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
