import type { auth as Auth } from "./server";

export const TEST_EMPLOYEE_ID = "123456";
export const TEST_EMPLOYEE_EMAIL = "123456@staff.alphaleasing.test";

export async function seedTestEmployee(appAuth: typeof Auth) {
  try {
    await appAuth.api.signUpEmail({
      body: {
        email: TEST_EMPLOYEE_EMAIL,
        password: "654321",
        name: "Test Employee",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (!/exist/i.test(message)) {
      console.error("Test employee seed failed", error);
    }
  }
  try {
    const { ensureDbReady, getSql } = await import("../db");
    await ensureDbReady();
    const sql = await getSql();
    const rows = await sql<{ id: string }>`select id from "user" where email = ${TEST_EMPLOYEE_EMAIL} limit 1`;
    const id = rows[0]?.id;
    if (!id) return;
    await sql`
      insert into profiles (user_id, employee_number, role)
      values (${id}, ${TEST_EMPLOYEE_ID}, 'admin')
      on conflict (user_id) do update set role = 'admin', employee_number = excluded.employee_number
    `;
  } catch (error) {
    console.error("Test profile seed failed", error);
  }
}
