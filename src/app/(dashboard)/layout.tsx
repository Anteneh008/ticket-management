import Link from "next/link";
import { requireSession } from "@/lib/auth-utils";
import { SignOutButton } from "@/components/sign-out-button";
import { Providers } from "@/components/providers";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();

  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-zinc-200 bg-white px-6 py-3">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="font-semibold text-zinc-900">Ticket Management</span>
            <nav className="flex items-center gap-4 text-sm">
              <Link href="/dashboard" className="text-zinc-600 hover:text-zinc-900 transition-colors">
                Dashboard
              </Link>
              {session.user.role === "admin" && (
                <Link href="/users" className="text-zinc-600 hover:text-zinc-900 transition-colors">
                  Users
                </Link>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm text-zinc-600">
            <span>{session.user.name}</span>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="flex-1 bg-zinc-50 p-6">
        <div className="mx-auto max-w-5xl">
          <Providers>{children}</Providers>
        </div>
      </main>
    </div>
  );
}
