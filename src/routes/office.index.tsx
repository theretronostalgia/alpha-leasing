import { useEffect, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { listInbox, listPositions, type InboxRow } from "@/lib/inbox.functions";
import { statusLabel, when } from "@/components/admin-log";

export const Route = createFileRoute("/office/")({ component: OfficeHome });

type Inbox = { applications: InboxRow[]; quotes: InboxRow[]; orders: InboxRow[] };

function OfficeHome() {
  const [inbox, setInbox] = useState<Inbox | null>(null);
  const [positions, setPositions] = useState<number | null>(null);

  useEffect(() => {
    void listInbox().then(setInbox).catch(() => setInbox({ applications: [], quotes: [], orders: [] }));
    void listPositions().then((rows) => setPositions(rows.length)).catch(() => setPositions(0));
  }, []);

  const cards = [
    { to: "/office/applications", label: "Applications", count: inbox?.applications.length, fresh: inbox?.applications.filter((row) => row.status === "new").length },
    { to: "/office/quotes", label: "Rate Quotes", count: inbox?.quotes.length, fresh: inbox?.quotes.filter((row) => row.status === "new").length },
    { to: "/office/orders", label: "Store Orders", count: inbox?.orders.length, fresh: inbox?.orders.filter((row) => row.status === "requested").length },
    { to: "/office/positions", label: "Positions", count: positions, fresh: positions },
  ] as const;

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <p className="text-xs font-semibold tracking-widest text-red uppercase">Admin</p>
      <h1 className="font-display text-5xl tracking-wide">Office</h1>
      <p className="mt-2 text-sm text-steel">Applications, rate quotes, store orders, and job listings saved from the site.</p>
      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Link key={card.to} to={card.to} className="rounded-2xl bg-card p-4 ring-1 ring-red/40 hover:ring-red">
            <p className="text-xs font-semibold tracking-widest text-red uppercase">{card.label}</p>
            <p className="mt-2 font-display text-4xl">{card.count ?? "—"}</p>
            <p className="mt-1 text-sm text-steel">{card.fresh ?? 0} waiting</p>
          </Link>
        ))}
      </div>
      <h2 className="mt-10 font-display text-3xl tracking-wide">Latest</h2>
      <ul className="mt-4 grid gap-2">
        {latest(inbox).map((row) => (
          <li key={`${row.kind}-${row.id}`} className="flex flex-wrap items-baseline justify-between gap-2 rounded-2xl bg-card px-4 py-3 text-sm ring-1 ring-line">
            <span>
              <span className="text-red">{row.kind}</span>
              <span className="ml-2 font-medium">{row.title}</span>
              <span className="ml-2 text-steel">{row.subtitle}</span>
            </span>
            <span className="text-xs text-steel">
              {statusLabel(row.status)} · {when(row.createdAt)}
            </span>
          </li>
        ))}
        {inbox && latest(inbox).length === 0 ? <li className="text-sm text-steel">Nothing has come in yet.</li> : null}
      </ul>
    </main>
  );
}

function latest(inbox: Inbox | null) {
  if (!inbox) return [];
  return [
    ...inbox.applications.map((row) => ({ ...row, kind: "Application" })),
    ...inbox.quotes.map((row) => ({ ...row, kind: "Rate Quote" })),
    ...inbox.orders.map((row) => ({ ...row, kind: "Store Order" })),
  ]
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
    .slice(0, 8);
}
