import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { employeeEmail, PERMISSIONS, type Permission } from "@/lib/access";
import { pageCatalog, pageDefaults } from "@/lib/page-copy";

function asRecord(input: unknown): Record<string, unknown> {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("Invalid request");
  return input as Record<string, unknown>;
}

function text(data: Record<string, unknown>, key: string) {
  const value = data[key];
  if (typeof value !== "string" || !value.trim()) throw new Error(`Missing ${key}`);
  return value.trim();
}

export type DirectoryUser = {
  id: string;
  name: string;
  email: string;
  employeeNumber: string;
  role: string;
};

export type RoleRow = { slug: string; label: string; permissions: Permission[] };

export const myAccess = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { permissionsFor } = await import("@/lib/access.server");
    const permissions = await permissionsFor(context.userId);
    return { permissions };
  });

export const getPageCopy = createServerFn({ method: "GET" })
  .validator((input: unknown) => {
    const page = text(asRecord(input), "page");
    if (!pageDefaults[page]) throw new Error("Unknown page");
    return { page };
  })
  .handler(async ({ data }) => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const rows = await sql<{ key: string; value: string }>`select key, value from page_copy where page = ${data.page}`;
    const copy = { ...pageDefaults[data.page] };
    for (const row of rows) copy[row.key] = row.value;
    return copy;
  });

export const savePageCopy = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => {
    const data = asRecord(input);
    const page = text(data, "page");
    if (!pageCatalog.some((item) => item.slug === page)) throw new Error("Unknown page");
    const fields = asRecord(data.fields);
    const next: Record<string, string> = {};
    for (const field of pageCatalog.find((item) => item.slug === page)?.fields ?? []) {
      const value = fields[field.key];
      next[field.key] = typeof value === "string" ? value : "";
    }
    return { page, fields: next };
  })
  .handler(async ({ data, context }) => {
    const { requirePermission } = await import("@/lib/access.server");
    await requirePermission(context.userId, "pages.edit");
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    for (const [key, value] of Object.entries(data.fields)) {
      await sql`
        insert into page_copy (page, key, value) values (${data.page}, ${key}, ${value})
        on conflict (page, key) do update set value = excluded.value
      `;
    }
    return { ok: true };
  });

export const listUsers = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { requirePermission } = await import("@/lib/access.server");
    await requirePermission(context.userId, "users.manage");
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const rows = await sql<{ id: string; name: string; email: string; employee_number: string | null; role: string | null }>`
      select u.id, u.name, u.email, p.employee_number, p.role
      from "user" u
      left join profiles p on p.user_id = u.id
      order by u.name
    `;
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      employeeNumber: row.employee_number ?? "",
      role: row.role ?? "driver",
    })) satisfies DirectoryUser[];
  });

export const saveUser = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => {
    const data = asRecord(input);
    const name = text(data, "name");
    const employeeNumber = text(data, "employeeNumber");
    const role = text(data, "role");
    const password = typeof data.password === "string" ? data.password : "";
    const id = typeof data.id === "string" ? data.id : "";
    if (!/^\d{4,12}$/.test(employeeNumber)) throw new Error("Employee number should be 4 to 12 digits");
    if (password && password.length < 6) throw new Error("Password needs at least 6 characters");
    return { id, name, employeeNumber, role, password };
  })
  .handler(async ({ data, context }) => {
    const { requirePermission } = await import("@/lib/access.server");
    await requirePermission(context.userId, "users.manage");
    const { getSql } = await import("@/lib/db");
    const { auth } = await import("@/lib/auth/server");
    const sql = await getSql();
    const roles = await sql<{ slug: string }>`select slug from roles where slug = ${data.role} limit 1`;
    if (!roles[0]) throw new Error("Unknown role");
    const email = employeeEmail(data.employeeNumber);
    if (!data.id) {
      const created = await auth.api.signUpEmail({
        body: { email, password: data.password || "654321", name: data.name },
      });
      const userId = created.user.id;
      await sql`insert into profiles (user_id, employee_number, role) values (${userId}, ${data.employeeNumber}, ${data.role})`;
      return { id: userId };
    }
    if (data.id === context.userId && data.role !== "admin") {
      const admins = await sql<{ count: number }>`select count(*)::int as count from profiles where role = 'admin'`;
      if (Number(admins[0]?.count ?? 0) < 2) throw new Error("Keep at least one admin");
    }
    await sql`update "user" set name = ${data.name}, email = ${email} where id = ${data.id}`;
    await sql`
      insert into profiles (user_id, employee_number, role) values (${data.id}, ${data.employeeNumber}, ${data.role})
      on conflict (user_id) do update set employee_number = excluded.employee_number, role = excluded.role
    `;
    if (data.password) {
      const ctx = await auth.$context;
      const hash = await ctx.password.hash(data.password);
      await sql`update account set password = ${hash}, "updatedAt" = now() where "userId" = ${data.id} and "providerId" = 'credential'`;
    }
    return { id: data.id };
  });

export const removeUser = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => ({ id: text(asRecord(input), "id") }))
  .handler(async ({ data, context }) => {
    const { requirePermission } = await import("@/lib/access.server");
    await requirePermission(context.userId, "users.manage");
    if (data.id === context.userId) throw new Error("You can’t remove yourself");
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    await sql`delete from "user" where id = ${data.id}`;
    return { ok: true };
  });

export const listRoles = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { permissionsFor } = await import("@/lib/access.server");
    const permissions = await permissionsFor(context.userId);
    if (!permissions.includes("roles.manage") && !permissions.includes("users.manage")) throw new Error("Not allowed");
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const roles = await sql<{ slug: string; label: string }>`select slug, label from roles order by label`;
    const grants = await sql<{ role: string; permission: string }>`select role, permission from role_permissions`;
    return roles.map((role) => ({
      slug: role.slug,
      label: role.label,
      permissions: grants.filter((grant) => grant.role === role.slug).map((grant) => grant.permission as Permission),
    })) satisfies RoleRow[];
  });

export const saveRolePermission = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => {
    const data = asRecord(input);
    const role = text(data, "role");
    const permission = text(data, "permission");
    if (!PERMISSIONS.some((item) => item.key === permission)) throw new Error("Unknown permission");
    return { role, permission: permission as Permission, enabled: data.enabled === true };
  })
  .handler(async ({ data, context }) => {
    const { requirePermission } = await import("@/lib/access.server");
    await requirePermission(context.userId, "roles.manage");
    if (data.role === "admin" && (data.permission === "users.manage" || data.permission === "roles.manage") && !data.enabled) {
      throw new Error("Admin keeps user and role access");
    }
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    if (data.enabled) {
      await sql`insert into role_permissions (role, permission) values (${data.role}, ${data.permission}) on conflict do nothing`;
    } else {
      await sql`delete from role_permissions where role = ${data.role} and permission = ${data.permission}`;
    }
    return { ok: true };
  });

export const addRole = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => ({ label: text(asRecord(input), "label") }))
  .handler(async ({ data, context }) => {
    const { requirePermission } = await import("@/lib/access.server");
    await requirePermission(context.userId, "roles.manage");
    const slug = data.label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    if (!slug) throw new Error("Name the role");
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    await sql`insert into roles (slug, label) values (${slug}, ${data.label})`;
    return { slug };
  });

export const removeRole = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => ({ slug: text(asRecord(input), "slug") }))
  .handler(async ({ data, context }) => {
    const { requirePermission } = await import("@/lib/access.server");
    await requirePermission(context.userId, "roles.manage");
    if (["admin", "staff", "driver"].includes(data.slug)) throw new Error("That role stays");
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const used = await sql<{ count: number }>`select count(*)::int as count from profiles where role = ${data.slug}`;
    if (Number(used[0]?.count ?? 0) > 0) throw new Error("Move those users off this role first");
    await sql`delete from roles where slug = ${data.slug}`;
    return { ok: true };
  });

export const confirmPagePassword = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => {
    const data = asRecord(input);
    return { password: text(data, "password") };
  })
  .handler(async ({ data, context }) => {
    const { requirePermission, assertPassword } = await import("@/lib/access.server");
    await requirePermission(context.userId, "pages.edit");
    await assertPassword(context.userId, data.password);
    return { ok: true };
  });

export const savePageImage = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => {
    const data = asRecord(input);
    const image = data.image;
    if (typeof image !== "string" || !image.startsWith("data:image/")) throw new Error("Choose a picture");
    return { page: text(data, "page"), slot: text(data, "slot"), password: text(data, "password"), image };
  })
  .handler(async ({ data, context }) => {
    const { requirePermission, assertPassword, writePageImage } = await import("@/lib/access.server");
    await requirePermission(context.userId, "pages.edit");
    await assertPassword(context.userId, data.password);
    return writePageImage(data.page, data.slot, data.image);
  });

export const savePageVideo = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => {
    const data = asRecord(input);
    const video = data.video;
    if (typeof video !== "string" || !video.startsWith("data:video/")) throw new Error("Choose a video");
    return { page: text(data, "page"), slot: text(data, "slot"), password: text(data, "password"), video };
  })
  .handler(async ({ data, context }) => {
    const { requirePermission, assertPassword, writePageVideo } = await import("@/lib/access.server");
    await requirePermission(context.userId, "pages.edit");
    await assertPassword(context.userId, data.password);
    return writePageVideo(data.page, data.slot, data.video);
  });

export const savePageField = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => {
    const data = asRecord(input);
    const value = data.value;
    if (typeof value !== "string") throw new Error("Missing value");
    return { page: text(data, "page"), key: text(data, "key"), password: text(data, "password"), value };
  })
  .handler(async ({ data, context }) => {
    const { requirePermission, assertPassword, writePageField } = await import("@/lib/access.server");
    await requirePermission(context.userId, "pages.edit");
    await assertPassword(context.userId, data.password);
    return writePageField(data.page, data.key, data.value);
  });

export const readPageCode = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => {
    const data = asRecord(input);
    return { page: text(data, "page"), password: text(data, "password") };
  })
  .handler(async ({ data, context }) => {
    const { requirePermission, assertPassword, readPageSource } = await import("@/lib/access.server");
    await requirePermission(context.userId, "pages.edit");
    await assertPassword(context.userId, data.password);
    if (!pageDefaults[data.page]) throw new Error("Unknown page");
    return readPageSource(data.page);
  });

export const savePageCode = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => {
    const data = asRecord(input);
    const source = data.source;
    if (typeof source !== "string" || !source.trim()) throw new Error("The page code is empty");
    return { page: text(data, "page"), password: text(data, "password"), source };
  })
  .handler(async ({ data, context }) => {
    const { requirePermission, assertPassword, writePageSource } = await import("@/lib/access.server");
    await requirePermission(context.userId, "pages.edit");
    await assertPassword(context.userId, data.password);
    if (!pageDefaults[data.page]) throw new Error("Unknown page");
    return writePageSource(data.page, data.source);
  });
