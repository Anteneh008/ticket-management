"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { z } from "zod";
import { requireRole } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";

const createAgentSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type CreateAgentInput = z.infer<typeof createAgentSchema>;

export async function createAgent(
  input: CreateAgentInput
): Promise<{ error?: string }> {
  await requireRole("admin");

  const parsed = createAgentSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "An account with this email already exists." };
  }

  const { hashPassword } = await import("@better-auth/utils/password");
  const userId = randomUUID().replace(/-/g, "");
  const hash = await hashPassword(password);

  await prisma.$transaction([
    prisma.user.create({
      data: {
        id: userId,
        name,
        email,
        emailVerified: false,
        role: "agent",
      },
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

  revalidatePath("/users");
  return {};
}

export async function deleteAgent(userId: string): Promise<void> {
  const session = await requireRole("admin");

  if (userId === session.user.id) {
    throw new Error("You cannot delete your own account.");
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found.");
  if (user.role === "admin") throw new Error("Cannot delete admin accounts.");

  await prisma.user.delete({ where: { id: userId } });
  revalidatePath("/users");
}
