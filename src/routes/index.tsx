import { Link, createFileRoute } from "@tanstack/react-router";
import { company, traditions } from "@/lib/company";
import { useDomEdits, usePageCopy } from "@/lib/use-page-copy";
import { EditableImage, EditableVideo } from "@/lib/page-edit";
import { RateQuote } from "@/components/rate-quote";
import { StoreExperience } from "@/components/store-experience";

export const Route = createFileRoute("/")({ component: Home });

export function Home() {
  const copy = usePageCopy("home");
  const editRoot = useDomEdits("home");
  const cards = [
    { ...traditions[0], title: copy.haulTitle, copy: copy.haulCopy },
    { ...traditions[1], title: copy.repairTitle, copy: copy.repairCopy },
    { ...traditions[2], title: copy.leaseTitle, copy: copy.leaseCopy },
  ];
  return (
    <main ref={editRoot}>
      <section className="relative min-h-[32rem] bg-black">
        <EditableImage page="home" slot="hero" fill src={copy["img:hero"] || "/media/hero-top.jpg"} alt="Two red Alpha trucks parked at the Fort Wayne shop" className="absolute inset-0 h-full w-full object-cover" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/45 via-transparent to-transparent" />
        <div className="relative mx-auto flex min-h-[32rem] max-w-6xl items-end px-4 py-8">
          <div className="max-w-md rounded-2xl bg-paper/60 p-4 text-ink shadow-lg ring-1 ring-red backdrop-blur-sm md:p-5">
            <p className="text-xs font-semibold tracking-widest text-red uppercase">Welcome to</p>
            <h1 className="font-display text-4xl leading-none tracking-wide md:text-5xl">Alpha Leasing</h1>
            <p className="mt-3 text-sm leading-6 text-steel" data-field="welcome" data-field-page="home">{copy.welcome}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <a href="#quote" className="inline-flex h-10 items-center rounded-full bg-red px-4 text-sm font-semibold text-snow">
                Get A Rate Quote
              </a>
              <Link to="/apply" className="inline-flex h-10 items-center rounded-full border border-red px-4 text-sm font-semibold">
                Drive With Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-red/50 bg-black text-snow">
        <div className="mx-auto grid max-w-6xl md:grid-cols-3 md:divide-x md:divide-red/30">
          <a href={`tel:${company.phoneTel}`} className="px-6 py-5 transition hover:bg-red/10">
            <p className="text-[11px] font-semibold tracking-[0.22em] text-red uppercase">Phone</p>
            <p className="mt-1 font-display text-2xl tracking-wide">{company.phone}</p>
          </a>
          <div className="border-y border-red/30 px-6 py-5 md:border-y-0">
            <p className="text-[11px] font-semibold tracking-[0.22em] text-red uppercase">Hours</p>
            <p className="mt-1 font-display text-2xl tracking-wide">{company.hours}</p>
          </div>
          <a
            href="https://maps.google.com/?q=2701+S+Coliseum+Blvd+Suite+1320+Fort+Wayne+IN+46803"
            target="_blank"
            rel="noreferrer"
            className="px-6 py-5 transition hover:bg-red/10"
          >
            <p className="text-[11px] font-semibold tracking-[0.22em] text-red uppercase">Address</p>
            <p className="mt-1 text-sm leading-5">
              {company.street}, {company.suite}
              <br />
              {company.city}, {company.state} {company.zip}
            </p>
          </a>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-16 md:grid-cols-2">
        <div>
          <p className="text-xs font-semibold tracking-widest text-red uppercase">Our story</p>
          <h2 className="font-display text-5xl tracking-wide">Get To Know Us</h2>
          <p className="mt-4 text-sm leading-6 text-steel" data-field="story" data-field-page="home">{copy.story}</p>
          <Link to="/apply" className="mt-6 inline-flex h-12 items-center rounded-full bg-red px-5 text-sm font-semibold text-snow">
            Driver application
          </Link>
        </div>
        <div className="overflow-hidden rounded-3xl bg-black">
          <EditableVideo page="home" slot="intro" src={copy["vid:intro"] || "/media/intro.mp4"} poster="/media/hero.jpg" className="aspect-video w-full object-cover" />
        </div>
      </section>

      <StoreExperience />

      <section id="quote" className="scroll-mt-24 px-4 py-8">
        <div className="mx-auto max-w-6xl">
          <RateQuote />
        </div>
      </section>

      <section className="border-t-4 border-red bg-black text-snow">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <p className="text-xs font-semibold tracking-widest text-red uppercase">Since {company.since}</p>
          <h2 className="font-display text-5xl tracking-wide">Values and Traditions</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-snow/75" data-field="servicesIntro" data-field-page="home">{copy.servicesIntro}</p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {cards.map((item, index) => {
              const slot = (["haul", "repair", "lease"] as const)[index];
              return (
              <article key={slot} className="overflow-hidden rounded-3xl bg-card ring-1 ring-red/50">
                <EditableImage page="home" slot={slot} src={copy[`img:${slot}`] || item.image} alt={item.alt} className="h-56 w-full object-cover" />
                <div className="p-5">
                  <p className="text-xs font-semibold tracking-widest text-red uppercase">{item.kicker}</p>
                  <h3 className="mt-1 font-display text-3xl tracking-wide" data-field={`${slot}Title`} data-field-page="home">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-snow/75" data-field={`${slot}Copy`} data-field-page="home">{item.copy}</p>
                </div>
              </article>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
