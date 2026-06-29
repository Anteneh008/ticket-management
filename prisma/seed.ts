import "dotenv/config";
import { randomUUID } from "crypto";
import { hashPassword } from "@better-auth/utils/password";
import { prisma } from "../src/lib/prisma";

async function seedUser(
  name: string,
  email: string,
  password: string,
  role: string
) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`${name} already exists — skipping.`);
    return;
  }

  const userId = randomUUID().replace(/-/g, "");
  const hash = await hashPassword(password);

  await prisma.$transaction([
    prisma.user.create({
      data: { id: userId, name, email, emailVerified: false, role },
    }),
    prisma.account.create({
      data: {
        id: randomUUID().replace(/-/g, ""),
        accountId: userId,
        providerId: "credential",
        userId,
        password: hash,
      },
    }),
  ]);

  console.log(`Seeded ${role}: ${email}`);
}

async function main() {
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  const agentPassword = process.env.SEED_AGENT_PASSWORD;

  if (!adminPassword || !agentPassword) {
    throw new Error(
      "SEED_ADMIN_PASSWORD and SEED_AGENT_PASSWORD must be set in .env"
    );
  }

  await seedUser("Admin", "admin@ticketapp.com", adminPassword, "admin");
  await seedUser("Agent", "agent@ticketapp.com", agentPassword, "agent");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
