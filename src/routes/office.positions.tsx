import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { createPosition, listPositions, removePosition, type Opening } from "@/lib/inbox.functions";

export const Route = createFileRoute("/office/positions")({ component: PositionsPage });

const groups = [
  ["driver", "Company Driver"],
  ["staff", "Staff Positions"],
  ["tech", "Truck and Trailer Technician"],
] as const;

function PositionsPage() {
  const [positions, setPositions] = useState<Opening[] | null>(null);
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [category, setCategory] = useState<Opening["category"]>("driver");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    void listPositions().then(setPositions).catch(() => setPositions([]));
  }, []);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPosting(true);
    setError("");
    void createPosition({ data: { title, detail, category } })
      .then((created) => {
        setPositions((current) => [
          { id: created.id, listing: created.listing, category, title: title.trim(), detail: detail.trim() },
          ...(current ?? []),
        ]);
        setTitle("");
        setDetail("");
      })
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Couldn’t post that position."))
      .finally(() => setPosting(false));
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <p className="text-xs font-semibold tracking-widest text-red uppercase">Office</p>
      <h1 className="font-display text-5xl tracking-wide">Positions</h1>
      <p className="mt-2 text-sm text-steel">Each opening gets its own listing ID under one of the three opportunities.</p>
      <form onSubmit={onSubmit} className="mt-6 grid gap-3 rounded-3xl bg-card p-5 ring-1 ring-red/40 md:grid-cols-2">
        <label className="grid gap-1 text-sm">
          Opportunity
          <select className="h-11 rounded-xl border border-line bg-paper px-3" value={category} onChange={(event) => setCategory(event.target.value as Opening["category"])}>
            {groups.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm">
          Opening
          <input className="h-11 rounded-xl border border-line bg-paper px-3" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="New Haven, Indiana to Defiance, 2x daily" required />
        </label>
        <label className="grid gap-1 text-sm md:col-span-2">
          Notes
          <input className="h-11 rounded-xl border border-line bg-paper px-3" value={detail} onChange={(event) => setDetail(event.target.value)} />
        </label>
        <button type="submit" disabled={posting} className="h-11 w-fit rounded-full bg-red px-5 text-sm font-semibold text-snow disabled:opacity-60">
          {posting ? "Posting…" : "Post Position"}
        </button>
        {error ? <p className="text-sm text-red md:col-span-2">{error}</p> : null}
      </form>
      <ul className="mt-4 grid gap-2">
        {(positions ?? []).map((job) => (
          <li key={job.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-card px-4 py-3 text-sm ring-1 ring-line">
            <span>
              <span className="text-xs tracking-wide text-red uppercase">{groups.find(([value]) => value === job.category)?.[1]}</span>
              <span className="ml-2 font-medium">{job.title}</span>
              <span className="ml-2 text-xs font-semibold tracking-[0.14em] text-steel uppercase">{job.listing}</span>
              {job.detail ? <span className="mt-1 block text-steel">{job.detail}</span> : null}
            </span>
            <button
              type="button"
              className="h-9 rounded-full border border-line px-3 text-xs"
              onClick={() => {
                void removePosition({ data: { id: job.id } }).then(() => {
                  setPositions((current) => (current ?? []).filter((item) => item.id !== job.id));
                });
              }}
            >
              Remove
            </button>
          </li>
        ))}
        {positions && positions.length === 0 ? <li className="text-sm text-steel">No positions posted.</li> : null}
      </ul>
    </main>
  );
}
