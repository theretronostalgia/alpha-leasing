import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Lock } from "lucide-react";
import { money, products, type Product } from "@/lib/catalog";
import { useCart } from "@/lib/cart";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { submitOrder } from "@/lib/inbox.functions";
import { usePageCopy } from "@/lib/use-page-copy";
import { EditableImage } from "@/lib/page-edit";

export function StoreExperience({ heading = true }: { heading?: boolean }) {
  const copy = usePageCopy("store");
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState<Product | null>(null);
  const [paused, setPaused] = useState(false);
  const shown = products.map((item) => ({ ...item, image: copy[`img:${item.id}`] || item.image }));
  const product = shown[index] ?? shown[0];

  useEffect(() => {
    if (paused || open) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % products.length);
    }, 4500);
    return () => window.clearInterval(timer);
  }, [paused, open]);

  return (
    <section id="store" className="mx-auto max-w-6xl px-4 py-16" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      {heading ? (
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-widest text-red uppercase">Company store</p>
            <h2 className="font-display text-5xl tracking-wide" data-field="heading" data-field-page="store">{copy.heading}</h2>
          </div>
          <p className="text-sm text-steel">
            {index + 1} / {products.length}
          </p>
        </div>
      ) : null}

      <div className="grid items-center gap-6 md:grid-cols-[auto_1fr_auto]">
        <button type="button" className="hidden h-12 w-12 place-items-center rounded-full border border-line bg-card md:grid" aria-label="Previous item" onClick={() => setIndex((i) => (i - 1 + products.length) % products.length)}>
          <ChevronLeft />
        </button>
        <div className="group grid overflow-hidden rounded-2xl bg-card text-left ring-1 ring-line md:grid-cols-2">
          <EditableImage page="store" slot={product.id} src={product.image} alt={product.name} className="aspect-square w-full object-cover" />
          <button type="button" className="flex flex-col justify-between p-6 text-left md:p-8" onClick={() => setOpen(product)}>
            <div>
              <p className="text-xs font-semibold tracking-widest text-red uppercase">Click to view</p>
              <h3 className="mt-2 font-display text-5xl tracking-wide">{product.name}</h3>
              <p className="mt-3 text-steel">{product.blurb}</p>
            </div>
            <p className="mt-6 font-display text-4xl">{money(product.price)}</p>
          </button>
        </div>
        <button type="button" className="hidden h-12 w-12 place-items-center rounded-full border border-line bg-card md:grid" aria-label="Next item" onClick={() => setIndex((i) => (i + 1) % products.length)}>
          <ChevronRight />
        </button>
      </div>

      <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
        {shown.map((item, itemIndex) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              setIndex(itemIndex);
              setOpen(item);
            }}
            className={`w-24 shrink-0 overflow-hidden rounded-xl ring-2 ${itemIndex === index ? "ring-red" : "ring-transparent"}`}
          >
            <img src={item.image} alt="" className="aspect-square w-full object-cover" />
          </button>
        ))}
      </div>

      <div className="mt-3 flex justify-between md:hidden">
        <button type="button" className="h-11 rounded-full border border-line px-4" onClick={() => setIndex((i) => (i - 1 + products.length) % products.length)}>
          Previous
        </button>
        <button type="button" className="h-11 rounded-full border border-line px-4" onClick={() => setIndex((i) => (i + 1) % products.length)}>
          Next
        </button>
      </div>

      <RequestList />
      {open ? <ProductDialog product={open} onClose={() => setOpen(null)} /> : null}
    </section>
  );
}

function ProductDialog({ product, onClose }: { product: Product; onClose: () => void }) {
  const { user, isPending } = useCurrentUserState();
  const add = useCart((state) => state.add);
  const [size, setSize] = useState(product.sizes[0] ?? "One size");
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");

  useEffect(() => {
    setSize(product.sizes[0] ?? "One size");
    setQty(1);
    setNote("");
  }, [product]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-black/50 p-0 sm:place-items-center sm:p-6" role="presentation" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-title"
        className="max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-card p-5 shadow-xl sm:max-w-lg sm:rounded-3xl"
        onClick={(event) => event.stopPropagation()}
      >
        <EditableImage page="store" slot={product.id} src={product.image} alt="" className="aspect-square w-full rounded-2xl object-cover" />
        <h3 id="product-title" className="mt-4 font-display text-4xl tracking-wide">
          {product.name}
        </h3>
        <p className="mt-2 text-steel">{product.detail}</p>
        <p className="mt-3 font-display text-3xl">{money(product.price)}</p>

        {isPending ? <div className="mt-4 h-11 animate-pulse rounded-full bg-line" /> : null}

        {!isPending && !user ? (
          <div className="mt-5 rounded-2xl border border-line bg-paper p-4">
            <p className="flex items-center gap-2 font-medium">
              <Lock size={16} /> Sign in to request this
            </p>
            <p className="mt-1 text-sm text-steel">You can look all you want. The company store takes requests only from signed-in drivers and staff.</p>
            <Link
              to="/login"
              search={{ as: "driver", next: "/store" }}
              className="mt-4 inline-flex h-11 items-center rounded-full bg-red px-5 text-sm font-semibold text-snow"
            >
              Driver sign in
            </Link>
          </div>
        ) : null}

        {user ? (
          <form
            className="mt-5 grid gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              add(product.id, size, qty);
              setNote("Added to your request.");
            }}
          >
            <label className="grid gap-1 text-sm">
              Size
              <select className="h-11 rounded-xl border border-line bg-paper px-3" value={size} onChange={(event) => setSize(event.target.value)}>
                {product.sizes.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 text-sm">
              Quantity
              <input
                className="h-11 rounded-xl border border-line bg-paper px-3"
                type="number"
                min={1}
                max={6}
                value={qty}
                onChange={(event) => setQty(Number(event.target.value))}
              />
            </label>
            <button type="submit" className="h-11 rounded-full bg-red text-sm font-semibold text-snow">
              Add to request
            </button>
            {note ? <p className="text-sm text-steel">{note}</p> : null}
          </form>
        ) : null}

        <button type="button" className="mt-4 h-11 w-full rounded-full border border-line" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}

function RequestList() {
  const { user, isPending } = useCurrentUserState();
  const lines = useCart((state) => state.lines);
  const remove = useCart((state) => state.remove);
  const clear = useCart((state) => state.clear);
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  if (isPending || !user || lines.length === 0) return null;

  const detailed = lines.map((line) => {
    const product = products.find((item) => item.id === line.productId);
    return { ...line, name: product?.name ?? line.productId, price: product?.price ?? 0 };
  });
  const total = detailed.reduce((sum, line) => sum + line.price * line.qty, 0);

  return (
    <div className="mt-8 rounded-2xl border border-line bg-card p-5">
      <h3 className="font-display text-3xl tracking-wide">Your request</h3>
      <ul className="mt-3 divide-y divide-line">
        {detailed.map((line) => (
          <li key={`${line.productId}-${line.size}`} className="flex items-center justify-between gap-3 py-3 text-sm">
            <span>
              {line.qty} × {line.name} · {line.size}
            </span>
            <button type="button" className="text-red" onClick={() => remove(line.productId, line.size)}>
              Remove
            </button>
          </li>
        ))}
      </ul>
      <p className="mt-2 font-medium">Estimated {money(total)} — paid at pickup, not online.</p>
      <label className="mt-3 grid gap-1 text-sm">
        Note for the office
        <input className="h-11 rounded-xl border border-line bg-paper px-3" value={note} onChange={(event) => setNote(event.target.value)} />
      </label>
      <button
        type="button"
        disabled={busy}
        className="mt-3 h-11 rounded-full bg-red px-5 text-sm font-semibold text-snow disabled:opacity-60"
        onClick={() => {
          setBusy(true);
          setMessage("");
          void submitOrder({ data: { note, items: detailed } })
            .then((result) => {
              clear();
              setNote("");
              setMessage(`Request #${result.id} is in the office log. Pick it up at the shop.`);
            })
            .catch(() => setMessage("Couldn’t send that request. Try again."))
            .finally(() => setBusy(false));
        }}
      >
        {busy ? "Sending…" : "Send request to the office"}
      </button>
      {message ? <p className="mt-3 text-sm">{message}</p> : null}
    </div>
  );
}
