import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AdminLog } from "@/components/admin-log";
import { listInbox, type InboxRow } from "@/lib/inbox.functions";

export const Route = createFileRoute("/office/quotes")({ component: QuotesPage });

function QuotesPage() {
  const [rows, setRows] = useState<InboxRow[] | null>(null);
  useEffect(() => {
    void listInbox().then((inbox) => setRows(inbox.quotes)).catch(() => setRows([]));
  }, []);
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <p className="text-xs font-semibold tracking-widest text-red uppercase">Office</p>
      <h1 className="font-display text-5xl tracking-wide">Rate Quotes</h1>
      <p className="mt-2 mb-6 text-sm text-steel">Rate requests submitted on the site.</p>
      {rows ? (
        <AdminLog
          kind="quote"
          rows={rows}
          statuses={["new", "quoted", "closed"]}
          onStatus={(id, status) => setRows((current) => current?.map((row) => (row.id === id ? { ...row, status } : row)) ?? null)}
        />
      ) : (
        <div className="h-32 animate-pulse rounded-3xl bg-line" />
      )}
    </main>
  );
}
