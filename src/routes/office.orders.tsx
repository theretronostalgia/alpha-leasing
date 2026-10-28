import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AdminLog } from "@/components/admin-log";
import { listInbox, type InboxRow } from "@/lib/inbox.functions";

export const Route = createFileRoute("/office/orders")({ component: OrdersPage });

function OrdersPage() {
  const [rows, setRows] = useState<InboxRow[] | null>(null);
  useEffect(() => {
    void listInbox().then((inbox) => setRows(inbox.orders)).catch(() => setRows([]));
  }, []);
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <p className="text-xs font-semibold tracking-widest text-red uppercase">Office</p>
      <h1 className="font-display text-5xl tracking-wide">Store Orders</h1>
      <p className="mt-2 mb-6 text-sm text-steel">Company store requests from signed-in drivers and staff.</p>
      {rows ? (
        <AdminLog
          kind="order"
          rows={rows}
          statuses={["requested", "ready", "picked-up", "cancelled"]}
          onStatus={(id, status) => setRows((current) => current?.map((row) => (row.id === id ? { ...row, status } : row)) ?? null)}
        />
      ) : (
        <div className="h-32 animate-pulse rounded-3xl bg-line" />
      )}
    </main>
  );
}
