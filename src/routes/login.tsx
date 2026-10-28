import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SignInBubbles } from "@/components/site-shell";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { isStaffEmail } from "@/lib/staff";

type LoginSearch = { as: "driver" | "staff"; next: "/" | "/office" | "/store" | "/apply" };

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>): LoginSearch => {
    const next = search.next === "/office" || search.next === "/store" || search.next === "/apply" ? search.next : "/";
    return { as: search.as === "staff" ? "staff" : "driver", next };
  },
  component: LoginPage,
});

function LoginPage() {
  const { as, next } = Route.useSearch();
  const navigate = useNavigate();
  const { user, isPending } = useCurrentUserState();
  const staffMismatch = Boolean(user && as === "staff" && !isStaffEmail(user.primaryEmail));

  useEffect(() => {
    if (isPending || !user || staffMismatch) return;
    void navigate({ to: next });
  }, [isPending, user, staffMismatch, navigate, next]);

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-sm items-center px-4 py-16">
      {staffMismatch ? (
        <p className="rounded-full bg-card px-6 py-4 text-center text-sm ring-1 ring-red/50">
          This office sign-in is only for Alpha Leasing staff addresses.
        </p>
      ) : (
        <SignInBubbles stacked />
      )}
    </main>
  );
}
