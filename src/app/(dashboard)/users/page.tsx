import { requireRole } from "@/lib/auth-utils";

export default async function UsersPage() {
  await requireRole("admin");

  return <h1 className="text-2xl font-semibold text-zinc-900">Users</h1>;
}
