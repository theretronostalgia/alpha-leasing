import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ApplyWizard } from "@/components/apply-wizard";
import { listPositions, type Opening } from "@/lib/inbox.functions";
import { useDomEdits, usePageCopy } from "@/lib/use-page-copy";

export const Route = createFileRoute("/apply")({ component: ApplyPage });

const bubbles = [
  { category: "driver", title: "Company Driver" },
  { category: "staff", title: "Staff Positions" },
  { category: "tech", title: "Truck and Trailer Technician" },
] as const;

export function ApplyPage() {
  const copy = usePageCopy("drive");
  const editRoot = useDomEdits("drive");
  const [open, setOpen] = useState<string | null>(null);
  const [jobs, setJobs] = useState<Opening[] | null>(null);

  useEffect(() => {
    void listPositions().then(setJobs).catch(() => setJobs([]));
  }, []);

  return (
    <main ref={editRoot} className="mx-auto max-w-6xl px-4 py-10">
      <section className="mb-10">
        <p className="text-xs font-semibold tracking-widest text-red uppercase">Drive</p>
        <h1 className="font-display text-5xl tracking-wide">Opportunities</h1>
        {copy.intro ? <p className="mt-3 max-w-2xl text-sm leading-6 text-steel" data-field="intro" data-field-page="drive">{copy.intro}</p> : null}
        {jobs === null ? <div className="mt-6 h-28 animate-pulse rounded-3xl bg-line" /> : null}
        <ul className="mt-6 grid gap-4 md:grid-cols-3">
          {bubbles.map((group) => {
            const selected = open === group.category;
            const openings = (jobs ?? []).filter((job) => job.category === group.category);
            return (
              <li key={group.category} className={`rounded-3xl bg-card p-5 ring-1 transition ${selected ? "ring-red" : "ring-red/40"}`}>
                <button
                  type="button"
                  aria-expanded={selected}
                  onClick={() => setOpen(selected ? null : group.category)}
                  className="w-full text-center"
                >
                  <h2 className="font-display text-3xl tracking-wide">{group.title}</h2>
                  <p className="mt-2 text-sm text-steel">See Listings</p>
                </button>
                {selected && openings.length > 0 ? (
                  <ul className="mt-4 space-y-3">
                    {openings.map((job) => (
                      <li key={job.id} className="rounded-2xl bg-paper p-4 text-center">
                        <p className="text-xs font-semibold tracking-[0.18em] text-red uppercase">Listing {job.listing}</p>
                        <p className="mt-1 font-medium">{job.title}</p>
                        {job.detail ? <p className="mt-2 text-sm leading-6 text-steel">{job.detail}</p> : null}
                      </li>
                    ))}
                  </ul>
                ) : null}
                {selected && jobs && openings.length === 0 ? (
                  <p className="mt-4 text-center text-sm text-steel">Nothing listed yet.</p>
                ) : null}
              </li>
            );
          })}
        </ul>
      </section>
      <ApplyWizard />
    </main>
  );
}