import { PERMISSIONS, type Permission } from "@/lib/access";
import { isStaffEmail } from "@/lib/staff";

const ALL = PERMISSIONS.map((item) => item.key);

export async function permissionsFor(userId: string): Promise<Permission[]> {
  const { getSql } = await import("@/lib/db");
  const sql = await getSql();
  const users = await sql<{ email: string }>`select email from "user" where id = ${userId} limit 1`;
  const email = users[0]?.email ?? "";
  if (isStaffEmail(email)) return ALL;
  const rows = await sql<{ permission: string }>`
    select rp.permission
    from profiles p
    join role_permissions rp on rp.role = p.role
    where p.user_id = ${userId}
  `;
  return rows.map((row) => row.permission).filter((key): key is Permission => ALL.includes(key as Permission));
}

export async function assertPassword(userId: string, password: string) {
  if (!password) throw new Error("Enter your password");
  const { getSql } = await import("@/lib/db");
  const { auth } = await import("@/lib/auth/server");
  const sql = await getSql();
  const rows = await sql<{ password: string | null }>`
    select password from account where "userId" = ${userId} and "providerId" = 'credential' limit 1
  `;
  const hash = rows[0]?.password;
  if (!hash) throw new Error("This account has no password");
  const ctx = await auth.$context;
  const ok = await ctx.password.verify({ hash, password });
  if (!ok) throw new Error("Wrong password");
}

export async function requirePermission(userId: string, permission: Permission) {
  const permissions = await permissionsFor(userId);
  if (!permissions.includes(permission)) throw new Error("Not allowed");
  return permissions;
}

const pageFiles: Record<string, string> = {
  home: "src/routes/index.tsx",
  about: "src/routes/about.tsx",
  contact: "src/routes/contact.tsx",
  drive: "src/routes/apply.tsx",
  quote: "src/routes/quote.tsx",
  store: "src/routes/store.tsx",
};

function pageFile(slug: string) {
  const relative = pageFiles[slug];
  if (!relative) throw new Error("Unknown page");
  return relative;
}

export async function readPageSource(slug: string) {
  const { readFile } = await import("node:fs/promises");
  const path = await import("node:path");
  const relative = pageFile(slug);
  const full = path.resolve(process.cwd(), relative);
  const source = await readFile(full, "utf8");
  return { path: relative, source };
}

export async function writePageSource(slug: string, source: string) {
  const { writeFile } = await import("node:fs/promises");
  const path = await import("node:path");
  const relative = pageFile(slug);
  if (source.length > 200_000) throw new Error("That file is too large");
  if (!source.includes("createFileRoute")) throw new Error("That doesn’t look like a page file");
  const full = path.resolve(process.cwd(), relative);
  await writeFile(full, source);
  return { path: relative };
}

export async function writePageImage(page: string, slot: string, image: string) {
  const slots: Record<string, string[]> = {
    home: ["hero", "haul", "repair", "lease"],
    about: ["hero", "yard-0", "yard-1", "yard-2", "yard-3", "haul", "repair", "lease", "team-rich", "team-ken", "team-megan", "team-sharon"],
    store: ["yard-cap", "shop-tee", "heavy-hoodie", "winter-beanie", "shop-vest", "road-tumbler"],
  };
  if (!slots[page]?.includes(slot)) throw new Error("That picture can’t be replaced");
  const match = image.match(/^data:image\/(png|jpeg|jpg|webp|gif);base64,([A-Za-z0-9+/=]+)$/);
  if (!match) throw new Error("Use a PNG, JPG, WEBP, or GIF");
  if (match[2].length > 7_000_000) throw new Error("That picture is too large");
  const { writeFile, mkdir } = await import("node:fs/promises");
  const path = await import("node:path");
  const ext = match[1] === "jpeg" ? "jpg" : match[1];
  const dir = path.resolve(process.cwd(), "public/media/edits");
  await mkdir(dir, { recursive: true });
  const filename = `${page}-${slot}.${ext}`;
  await writeFile(path.join(dir, filename), Buffer.from(match[2], "base64"));
  const url = `/media/edits/${filename}?v=${Date.now()}`;
  const { getSql } = await import("@/lib/db");
  const sql = await getSql();
  const key = `img:${slot}`;
  await sql`
    insert into page_copy (page, key, value) values (${page}, ${key}, ${url})
    on conflict (page, key) do update set value = excluded.value
  `;
  return { url };
}

export async function writePageField(page: string, key: string, value: string) {
  const { pageCatalog, pageDefaults } = await import("@/lib/page-copy");
  if (!pageDefaults[page]) throw new Error("Unknown page");
  const fieldOk = pageCatalog.find((item) => item.slug === page)?.fields.some((field) => field.key === key);
  const domOk = /^dom:(?:[A-Z][A-Z0-9]*:\d+\/)*[A-Z][A-Z0-9]*:\d+$/.test(key);
  if (!fieldOk && !domOk) throw new Error("That text can’t be changed");
  if (value.length > 5000) throw new Error("That text is too long");
  const { getSql } = await import("@/lib/db");
  const sql = await getSql();
  await sql`
    insert into page_copy (page, key, value) values (${page}, ${key}, ${value})
    on conflict (page, key) do update set value = excluded.value
  `;
  return { ok: true };
}

export async function writePageVideo(page: string, slot: string, video: string) {
  const slots: Record<string, string[]> = { home: ["intro"] };
  if (!slots[page]?.includes(slot)) throw new Error("That video can’t be replaced");
  const match = video.match(/^data:video\/(mp4|webm|quicktime);base64,([A-Za-z0-9+/=\s]+)$/);
  if (!match) throw new Error("Use an MP4, WEBM, or MOV");
  const payload = match[2].replace(/\s/g, "");
  if (payload.length > 28_000_000) throw new Error("That video is too large");
  const { writeFile, mkdir } = await import("node:fs/promises");
  const path = await import("node:path");
  const ext = match[1] === "quicktime" ? "mov" : match[1];
  const dir = path.resolve(process.cwd(), "public/media/edits");
  await mkdir(dir, { recursive: true });
  const filename = `${page}-${slot}.${ext}`;
  await writeFile(path.join(dir, filename), Buffer.from(payload, "base64"));
  const url = `/media/edits/${filename}?v=${Date.now()}`;
  const { getSql } = await import("@/lib/db");
  const sql = await getSql();
  const key = `vid:${slot}`;
  await sql`
    insert into page_copy (page, key, value) values (${page}, ${key}, ${url})
    on conflict (page, key) do update set value = excluded.value
  `;
  return { url };
}
