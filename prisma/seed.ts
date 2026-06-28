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
  console.log(`Seeded ${role}: ${email} / ${password}`);
}

async function main() {
  await seedUser("Admin", "admin@ticketapp.com", "Admin@123456", "admin");
  await seedUser("Agent", "agent@ticketapp.com", "Agent@123456", "agent");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
