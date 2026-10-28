import { createFileRoute } from "@tanstack/react-router";
import { RateQuote } from "@/components/rate-quote";
import { useDomEdits, usePageCopy } from "@/lib/use-page-copy";

export const Route = createFileRoute("/quote")({ component: QuotePage });

export function QuotePage() {
  const copy = usePageCopy("quote");
  const editRoot = useDomEdits("quote");
  return (
    <main ref={editRoot} className="mx-auto max-w-6xl px-4 py-14">
      <p className="text-xs font-semibold tracking-widest text-red uppercase">Freight</p>
      <h1 className="font-display text-5xl tracking-wide">Rate Quote</h1>
      {copy.intro ? <p className="mt-4 max-w-2xl text-sm leading-7 text-steel" data-field="intro" data-field-page="quote">{copy.intro}</p> : null}
      <div className="mt-8">
        <RateQuote />
      </div>
    </main>
  );
}
