"use client";

import { useState, useTransition } from "react";
import { deleteAgent } from "@/app/actions/users";
import { Button } from "@/components/ui/button";

export function DeleteAgentButton({ userId }: { userId: string }) {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      await deleteAgent(userId);
      setConfirming(false);
    });
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-zinc-600">Delete this agent?</span>
        <Button size="sm" variant="destructive" disabled={isPending} onClick={handleDelete}>
          {isPending ? "Deleting…" : "Confirm"}
        </Button>
        <Button size="sm" variant="outline" disabled={isPending} onClick={() => setConfirming(false)}>
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <Button size="sm" variant="outline" onClick={() => setConfirming(true)}>
      Delete
    </Button>
  );
}
