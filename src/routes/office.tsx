import { Outlet, createFileRoute } from "@tanstack/react-router";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { OFFICE_PERMISSIONS } from "@/lib/access";
import { useAccess } from "@/lib/use-access";

export const Route = createFileRoute("/office")({ component: OfficeLayout });

function OfficeLayout() {
  const { user, isPending, permissions } = useAccess();
  if (isPending || (user && permissions === null)) {
    return <main className="mx-auto max-w-6xl px-4 py-12"><div className="h-40 animate-pulse rounded-3xl bg-line" /></main>;
  }
  if (!user) return <RedirectToSignIn />;
  if (!permissions?.some((key) => OFFICE_PERMISSIONS.includes(key))) {
    return (
      <main className="mx-auto max-w-xl px-4 py-16">
        <h1 className="font-display text-5xl tracking-wide">No Office Access</h1>
        <p className="mt-3 text-sm text-steel">This account can sign in and use the store. It can’t change the office.</p>
      </main>
    );
  }
  return <Outlet />;
}
