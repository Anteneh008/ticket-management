"use client";

import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { DeleteAgentButton } from "@/components/delete-agent-button";
import { NewAgentDialog } from "@/components/new-agent-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";

type Agent = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};

async function fetchAgents(): Promise<Agent[]> {
  const { data } = await axios.get<Agent[]>("/api/users");
  return data;
}

export default function UsersPage() {
  const { data: agents, isLoading, isError } = useQuery({
    queryKey: ["agents"],
    queryFn: fetchAgents,
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-zinc-900">Users</h1>
        <NewAgentDialog />
      </div>

      {isLoading && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 4 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-7 w-16 ml-auto" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {isError && (
        <p className="text-sm text-destructive">Failed to load agents.</p>
      )}

      {agents && agents.length === 0 && (
        <p className="text-sm text-zinc-500">No agents yet. Create one to get started.</p>
      )}

      {agents && agents.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {agents.map((agent) => (
              <TableRow key={agent.id}>
                <TableCell className="font-medium text-zinc-900">{agent.name}</TableCell>
                <TableCell className="text-zinc-600">{agent.email}</TableCell>
                <TableCell className="text-zinc-500">
                  {new Date(agent.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </TableCell>
                <TableCell className="text-right">
                  <DeleteAgentButton userId={agent.id} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
