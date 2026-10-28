import { useState } from "react";
import { setInboxStatus, type InboxRow, type JsonValue } from "@/lib/inbox.functions";

export function AdminLog({
  kind,
  rows,
  statuses,
  onStatus,
}: {
  kind: "application" | "quote" | "order";
  rows: InboxRow[];
  statuses: string[];
  onStatus: (id: number, status: string) => void;
}) {
  const [openId, setOpenId] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const needle = query.trim().toLowerCase();
  const shown = rows.filter((row) => {
    if (status !== "all" && row.status !== status) return false;
    if (!needle) return true;
    return `${row.title} ${row.subtitle} ${row.status}`.toLowerCase().includes(needle);
  });

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search"
          className="h-11 min-w-48 flex-1 rounded-xl border border-line bg-paper px-3 text-sm"
        />
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="h-11 rounded-xl border border-line bg-paper px-3 text-sm"
        >
          <option value="all">All Statuses</option>
          {statuses.map((choice) => (
            <option key={choice} value={choice}>
              {statusLabel(choice)}
            </option>
          ))}
        </select>
      </div>
      <ul className="mt-4 grid gap-3">
        {shown.map((row) => (
          <li key={row.id} className="rounded-2xl bg-card p-4 ring-1 ring-line">
            <button type="button" className="flex w-full items-start justify-between gap-3 text-left" onClick={() => setOpenId(openId === row.id ? null : row.id)}>
              <span>
                <span className="font-medium">{row.title}</span>
                <span className="mt-1 block text-sm text-steel">{row.subtitle}</span>
              </span>
              <span className="text-xs tracking-wide text-red uppercase">{statusLabel(row.status)}</span>
            </button>
            {openId === row.id ? (
              <div className="mt-4">
                <label className="text-sm">
                  Status{" "}
                  <select
                    className="ml-2 h-10 rounded-lg border border-line bg-paper px-2"
                    value={row.status}
                    onChange={(event) => {
                      const next = event.target.value;
                      void setInboxStatus({ data: { kind, id: row.id, status: next } }).then(() => onStatus(row.id, next));
                    }}
                  >
                    {statuses.map((choice) => (
                      <option key={choice} value={choice}>
                        {statusLabel(choice)}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="mt-3 text-sm">
                  <Detail value={maskSecrets(row.detail)} />
                </div>
                <p className="mt-2 text-xs text-steel">{when(row.createdAt)}</p>
              </div>
            ) : null}
          </li>
        ))}
        {shown.length === 0 ? <li className="text-sm text-steel">Nothing here yet.</li> : null}
      </ul>
    </div>
  );
}

export function statusLabel(value: string) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function when(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function maskSecrets(value: JsonValue): JsonValue {
  if (Array.isArray(value)) return value.map((item) => maskSecrets(item));
  if (!value || typeof value !== "object") return value;
  const next: { [key: string]: JsonValue } = {};
  for (const [key, item] of Object.entries(value)) {
    if (key.toLowerCase() === "ssn" && typeof item === "string" && item.length > 4) {
      next[key] = `•••-••-${item.slice(-4)}`;
    } else {
      next[key] = maskSecrets(item);
    }
  }
  return next;
}

function Detail({ value }: { value: JsonValue }) {
  if (Array.isArray(value)) {
    return (
      <ul className="grid gap-2">
        {value.map((item, index) => (
          <li key={index} className="rounded-xl bg-paper p-2">
            <Detail value={item} />
          </li>
        ))}
      </ul>
    );
  }
  if (value && typeof value === "object") {
    return (
      <dl className="grid gap-1">
        {Object.entries(value)
          .filter(([, item]) => item !== "" && item !== null && !(Array.isArray(item) && item.length === 0))
          .map(([key, item]) => (
            <div key={key} className="grid gap-1 border-b border-line py-1 sm:grid-cols-[12rem_1fr]">
              <dt className="text-steel">{label(key)}</dt>
              <dd>
                <Detail value={item} />
              </dd>
            </div>
          ))}
      </dl>
    );
  }
  return <span>{String(value)}</span>;
}

function label(key: string) {
  const spaced = key.replace(/([A-Z])/g, " $1");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}
