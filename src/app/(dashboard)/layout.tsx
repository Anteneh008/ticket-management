import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/sign-out-button";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-zinc-200 bg-white px-6 py-3">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <span className="font-semibold text-zinc-900">Ticket Management</span>
          <div className="flex items-center gap-3 text-sm text-zinc-600">
            <span>{session.user.name}</span>
            <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium capitalize">
              {session.user.role}
            </span>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="flex-1 bg-zinc-50 p-6">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>
    </div>
  );
}
