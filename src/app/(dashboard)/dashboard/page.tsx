import { requireSession } from "@/lib/auth-utils";

export default async function DashboardPage() {
  const session = await requireSession();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900">Dashboard</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Welcome back, {session?.user.name}.
      </p>
    </div>
  );
}
