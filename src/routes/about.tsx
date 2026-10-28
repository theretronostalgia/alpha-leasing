import { createFileRoute } from "@tanstack/react-router";
import { team, traditions } from "@/lib/company";
import { useDomEdits, usePageCopy } from "@/lib/use-page-copy";
import { EditableImage } from "@/lib/page-edit";

export const Route = createFileRoute("/about")({ component: About });

const gallery = [
  { src: "/media/hero.jpg", alt: "Red tractor parked at the Alpha Leasing shop in Fort Wayne" },
  { src: "/media/extra1.jpg", alt: "Blue Volvo with the Alpha Leasing door mark, unit 333" },
  { src: "/media/dock.jpg", alt: "Trailer backed into a dock" },
  { src: "/media/yard.jpg", alt: "Technician working under a trailer in the shop" },
];

export function About() {
  const copy = usePageCopy("about");
  const editRoot = useDomEdits("about");
  const cards = [
    { ...traditions[0], title: copy.haulTitle, copy: copy.haulCopy },
    { ...traditions[1], title: copy.repairTitle, copy: copy.repairCopy },
    { ...traditions[2], title: copy.leaseTitle, copy: copy.leaseCopy },
  ];
  return (
    <main ref={editRoot}>
      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-14 md:grid-cols-2">
        <div>
          <p className="text-xs font-semibold tracking-widest text-red uppercase">Our story</p>
          <h1 className="font-display text-6xl tracking-wide">Get To Know Us</h1>
          <p className="mt-4 text-sm leading-7 text-steel" data-field="story" data-field-page="about">{copy.story}</p>
          <p className="mt-4 text-sm leading-7 text-steel" data-field="servicesIntro" data-field-page="about">{copy.servicesIntro}</p>
        </div>
        <EditableImage page="about" slot="hero" src={copy["img:hero"] || "/media/hero-top.jpg"} alt="Two red Alpha trucks parked at the Fort Wayne shop" className="h-full max-h-96 w-full rounded-3xl object-cover" />
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-8">
        <h2 className="font-display text-4xl tracking-wide">From The Yard</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {gallery.map((shot, index) => (
            <EditableImage key={shot.src} page="about" slot={`yard-${index}`} src={copy[`img:yard-${index}`] || shot.src} alt={shot.alt} className="h-64 w-full rounded-3xl object-cover" />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="font-display text-4xl tracking-wide">What We Do</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {cards.map((item, index) => {
            const slot = (["haul", "repair", "lease"] as const)[index];
            return (
            <article key={slot} className="overflow-hidden rounded-3xl bg-card ring-1 ring-line">
              <EditableImage page="about" slot={slot} src={copy[`img:${slot}`] || item.image} alt={item.alt} className="h-44 w-full object-cover" />
              <div className="p-4">
                <p className="text-xs font-semibold tracking-widest text-red uppercase">{item.kicker}</p>
                <h3 className="font-display text-2xl tracking-wide" data-field={`${slot}Title`} data-field-page="about">{item.title}</h3>
                <p className="mt-2 text-sm text-steel" data-field={`${slot}Copy`} data-field-page="about">{item.copy}</p>
              </div>
            </article>
            );
          })}
        </div>
      </section>

      <section className="bg-card">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <p className="text-xs font-semibold tracking-widest text-red uppercase">Meet the team</p>
          <h2 className="font-display text-5xl tracking-wide" data-field="commitment" data-field-page="about">{copy.commitment}</h2>
          <p className="mt-2 text-sm tracking-wide text-steel">— Rich Bell</p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {team.map((person) => {
              const slot = `team-${person.name.split(" ")[0].toLowerCase()}`;
              return (
              <article key={person.email + person.name}>
                <div className="overflow-hidden rounded-3xl bg-black ring-1 ring-red/40">
                  <EditableImage page="about" slot={slot} src={copy[`img:${slot}`] || `${person.image}?v=3`} alt={person.name} className="aspect-[5/8] w-full object-cover object-center" />
                </div>
                <h3 className="mt-3 font-display text-2xl tracking-wide">{person.name}</h3>
                <p className="text-sm text-steel">{person.title}</p>
                <a className="text-sm text-red underline-offset-4 hover:underline" href={`mailto:${person.email}`}>
                  {person.email}
                </a>
              </article>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
