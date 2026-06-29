"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteAgent } from "@/app/actions/users";
import { Button } from "@/components/ui/button";

export function DeleteAgentButton({ userId }: { userId: string }) {
  const [confirming, setConfirming] = useState(false);
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: () => deleteAgent(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      setConfirming(false);
    },
  });

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-zinc-600">Delete this agent?</span>
        <Button size="sm" variant="destructive" disabled={isPending} onClick={() => mutate()}>
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
