import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { auth } from "../src/lib/auth";

async function main() {
  await prisma.user.delete({ where: { email: "agent@ticketapp.com" } }).catch(() => {
    console.log("Agent user not found — nothing to delete.");
  });

  const response = await auth.api.signUpEmail({
    body: { name: "Agent", email: "agent@ticketapp.com", password: "Agent@123456" },
  });

  if (!response) throw new Error("Sign-up failed.");

  await prisma.user.update({
    where: { email: "agent@ticketapp.com" },
    data: { role: "agent" },
  });

  console.log("Agent re-created: agent@ticketapp.com / Agent@123456");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
