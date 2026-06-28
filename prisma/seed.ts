import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { auth } from "../src/lib/auth";

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

  const response = await auth.api.signUpEmail({ body: { name, email, password } });
  if (!response) throw new Error(`Sign-up failed for ${email}.`);

  await prisma.user.update({ where: { email }, data: { role } });
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
