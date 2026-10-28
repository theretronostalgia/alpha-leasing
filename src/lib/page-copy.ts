import { servicesIntro, story, traditions, welcome } from "@/lib/company";

export type PageField = { key: string; label: string; multiline?: boolean };

export const pageCatalog: { slug: string; label: string; fields: PageField[] }[] = [
  {
    slug: "home",
    label: "Home",
    fields: [
      { key: "welcome", label: "Welcome", multiline: true },
      { key: "story", label: "Our Story", multiline: true },
      { key: "servicesIntro", label: "Values Intro", multiline: true },
      { key: "haulTitle", label: "Local and Regional Hauls Title" },
      { key: "haulCopy", label: "Local and Regional Hauls", multiline: true },
      { key: "repairTitle", label: "Truck and Trailer Repair Title" },
      { key: "repairCopy", label: "Truck and Trailer Repair", multiline: true },
      { key: "leaseTitle", label: "Contract Leasing Title" },
      { key: "leaseCopy", label: "Contract Leasing", multiline: true },
    ],
  },
  {
    slug: "about",
    label: "About",
    fields: [
      { key: "story", label: "Our Story", multiline: true },
      { key: "servicesIntro", label: "What We Do Intro", multiline: true },
      { key: "commitment", label: "Commitment Line" },
      { key: "haulTitle", label: "Local and Regional Hauls Title" },
      { key: "haulCopy", label: "Local and Regional Hauls", multiline: true },
      { key: "repairTitle", label: "Truck and Trailer Repair Title" },
      { key: "repairCopy", label: "Truck and Trailer Repair", multiline: true },
      { key: "leaseTitle", label: "Contract Leasing Title" },
      { key: "leaseCopy", label: "Contract Leasing", multiline: true },
    ],
  },
  {
    slug: "contact",
    label: "Contact and Legal",
    fields: [{ key: "intro", label: "Intro", multiline: true }],
  },
  {
    slug: "drive",
    label: "Drive",
    fields: [{ key: "intro", label: "Opportunities Intro", multiline: true }],
  },
  {
    slug: "quote",
    label: "Rate Quote",
    fields: [{ key: "intro", label: "Intro", multiline: true }],
  },
  {
    slug: "store",
    label: "Store",
    fields: [{ key: "heading", label: "Heading" }],
  },
];

export const pageDefaults: Record<string, Record<string, string>> = {
  home: {
    welcome,
    story,
    servicesIntro,
    haulTitle: traditions[0].title,
    haulCopy: traditions[0].copy,
    repairTitle: traditions[1].title,
    repairCopy: traditions[1].copy,
    leaseTitle: traditions[2].title,
    leaseCopy: traditions[2].copy,
  },
  about: {
    story,
    servicesIntro,
    commitment: "We’re Committed To Your Satisfaction.",
    haulTitle: traditions[0].title,
    haulCopy: traditions[0].copy,
    repairTitle: traditions[1].title,
    repairCopy: traditions[1].copy,
    leaseTitle: traditions[2].title,
    leaseCopy: traditions[2].copy,
  },
  contact: {
    intro: "This page covers how this website is used, what we keep from forms you send, and who operates the company.",
  },
  drive: {
    intro: "",
  },
  quote: {
    intro: "",
  },
  store: {
    heading: "Gear For Those Who Work In High Gear",
  },
};
