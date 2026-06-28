import "dotenv/config";
import { auth } from "../src/lib/auth";
import { prisma } from "../src/lib/prisma";

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: "agent@ticketapp.com" },
    include: { accounts: true },
  });
  console.log("User found:", !!user);
  console.log("Account count:", user?.accounts.length);
  console.log("Has password hash:", user?.accounts.some((a) => !!a.password));

  try {
    const result = await auth.api.signInEmail({
      body: { email: "agent@ticketapp.com", password: "Agent@123456" },
    });
    console.log("Sign-in SUCCESS:", result?.user?.email);
  } catch (e: any) {
    console.error("Sign-in ERROR:", e.message, e.status);
  }
}

main().finally(() => prisma.$disconnect());
