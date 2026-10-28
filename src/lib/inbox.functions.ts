import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export type InboxRow = {
  id: number;
  title: string;
  subtitle: string;
  status: string;
  createdAt: string;
  detail: JsonValue;
};

async function allow(userId: string, permission: "applications.view" | "quotes.view" | "orders.view" | "positions.manage") {
  const { requirePermission } = await import("@/lib/access.server");
  await requirePermission(userId, permission);
}

function asRecord(input: unknown): Record<string, unknown> {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Invalid request");
  }
  return input as Record<string, unknown>;
}

function need(data: Record<string, unknown>, key: string): string {
  const value = data[key];
  if (typeof value !== "string" || !value.trim()) throw new Error(`Missing ${key}`);
  return value.trim();
}

export const submitApplication = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const data = asRecord(input);
    const first = need(data, "firstName");
    const last = need(data, "lastName");
    const email = need(data, "email");
    const phone = need(data, "phone");
    const position = need(data, "position");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Enter a real email");
    return { first, last, email, phone, position, payload: data };
  })
  .handler(async ({ data }) => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const name = `${data.first} ${data.last}`;
    const rows = await sql<{ id: number }>`
      insert into applications (applicant_name, email, phone, position, payload)
      values (${name}, ${data.email}, ${data.phone}, ${data.position}, ${JSON.stringify(data.payload)})
      returning id
    `;
    return { id: Number(rows[0]?.id ?? 0) };
  });

export const submitQuote = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const data = asRecord(input);
    return {
      contactName: need(data, "contactName"),
      company: typeof data.company === "string" ? data.company.trim() : "",
      email: need(data, "email"),
      phone: need(data, "phone"),
      origin: need(data, "origin"),
      destination: need(data, "destination"),
      freight: need(data, "freight"),
      weight: need(data, "weight"),
      equipment: need(data, "equipment"),
      pickupDate: need(data, "pickupDate"),
      deliveryDate: need(data, "deliveryDate"),
      notes: typeof data.notes === "string" ? data.notes.trim() : "",
    };
  })
  .handler(async ({ data }) => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const rows = await sql<{ id: number }>`
      insert into rate_quotes (
        contact_name, company, email, phone, origin, destination, freight, weight, equipment, pickup_date, delivery_date, notes
      ) values (
        ${data.contactName}, ${data.company}, ${data.email}, ${data.phone}, ${data.origin}, ${data.destination},
        ${data.freight}, ${data.weight}, ${data.equipment}, ${data.pickupDate}, ${data.deliveryDate}, ${data.notes}
      )
      returning id
    `;
    return { id: Number(rows[0]?.id ?? 0) };
  });

export const submitOrder = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => {
    const data = asRecord(input);
    const note = typeof data.note === "string" ? data.note.trim() : "";
    if (!Array.isArray(data.items) || data.items.length === 0) throw new Error("Your request is empty");
    const items = data.items.map((item) => {
      const row = asRecord(item);
      const qty = Number(row.qty);
      if (!Number.isFinite(qty) || qty < 1 || qty > 12) throw new Error("Check the quantity");
      return {
        productId: need(row, "productId"),
        name: need(row, "name"),
        size: need(row, "size"),
        qty,
        price: Number(row.price) || 0,
      };
    });
    return { note, items };
  })
  .handler(async ({ data, context }) => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const users = await sql<{ email: string; name: string }>`
      select email, name from "user" where id = ${context.userId} limit 1
    `;
    const email = users[0]?.email ?? "";
    const driverName = users[0]?.name || email || "Driver";
    const rows = await sql<{ id: number }>`
      insert into store_orders (user_id, email, driver_name, items, note)
      values (${context.userId}, ${email}, ${driverName}, ${JSON.stringify(data.items)}, ${data.note})
      returning id
    `;
    return { id: Number(rows[0]?.id ?? 0) };
  });

export const listInbox = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { permissionsFor } = await import("@/lib/access.server");
    const permissions = await permissionsFor(context.userId);
    if (!permissions.some((key) => key === "applications.view" || key === "quotes.view" || key === "orders.view")) {
      throw new Error("Not allowed");
    }
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const applications = await sql<{
      id: number;
      applicant_name: string;
      email: string;
      phone: string;
      position: string;
      status: string;
      created_at: string;
      payload: string;
    }>`select id, applicant_name, email, phone, position, status, created_at::text as created_at, payload
      from applications order by id desc limit 100`;
    const quotes = await sql<{
      id: number;
      contact_name: string;
      company: string;
      email: string;
      phone: string;
      origin: string;
      destination: string;
      freight: string;
      weight: string;
      equipment: string;
      pickup_date: string;
      delivery_date: string;
      notes: string;
      status: string;
      created_at: string;
    }>`select id, contact_name, company, email, phone, origin, destination, freight, weight, equipment, pickup_date, delivery_date, notes, status, created_at::text as created_at
      from rate_quotes order by id desc limit 100`;
    const orders = await sql<{
      id: number;
      email: string;
      driver_name: string;
      items: string;
      note: string;
      status: string;
      created_at: string;
    }>`select id, email, driver_name, items, note, status, created_at::text as created_at
      from store_orders order by id desc limit 100`;

    const parse = (raw: string): JsonValue => {
      try {
        return JSON.parse(raw) as JsonValue;
      } catch {
        return raw;
      }
    };

    const applicationsOut: InboxRow[] = applications.map((row) => ({
      id: Number(row.id),
      title: row.applicant_name,
      subtitle: `${row.position} · ${row.phone}`,
      status: row.status,
      createdAt: String(row.created_at),
      detail: {
        email: row.email,
        phone: row.phone,
        position: row.position,
        payload: parse(row.payload),
      },
    }));
    const quotesOut: InboxRow[] = quotes.map((row) => ({
      id: Number(row.id),
      title: row.contact_name,
      subtitle: `${row.origin} → ${row.destination}`,
      status: row.status,
      createdAt: String(row.created_at),
      detail: {
        company: row.company,
        email: row.email,
        phone: row.phone,
        origin: row.origin,
        destination: row.destination,
        freight: row.freight,
        weight: row.weight,
        equipment: row.equipment,
        pickupDate: row.pickup_date,
        deliveryDate: row.delivery_date,
        notes: row.notes,
      },
    }));
    const ordersOut: InboxRow[] = orders.map((row) => ({
      id: Number(row.id),
      title: row.driver_name,
      subtitle: row.email,
      status: row.status,
      createdAt: String(row.created_at),
      detail: { note: row.note, items: parse(row.items) },
    }));

    return {
      applications: permissions.includes("applications.view") ? applicationsOut : [],
      quotes: permissions.includes("quotes.view") ? quotesOut : [],
      orders: permissions.includes("orders.view") ? ordersOut : [],
    };
  });

const statuses = new Set(["new", "reviewing", "quoted", "hired", "rejected", "closed", "requested", "ready", "picked-up", "cancelled"]);

export const setInboxStatus = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => {
    const data = asRecord(input);
    const kind = need(data, "kind");
    const status = need(data, "status");
    const id = Number(data.id);
    if (!["application", "quote", "order"].includes(kind)) throw new Error("Unknown record");
    if (!statuses.has(status) || !Number.isFinite(id)) throw new Error("Invalid update");
    return { kind, status, id };
  })
  .handler(async ({ data, context }) => {
    const permission = data.kind === "application" ? "applications.view" : data.kind === "quote" ? "quotes.view" : "orders.view";
    await allow(context.userId, permission);
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    if (data.kind === "application") {
      await sql`update applications set status = ${data.status} where id = ${data.id}`;
    } else if (data.kind === "quote") {
      await sql`update rate_quotes set status = ${data.status} where id = ${data.id}`;
    } else {
      await sql`update store_orders set status = ${data.status} where id = ${data.id}`;
    }
    return { ok: true };
  });

export type Opening = {
  id: number;
  listing: string;
  category: "driver" | "staff" | "tech";
  title: string;
  detail: string;
};

const groups = new Set(["driver", "staff", "tech"]);

export const listPositions = createServerFn({ method: "GET" }).handler(async () => {
  const { getSql } = await import("@/lib/db");
  const sql = await getSql();
  const rows = await sql<{ id: number; listing: string; category: string; title: string; detail: string }>`
    select id, listing, category, title, detail from positions
    order by
      case category when 'driver' then 0 when 'staff' then 1 else 2 end,
      id asc
  `;
  return rows.map((row) => ({
    id: Number(row.id),
    listing: row.listing,
    category: (groups.has(row.category) ? row.category : "driver") as Opening["category"],
    title: row.title,
    detail: row.detail,
  })) satisfies Opening[];
});

function randomListing() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 4; i += 1) code += alphabet[Math.floor(Math.random() * alphabet.length)];
  return `AL-${code}`;
}

export const createPosition = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => {
    const data = asRecord(input);
    const title = need(data, "title");
    const category = need(data, "category");
    const detail = typeof data.detail === "string" ? data.detail.trim() : "";
    if (!groups.has(category)) throw new Error("Pick an opportunity");
    if (title.length > 120) throw new Error("Opening is too long");
    return { title, detail, category: category as Opening["category"] };
  })
  .handler(async ({ data, context }) => {
    await allow(context.userId, "positions.manage");
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    for (let attempt = 0; attempt < 8; attempt += 1) {
      const listing = randomListing();
      try {
        const rows = await sql<{ id: number; listing: string }>`
          insert into positions (listing, category, title, detail)
          values (${listing}, ${data.category}, ${data.title}, ${data.detail})
          returning id, listing
        `;
        return { id: Number(rows[0]?.id ?? 0), listing: rows[0]?.listing ?? listing };
      } catch (error) {
        const code = error && typeof error === "object" && "code" in error ? String(error.code) : "";
        if (code === "23505" && attempt < 7) continue;
        throw error;
      }
    }
    throw new Error("Couldn’t assign a listing ID");
  });

export const removePosition = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => {
    const data = asRecord(input);
    const id = Number(data.id);
    if (!Number.isFinite(id)) throw new Error("Invalid position");
    return { id };
  })
  .handler(async ({ data, context }) => {
    await allow(context.userId, "positions.manage");
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    await sql`delete from positions where id = ${data.id}`;
    return { ok: true };
  });
