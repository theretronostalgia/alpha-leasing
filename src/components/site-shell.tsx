import { useState, type FormEvent, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, X, Facebook, Instagram, Youtube } from "lucide-react";
import { authClient, rememberSessionToken, signOut } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { myAccess } from "@/lib/access.functions";
import { company } from "@/lib/company";
import { type Permission } from "@/lib/access";
import { useAccess } from "@/lib/use-access";

const links = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/apply", label: "Drive" },
  { to: "/quote", label: "Rate Quote" },
  { to: "/contact", label: "Contact" },
  { to: "/store", label: "Store" },
] as const;

const officeLinks: { to: "/office" | "/office/applications" | "/office/quotes" | "/office/orders" | "/office/positions" | "/office/users" | "/office/roles" | "/office/pages"; label: string; exact: boolean; permission?: Permission }[] = [
  { to: "/office", label: "Office", exact: true },
  { to: "/office/applications", label: "Applications", exact: false, permission: "applications.view" },
  { to: "/office/quotes", label: "Rate Quotes", exact: false, permission: "quotes.view" },
  { to: "/office/orders", label: "Store Orders", exact: false, permission: "orders.view" },
  { to: "/office/positions", label: "Positions", exact: false, permission: "positions.manage" },
  { to: "/office/users", label: "Users", exact: false, permission: "users.manage" },
  { to: "/office/roles", label: "Roles", exact: false, permission: "roles.manage" },
  { to: "/office/pages", label: "Pages", exact: false, permission: "pages.edit" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { user } = useCurrentUserState();
  const { permissions } = useAccess();
  const signedIn = Boolean(user);
  const office = officeLinks.filter((link) => !link.permission || permissions?.includes(link.permission));

  return (
    <header className="sticky top-0 z-40 border-b-2 border-red bg-paper/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-2">
        <Link to="/" className="flex shrink-0 items-center" onClick={() => setOpen(false)}>
          <img src="/media/logo-header.png?v=2" alt="Alpha Leasing" className="h-16 w-auto md:h-[4.5rem]" />
        </Link>

        <div className={signedIn ? "hidden min-w-0 md:block" : "ml-auto hidden md:block"}>
          <nav className="flex items-center gap-6">
            {links.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className="text-sm font-medium tracking-wide"
                activeProps={{ className: "text-red" }}
                inactiveProps={{ className: "text-snow hover:text-red" }}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          {signedIn && office.length > 0 ? (
            <nav className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-1 border-t border-red/70 pt-2">
              {office.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-sm font-medium tracking-wide"
                  activeOptions={{ exact: link.exact }}
                  activeProps={{ className: "text-red" }}
                  inactiveProps={{ className: "text-snow hover:text-red" }}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          ) : null}
        </div>

        <div className="ml-auto hidden items-center md:flex">
          <SignInBubbles />
        </div>

        <button
          type="button"
          className="ml-auto grid h-11 w-11 place-items-center rounded-full border border-line md:hidden"
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-line px-4 py-4 md:hidden">
          <div className="flex flex-col gap-1">
            {links.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className="rounded-lg px-3 py-3 text-lg font-display tracking-wide"
                activeProps={{ className: "text-red" }}
                inactiveProps={{ className: "text-snow" }}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
          {signedIn && office.length > 0 ? (
            <div className="mt-2 flex flex-col gap-1 border-t border-red/70 pt-2">
              {office.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="rounded-lg px-3 py-2 text-base tracking-wide"
                  activeOptions={{ exact: link.exact }}
                  activeProps={{ className: "text-red" }}
                  inactiveProps={{ className: "text-snow" }}
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          ) : null}
          <div className="mt-3 border-t border-line pt-3">
            <SignInBubbles stacked />
          </div>
        </div>
      ) : null}
    </header>
  );
}

export function SignInBubbles({ stacked = false }: { stacked?: boolean }) {
  const navigate = useNavigate();
  const { user, isPending } = useCurrentUserState();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  if (isPending) return <div className={stacked ? "h-14" : "h-11 w-28"} />;
  if (user) {
    return (
      <div className={stacked ? "grid gap-2" : "grid justify-items-end gap-1"}>
        <button
          type="button"
          disabled={signingOut}
          onClick={() => {
            setSigningOut(true);
            setError("");
            void signOut().catch((reason: unknown) => {
              setSigningOut(false);
              setError(reason instanceof Error ? reason.message : "Couldn’t sign out.");
            });
          }}
          className={stacked ? "h-14 rounded-full bg-red text-base font-semibold text-snow disabled:opacity-60" : "h-11 rounded-full bg-red px-5 text-sm font-semibold text-snow disabled:opacity-60"}
        >
          {signingOut ? "…" : "Sign Out"}
        </button>
        {error ? <p className="text-xs text-red">{error}</p> : null}
      </div>
    );
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("Use at least 6 characters.");
      return;
    }
    setBusy(true);
    const id = email.trim();
    const account = id.includes("@") ? id : `${id}@staff.alphaleasing.test`;
    try {
      const result = await authClient.signIn.email({ email: account, password });
      if (result.error) {
        const message = result.error.message || "";
        setError(/invalid email or password/i.test(message) ? "That employee ID or password isn’t right." : message || "Couldn’t sign in.");
        return;
      }
      rememberSessionToken(result.data?.token ?? null);
      const access = await myAccess().catch(() => ({ permissions: [] as string[] }));
      if (access.permissions.length) void navigate({ to: "/office" });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Couldn’t sign in.");
    } finally {
      setBusy(false);
    }
  }

  const field = stacked
    ? "h-14 w-full rounded-full border border-red/70 bg-card px-6 text-center text-base outline-none placeholder:text-center placeholder:text-steel focus:border-red"
    : "h-11 w-36 rounded-full border border-red/70 bg-card px-4 text-center text-sm outline-none placeholder:text-center placeholder:text-steel focus:border-red xl:w-44";

  return (
    <form onSubmit={(event) => void onSubmit(event)} className={stacked ? "grid gap-3" : "flex flex-wrap items-center justify-end gap-2"}>
      <input
        aria-label="Employee ID"
        placeholder="Employee ID"
        type="text"
        autoComplete="username"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        className={field}
      />
      <input
        aria-label="Password"
        placeholder="Password"
        type="password"
        autoComplete="current-password"
        required
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        className={field}
      />
      <button
        type="submit"
        disabled={busy}
        className={stacked ? "h-14 rounded-full bg-red text-base font-semibold text-snow disabled:opacity-60" : "h-11 rounded-full bg-red px-5 text-sm font-semibold text-snow disabled:opacity-60"}
      >
        {busy ? "…" : "Sign in"}
      </button>
      {error ? <p className={stacked ? "text-center text-sm text-red" : "basis-full text-right text-xs text-red"}>{error}</p> : null}
    </form>
  );
}

export function SiteFooter() {
  const [soon, setSoon] = useState(false);
  return (
    <footer className="border-t-4 border-red bg-black text-snow">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="flex items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <Social label="Facebook" onClick={() => setSoon(true)}>
                <Facebook size={16} />
              </Social>
              <Social label="Instagram" onClick={() => setSoon(true)}>
                <Instagram size={16} />
              </Social>
              <Social label="TikTok" onClick={() => setSoon(true)}>
                <TikTokIcon />
              </Social>
              <Social label="YouTube" onClick={() => setSoon(true)}>
                <Youtube size={16} />
              </Social>
            </div>
            <p className={`mt-2 text-xs tracking-wide text-red ${soon ? "" : "invisible"}`}>Coming soon.</p>
          </div>
          <img src="/media/logo-footer.png" alt="Alpha Leasing" className="h-20 w-auto" />
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-red/35 bg-card p-4">
            <p className="text-[11px] font-semibold tracking-[0.22em] text-red uppercase">Office</p>
            <a
              href="https://maps.google.com/?q=2701+S+Coliseum+Blvd+Suite+1320+Fort+Wayne+IN+46803"
              target="_blank"
              rel="noreferrer"
              className="mt-2 block hover:text-red"
            >
              <p className="font-display text-xl tracking-wide">Fort Wayne Shop</p>
              <p className="mt-1 text-sm leading-5 text-snow/80">
                {company.street}
                <br />
                {company.suite}
                <br />
                {company.city}, {company.state} {company.zip}
              </p>
            </a>
            <p className="mt-3 border-t border-red/20 pt-2 text-sm text-snow/70">{company.hours}</p>
          </div>
          <div className="rounded-2xl border border-red/35 bg-card p-4">
            <p className="text-[11px] font-semibold tracking-[0.22em] text-red uppercase">Reach us</p>
            <ul className="mt-2 divide-y divide-red/15 text-sm">
              <li className="flex items-baseline justify-between gap-4 py-1.5">
                <span className="text-snow/50">Phone</span>
                <a className="font-medium hover:text-red" href={`tel:${company.phoneTel}`}>
                  {company.phone}
                </a>
              </li>
              <li className="flex items-baseline justify-between gap-4 py-1.5">
                <span className="text-snow/50">Fax</span>
                <span>{company.fax}</span>
              </li>
              <li className="flex items-baseline justify-between gap-4 py-1.5">
                <span className="text-snow/50">Email</span>
                <a className="truncate font-medium hover:text-red" href={`mailto:${company.email}`}>
                  {company.email}
                </a>
              </li>
            </ul>
            <p className="mt-2 border-t border-red/20 pt-2 text-xs tracking-wide text-snow/50">
              USDOT {company.usdot} · MC {company.mc}
            </p>
          </div>
        </div>

        <p className="mt-5 flex items-center justify-center gap-4 text-center text-sm tracking-wide text-snow/80">
          <span className="h-px w-10 bg-red sm:w-16" />
          <span className="whitespace-nowrap">Hauling Midwest Freight Since {company.since}.</span>
          <span className="h-px w-10 bg-red sm:w-16" />
        </p>

        <nav className="mt-5 flex flex-wrap items-center justify-center gap-1 rounded-full border border-red/40 bg-card px-2 py-1">
          {links.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className="rounded-full px-3 py-1.5 text-sm font-semibold tracking-wide hover:bg-red hover:text-snow"
              activeProps={{ className: "text-red" }}
              inactiveProps={{ className: "text-snow/85" }}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="border-t border-red/20 px-4 py-3 text-center text-xs tracking-wide text-snow/50">
        © {new Date().getFullYear()} Alpha Leasing, LLC. Fort Wayne, Indiana.
      </div>
    </footer>
  );
}

function Social({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={`${label}, coming soon`}
      onClick={onClick}
      className="grid h-9 w-9 place-items-center rounded-full border border-red/70 text-snow transition hover:bg-red"
    >
      {children}
    </button>
  );
}

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="currentColor">
      <path d="M14.5 3c.4 2.4 1.7 4.1 4 4.5v2.4c-1.4 0-2.7-.4-4-1.2v6.6a5.8 5.8 0 1 1-5.8-5.8c.3 0 .6 0 .9.1v2.6a3.2 3.2 0 1 0 2.3 3.1V3h2.6Z" />
    </svg>
  );
}
