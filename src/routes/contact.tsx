import { createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { company } from "@/lib/company";
import { useDomEdits, usePageCopy } from "@/lib/use-page-copy";

export const Route = createFileRoute("/contact")({ component: LegalPage });

export function LegalPage() {
  const copy = usePageCopy("contact");
  const editRoot = useDomEdits("contact");
  return (
    <main ref={editRoot} className="mx-auto max-w-3xl px-4 py-14">
      <p className="text-xs font-semibold tracking-widest text-red uppercase">Alpha Leasing, LLC</p>
      <h1 className="font-display text-5xl tracking-wide">Contact and Legal</h1>
      <p className="mt-4 text-sm leading-7 text-steel" data-field="intro" data-field-page="contact">
        {copy.intro}
      </p>

      <h2 className="mt-10 font-display text-4xl tracking-wide">Address and Authority:</h2>
      <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
        <div className="rounded-2xl bg-card p-4 ring-1 ring-line">
          <dt className="text-steel">Office</dt>
          <dd className="mt-1">
            {company.street}, {company.suite}
            <br />
            {company.city}, {company.state} {company.zip}
          </dd>
        </div>
        <div className="rounded-2xl bg-card p-4 ring-1 ring-line">
          <dt className="text-steel">Authority</dt>
          <dd className="mt-1">
            USDOT {company.usdot}
            <br />
            MC {company.mc}
            <br />
            Interstate property · authorized for hire
          </dd>
        </div>
      </dl>

      <Section title="The Company">
        <p>
          {company.name} is an Indiana limited liability company. Phone {company.phone}. Fax {company.fax}. Email{" "}
          <a className="text-red underline-offset-4 hover:underline" href={`mailto:${company.email}`}>
            {company.email}
          </a>
          . Hours {company.hours}. Hauling Midwest freight since {company.since}.
        </p>
      </Section>

      <Section title="Using This Site">
        <p>
          The pages, photos, and forms on this site are for general information about {company.short}. A rate request is a request for a quote. It is not a confirmed rate, a booking, or a contract until {company.short} agrees in writing or by a confirmed phone call.
        </p>
        <p>
          The company store can be viewed by anyone. A request to pick up gear is sent only after a driver or staff member signs in, and it is a request, not a completed sale.
        </p>
        <p>
          Sending a driver application is an inquiry. It is not an offer of employment and it does not create an employment relationship.
        </p>
      </Section>

      <Section title="What We Keep">
        <p>
          A rate request stores the name, company, email, phone, lane, freight, weight, equipment, dates, and notes you type, so logistics can answer you.
        </p>
        <p>
          A driver application stores the answers on the form, including the Social Security number required for the driver qualification file. That number is kept with the application and is not shown on the public summary.
        </p>
        <p>
          A signed-in store request stores the account email, the name on the request, and the items asked for.
        </p>
        <p>
          We use this information to respond, to run the shop, and to meet hiring and safety rules. We do not sell it. Questions go to {company.email} or {company.phone}.
        </p>
      </Section>

      <Section title="Equal Opportunity">
        <p>
          {company.name} is an equal opportunity employer. Hiring decisions follow applicable federal and Indiana law. The application asks only what is needed to qualify a driver.
        </p>
      </Section>

      <Section title="Authority">
        <p>
          Operating authority and safety information filed with the Federal Motor Carrier Safety Administration can be checked under USDOT {company.usdot}. This website does not replace those official records.
        </p>
      </Section>
    </main>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="font-display text-3xl tracking-wide">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-7 text-steel">{children}</div>
    </section>
  );
}
