import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { listRoles, listUsers, removeUser, saveUser, type DirectoryUser } from "@/lib/access.functions";

export const Route = createFileRoute("/office/users")({ component: UsersPage });

const empty = { id: "", name: "", employeeNumber: "", role: "driver", password: "" };

function UsersPage() {
  const [users, setUsers] = useState<DirectoryUser[] | null>(null);
  const [roles, setRoles] = useState<string[]>(["admin", "staff", "driver"]);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function load() {
    void listUsers().then(setUsers).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Couldn’t load users"));
    void listRoles().then((rows) => setRoles(rows.map((row) => row.slug))).catch(() => undefined);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <p className="text-xs font-semibold tracking-widest text-red uppercase">Admin</p>
      <h1 className="font-display text-5xl tracking-wide">Users</h1>
      <p className="mt-2 text-sm text-steel">Add people, set their role, or remove an account. Drivers can sign in. They can’t change the office.</p>
      <form
        className="mt-6 grid gap-3 rounded-3xl bg-card p-5 ring-1 ring-red/40 md:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault();
          setBusy(true);
          setError("");
          void saveUser({ data: form })
            .then(() => {
              setForm(empty);
              load();
            })
            .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Couldn’t save that user"))
            .finally(() => setBusy(false));
        }}
      >
        <label className="grid gap-1 text-sm">
          Name
          <input className="h-11 rounded-xl border border-line bg-paper px-3" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
        </label>
        <label className="grid gap-1 text-sm">
          Employee Number
          <input className="h-11 rounded-xl border border-line bg-paper px-3" value={form.employeeNumber} onChange={(event) => setForm({ ...form, employeeNumber: event.target.value })} required />
        </label>
        <label className="grid gap-1 text-sm">
          Role
          <select className="h-11 rounded-xl border border-line bg-paper px-3" value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}>
            {roles.map((role) => (
              <option key={role}>{role}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm">
          Password {form.id ? "(leave blank to keep)" : ""}
          <input type="password" className="h-11 rounded-xl border border-line bg-paper px-3" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required={!form.id} />
        </label>
        <div className="flex gap-2 md:col-span-2">
          <button type="submit" disabled={busy} className="h-11 rounded-full bg-red px-5 text-sm font-semibold text-snow disabled:opacity-60">
            {form.id ? "Save User" : "Add User"}
          </button>
          {form.id ? (
            <button type="button" className="h-11 rounded-full border border-line px-5 text-sm" onClick={() => setForm(empty)}>
              Cancel
            </button>
          ) : null}
        </div>
        {error ? <p className="text-sm text-red md:col-span-2">{error}</p> : null}
      </form>
      <ul className="mt-4 grid gap-2">
        {(users ?? []).map((person) => (
          <li key={person.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-card px-4 py-3 text-sm ring-1 ring-line">
            <span>
              <span className="font-medium">{person.name}</span>
              <span className="ml-2 text-steel">{person.employeeNumber || person.email}</span>
              <span className="ml-2 text-xs tracking-wide text-red uppercase">{person.role}</span>
            </span>
            <span className="flex gap-2">
              <button
                type="button"
                className="h-9 rounded-full border border-line px-3 text-xs"
                onClick={() => setForm({ id: person.id, name: person.name, employeeNumber: person.employeeNumber, role: person.role, password: "" })}
              >
                Edit
              </button>
              <button
                type="button"
                className="h-9 rounded-full border border-line px-3 text-xs"
                onClick={() => {
                  void removeUser({ data: { id: person.id } })
                    .then(load)
                    .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Couldn’t remove that user"));
                }}
              >
                Remove
              </button>
            </span>
          </li>
        ))}
      </ul>
    </main>
  );
}
