export type Product = {
  id: string;
  name: string;
  price: number;
  blurb: string;
  detail: string;
  image: string;
  sizes: string[];
};

export const products: Product[] = [
  {
    id: "yard-cap",
    name: "Yard cap",
    price: 18,
    blurb: "Black trucker cap for the dock and the cab.",
    detail:
      "Company-store cap. Request a size and the office will have it at the Coliseum shop. Payroll deduction or pay at the counter.",
    image: "/media/store/cap.jpg",
    sizes: ["One size", "S/M", "L/XL"],
  },
  {
    id: "shop-tee",
    name: "Shop tee",
    price: 24,
    blurb: "Heavy navy tee. Built for a shift, not a photoshoot.",
    detail: "Short-sleeve shop shirt. Pick it up at Suite 1320 or the shop office.",
    image: "/media/store/tee.jpg",
    sizes: ["S", "M", "L", "XL", "2XL"],
  },
  {
    id: "heavy-hoodie",
    name: "Heavy hoodie",
    price: 52,
    blurb: "Charcoal pullover for Midwest mornings on the lot.",
    detail: "Fleece hoodie from the company store. Staff confirms the request before it’s pulled.",
    image: "/media/store/hoodie.jpg",
    sizes: ["S", "M", "L", "XL", "2XL"],
  },
  {
    id: "winter-beanie",
    name: "Winter beanie",
    price: 16,
    blurb: "Red and black knit. Fits under a hood.",
    detail: "One size. A cold-weather staple for the yard.",
    image: "/media/store/beanie.jpg",
    sizes: ["One size"],
  },
  {
    id: "shop-vest",
    name: "Shop vest",
    price: 36,
    blurb: "High-visibility vest with reflective tape for the lot.",
    detail: "Wear it when you’re on the ground around equipment. Company store only — not a substitute for issued PPE if your job requires a specific vest.",
    image: "/media/store/vest.jpg",
    sizes: ["M", "L", "XL", "2XL"],
  },
  {
    id: "road-tumbler",
    name: "Road tumbler",
    price: 22,
    blurb: "Matte black 20 oz tumbler for the cup holder.",
    detail: "Keeps coffee through a local turn. Pickup at the office.",
    image: "/media/store/tumbler.jpg",
    sizes: ["20 oz"],
  },
];

export function money(centsOrDollars: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(
    centsOrDollars,
  );
}
