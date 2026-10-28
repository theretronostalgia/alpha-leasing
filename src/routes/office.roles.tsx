import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PERMISSIONS } from "@/lib/access";
import { addRole, listRoles, removeRole, saveRolePermission, type RoleRow } from "@/lib/access.functions";

export const Route = createFileRoute("/office/roles")({ component: RolesPage });

function RolesPage() {
  const [roles, setRoles] = useState<RoleRow[] | null>(null);
  const [label, setLabel] = useState("");
  const [error, setError] = useState("");

  function load() {
    void listRoles().then(setRoles).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Couldn’t load roles"));
  }

  useEffect(() => {
    load();
  }, []);

  function onAdd(event: FormEvent) {
    event.preventDefault();
    setError("");
    void addRole({ data: { label } })
      .then(() => {
        setLabel("");
        load();
      })
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Couldn’t add that role"));
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <p className="text-xs font-semibold tracking-widest text-red uppercase">Admin</p>
      <h1 className="font-display text-5xl tracking-wide">Roles</h1>
      <p className="mt-2 text-sm text-steel">Admin can change the office. Staff can work the logs. Drivers can sign in and shop, and nothing else.</p>
      <form onSubmit={onAdd} className="mt-6 flex flex-wrap gap-2">
        <input className="h-11 rounded-xl border border-line bg-paper px-3 text-sm" value={label} onChange={(event) => setLabel(event.target.value)} placeholder="New role" required />
        <button type="submit" className="h-11 rounded-full bg-red px-5 text-sm font-semibold text-snow">
          Add Role
        </button>
      </form>
      {error ? <p className="mt-3 text-sm text-red">{error}</p> : null}
      <div className="mt-6 grid gap-4">
        {(roles ?? []).map((role) => (
          <section key={role.slug} className="rounded-3xl bg-card p-5 ring-1 ring-line">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-3xl tracking-wide">{role.label}</h2>
              {["admin", "staff", "driver"].includes(role.slug) ? null : (
                <button
                  type="button"
                  className="h-9 rounded-full border border-line px-3 text-xs"
                  onClick={() => {
                    void removeRole({ data: { slug: role.slug } })
                      .then(load)
                      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Couldn’t remove that role"));
                  }}
                >
                  Remove
                </button>
              )}
            </div>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {PERMISSIONS.map((permission) => {
                const checked = role.permissions.includes(permission.key);
                return (
                  <li key={permission.key}>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(event) => {
                          const enabled = event.target.checked;
                          setRoles((current) =>
                            current?.map((item) =>
                              item.slug === role.slug
                                ? {
                                    ...item,
                                    permissions: enabled ? [...item.permissions, permission.key] : item.permissions.filter((key) => key !== permission.key),
                                  }
                                : item,
                            ) ?? null,
                          );
                          void saveRolePermission({ data: { role: role.slug, permission: permission.key, enabled } }).catch((reason: unknown) => {
                            setError(reason instanceof Error ? reason.message : "Couldn’t update that permission");
                            load();
                          });
                        }}
                      />
                      {permission.label}
                    </label>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
}
