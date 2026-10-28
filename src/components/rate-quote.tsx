import { useState, type FormEvent } from "react";
import { company, equipmentTypes, freightTypes } from "@/lib/company";
import { submitQuote } from "@/lib/inbox.functions";

const empty = {
  contactName: "",
  company: "",
  email: "",
  phone: "",
  origin: "",
  destination: "",
  freight: freightTypes[0] as string,
  weight: "",
  equipment: equipmentTypes[0] as string,
  pickupDate: "",
  deliveryDate: "",
  notes: "",
};

export function RateQuote() {
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");
  const [id, setId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

  function set<K extends keyof typeof empty>(key: K, value: (typeof empty)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setBusy(true);
    void submitQuote({ data: form })
      .then((result) => setId(result.id))
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Couldn’t send the quote."))
      .finally(() => setBusy(false));
  }

  if (id) {
    return (
      <div className="rounded-3xl bg-card p-6 ring-1 ring-line md:p-8">
        <p className="text-xs font-semibold tracking-widest text-red uppercase">Quote {id}</p>
        <h3 className="mt-2 font-display text-4xl tracking-wide">We have it.</h3>
        <p className="mt-3 text-steel">
          Logistics will look at {form.origin} to {form.destination}. If you need someone now, call {company.phone} and ask for Ken Bell.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-2 rounded-2xl bg-card p-4 ring-1 ring-line sm:grid-cols-2 lg:grid-cols-4">
      <div className="sm:col-span-2 lg:col-span-4">
        <h3 className="font-display text-3xl tracking-wide">Request A Rate Quote</h3>
      </div>
      <Field label="Your Name" value={form.contactName} onChange={(value) => set("contactName", value)} required />
      <Field label="Company" value={form.company} onChange={(value) => set("company", value)} />
      <Field label="Email" type="email" value={form.email} onChange={(value) => set("email", value)} required />
      <Field label="Phone" type="tel" value={form.phone} onChange={(value) => set("phone", value)} required />
      <Field label="Origin - City, State" value={form.origin} onChange={(value) => set("origin", value)} required />
      <Field label="Destination - City, State" value={form.destination} onChange={(value) => set("destination", value)} required />
      <Select label="Freight" value={form.freight} options={freightTypes} onChange={(value) => set("freight", value)} />
      <Field label="Approx. Weight" value={form.weight} onChange={(value) => set("weight", value)} required placeholder="42,000 lbs" />
      <Select label="Equipment" value={form.equipment} options={equipmentTypes} onChange={(value) => set("equipment", value)} />
      <Field label="Pickup Date" type="date" value={form.pickupDate} onChange={(value) => set("pickupDate", value)} required />
      <Field label="Delivery Date" type="date" value={form.deliveryDate} onChange={(value) => set("deliveryDate", value)} required />
      <label className="grid gap-1 text-sm sm:col-span-2 lg:col-span-3">
        Notes
        <input
          className="h-9 rounded-lg border border-line bg-paper px-3"
          value={form.notes}
          onChange={(event) => set("notes", event.target.value)}
        />
      </label>
      {error ? <p className="text-sm text-red sm:col-span-2 lg:col-span-4">{error}</p> : null}
      <div className="flex items-end">
        <button type="submit" disabled={busy} className="h-9 w-full rounded-full bg-red px-4 text-sm font-semibold text-snow disabled:opacity-60">
          {busy ? "Sending…" : "Request a rate"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="grid gap-1 text-sm">
      {label}
      <input
        required={required}
        type={type}
        placeholder={placeholder}
        className="h-9 rounded-lg border border-line bg-paper px-3"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-1 text-sm">
      {label}
      <select className="h-9 rounded-lg border border-line bg-paper px-3" value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}
