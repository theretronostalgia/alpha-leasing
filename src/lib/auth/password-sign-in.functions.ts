import { createServerFn } from "@tanstack/react-start";

/** Sign in with an employee ID and password without the browser origin check. */
export const signInWithPassword = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const data = input as { employeeId?: unknown; password?: unknown };
    const id = typeof data.employeeId === "string" ? data.employeeId.trim() : "";
    const password = typeof data.password === "string" ? data.password : "";
    if (!id || password.length < 6) throw new Error("Enter your employee ID and password.");
    const email = id.includes("@") ? id : `${id}@staff.alphaleasing.test`;
    return { email, password };
  })
  .handler(async ({ data }) => {
    const { auth } = await import("./server");
    const { seedTestEmployee } = await import("./seed-test-user.server");
    await seedTestEmployee(auth);
    try {
      const result = await auth.api.signInEmail({
        body: { email: data.email, password: data.password },
      });
      if (!result?.token) throw new Error("Couldn’t sign in.");
      return { token: result.token };
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (/invalid email or password|invalid credentials/i.test(message)) {
        throw new Error("That employee ID or password isn’t right.");
      }
      if (message && message !== "Couldn’t sign in.") throw new Error(message);
      throw new Error("That employee ID or password isn’t right.");
    }
  });
