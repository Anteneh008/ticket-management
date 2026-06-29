import Link from "next/link";
import { requireRole } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { buttonVariants } from "@/components/ui/button";
import { DeleteAgentButton } from "@/components/delete-agent-button";

export default async function UsersPage() {
  await requireRole("admin");

  const agents = await prisma.user.findMany({
    where: { role: "agent" },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, email: true, createdAt: true },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-zinc-900">Users</h1>
        <Link href="/users/new" className={buttonVariants()}>
          New agent
        </Link>
      </div>

      {agents.length === 0 ? (
        <p className="text-sm text-zinc-500">No agents yet. Create one to get started.</p>
      ) : (
        <div className="overflow-hidden rounded-xl ring-1 ring-zinc-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {agents.map((agent) => (
                <tr key={agent.id} className="hover:bg-zinc-50">
                  <td className="px-4 py-3 font-medium text-zinc-900">{agent.name}</td>
                  <td className="px-4 py-3 text-zinc-600">{agent.email}</td>
                  <td className="px-4 py-3 text-zinc-500">
                    {agent.createdAt.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <DeleteAgentButton userId={agent.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
