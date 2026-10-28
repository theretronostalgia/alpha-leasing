import { createServerFn } from "@tanstack/react-start";

/** Test-only sign-in. Opens the seeded employee session with no typed password. */
export const signInTestAccount = createServerFn({ method: "POST" }).handler(async () => {
  const { auth } = await import("./server");
  const { seedTestEmployee, TEST_EMPLOYEE_EMAIL } = await import("./seed-test-user.server");
  await seedTestEmployee(auth);
  const result = await auth.api.signInEmail({
    body: { email: TEST_EMPLOYEE_EMAIL, password: "654321" },
  });
  if (!result?.token) throw new Error("Couldn’t open the test account");
  return { token: result.token };
});
