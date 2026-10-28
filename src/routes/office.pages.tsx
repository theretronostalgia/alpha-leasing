import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { confirmPagePassword, getPageCopy, readPageCode, savePageCode, savePageCopy } from "@/lib/access.functions";
import { pageCatalog, pageDefaults } from "@/lib/page-copy";
import { About } from "@/routes/about";
import { ApplyPage } from "@/routes/apply";
import { LegalPage } from "@/routes/contact";
import { Home } from "@/routes/index";
import { QuotePage } from "@/routes/quote";
import { StorePage } from "@/routes/store";
import { PageEditProvider } from "@/lib/page-edit";

export const Route = createFileRoute("/office/pages")({ component: PagesEditor });

function PagesEditor() {
  const [slug, setSlug] = useState(pageCatalog[0]?.slug ?? "home");
  const [fields, setFields] = useState<Record<string, string>>(pageDefaults.home ?? {});
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [codeOpen, setCodeOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [unlocked, setUnlocked] = useState("");
  const [source, setSource] = useState("");
  const [filePath, setFilePath] = useState("");
  const [codeError, setCodeError] = useState("");
  const [codeSaved, setCodeSaved] = useState(false);
  const [visualOpen, setVisualOpen] = useState(false);
  const [visualPassword, setVisualPassword] = useState("");
  const [visualUnlocked, setVisualUnlocked] = useState("");
  const [visualError, setVisualError] = useState("");
  const [images, setImages] = useState<Record<string, Record<string, string>>>({});
  const [texts, setTexts] = useState<Record<string, Record<string, string>>>({});
  const page = pageCatalog.find((item) => item.slug === slug) ?? pageCatalog[0];

  useEffect(() => {
    setSaved(false);
    setCodeOpen(false);
    setUnlocked("");
    setPassword("");
    setSource("");
    setFilePath("");
    setCodeError("");
    setCodeSaved(false);
    setVisualOpen(false);
    setVisualPassword("");
    setVisualUnlocked("");
    setVisualError("");
    void getPageCopy({ data: { page: slug } })
      .then(setFields)
      .catch(() => setFields(pageDefaults[slug] ?? {}));
  }, [slug]);

  if (!page) return null;

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <p className="text-xs font-semibold tracking-widest text-red uppercase">Admin</p>
      <h1 className="font-display text-5xl tracking-wide">Pages</h1>
      <label className="mt-6 grid gap-1 text-sm">
        Page
        <select className="h-11 rounded-xl border border-line bg-paper px-3" value={slug} onChange={(event) => setSlug(event.target.value)}>
          {pageCatalog.map((item) => (
            <option key={item.slug} value={item.slug}>
              {item.label}
            </option>
          ))}
        </select>
      </label>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          className="h-11 rounded-full border border-red px-5 text-sm font-semibold"
          onClick={() => {
            setVisualOpen(false);
            setCodeOpen(true);
          }}
        >
          View Page Code
        </button>
        <button
          type="button"
          className="h-11 rounded-full border border-red px-5 text-sm font-semibold"
          onClick={() => {
            setCodeOpen(false);
            setVisualOpen(true);
          }}
        >
          Visual Editor
        </button>
      </div>
      {codeOpen ? (
        <div className="mt-4 rounded-3xl bg-card p-5 ring-1 ring-red/40">
          {unlocked !== slug ? (
            <form
              className="grid max-w-md gap-3"
              onSubmit={(event) => {
                event.preventDefault();
                setCodeError("");
                void readPageCode({ data: { page: slug, password } })
                  .then((file) => {
                    setSource(file.source);
                    setFilePath(file.path);
                    setUnlocked(slug);
                  })
                  .catch((reason: unknown) => setCodeError(reason instanceof Error ? reason.message : "Wrong password"));
              }}
            >
              <p className="text-sm text-steel">Enter your password before the page code opens. That keeps it from being changed by accident.</p>
              <label className="grid gap-1 text-sm">
                Password
                <input type="password" name="page-code-password" autoComplete="off" placeholder="Password" className="h-11 rounded-xl border border-line bg-card px-3 text-ink" value={password} onChange={(event) => setPassword(event.target.value)} required />
              </label>
              <button type="submit" className="h-11 w-fit rounded-full bg-red px-5 text-sm font-semibold text-snow">
                Unlock Code
              </button>
            </form>
          ) : (
            <form
              className="grid gap-3"
              onSubmit={(event) => {
                event.preventDefault();
                setCodeError("");
                setCodeSaved(false);
                void savePageCode({ data: { page: slug, password, source } })
                  .then(() => setCodeSaved(true))
                  .catch((reason: unknown) => setCodeError(reason instanceof Error ? reason.message : "Couldn’t save that code"));
              }}
            >
              <p className="text-xs tracking-wide text-red uppercase">{filePath}</p>
              <textarea className="min-h-96 rounded-xl border border-line bg-paper px-3 py-2 font-mono text-xs" value={source} onChange={(event) => setSource(event.target.value)} spellCheck={false} />
              <div className="flex gap-2">
                <button type="submit" className="h-11 rounded-full bg-red px-5 text-sm font-semibold text-snow">
                  Save Code
                </button>
                <button
                  type="button"
                  className="h-11 rounded-full border border-line px-5 text-sm"
                  onClick={() => {
                    setCodeOpen(false);
                    setUnlocked("");
                    setPassword("");
                    setSource("");
                  }}
                >
                  Close
                </button>
              </div>
              {codeSaved ? <p className="text-sm text-steel">Code saved.</p> : null}
            </form>
          )}
          {codeError ? <p className="mt-3 text-sm text-red">{codeError}</p> : null}
        </div>
      ) : null}
      {visualOpen ? (
        <div className="mt-4 rounded-3xl bg-card p-5 ring-1 ring-red/40">
          {visualUnlocked !== slug ? (
            <form
              className="grid max-w-md gap-3"
              onSubmit={(event) => {
                event.preventDefault();
                setVisualError("");
                void confirmPagePassword({ data: { password: visualPassword } })
                  .then(() => setVisualUnlocked(slug))
                  .catch((reason: unknown) => setVisualError(reason instanceof Error ? reason.message : "Wrong password"));
              }}
            >
              <p className="text-sm text-steel">Enter your password before the visual editor opens. That keeps the page from being changed by accident.</p>
              <label className="grid gap-1 text-sm">
                Password
                <input type="password" name="visual-editor-password" autoComplete="off" placeholder="Password" className="h-11 rounded-xl border border-line bg-card px-3 text-ink" value={visualPassword} onChange={(event) => setVisualPassword(event.target.value)} required />
              </label>
              <button type="submit" className="h-11 w-fit rounded-full bg-red px-5 text-sm font-semibold text-snow">
                Unlock Editor
              </button>
            </form>
          ) : (
            <div>
              <p className="mb-3 text-sm text-steel">Click any words to change them. Click a picture or the video to replace it. Press Enter when the words are done.</p>
              <div className="overflow-hidden rounded-3xl bg-paper ring-1 ring-line">
                <PageEditProvider
                  page={slug}
                  fields={fields}
                  images={images}
                  texts={texts}
                  password={visualPassword}
                  onImage={(target, slot, url) => setImages((current) => ({ ...current, [target]: { ...current[target], [slot]: url } }))}
                  onText={(target, key, value) => {
                    setTexts((current) => ({ ...current, [target]: { ...current[target], [key]: value } }));
                    if (target === slug && !key.startsWith("dom:")) setFields((current) => ({ ...current, [key]: value }));
                  }}
                  onError={setVisualError}
                >
                  {slug === "home" ? <Home /> : null}
                  {slug === "about" ? <About /> : null}
                  {slug === "contact" ? <LegalPage /> : null}
                  {slug === "drive" ? <ApplyPage /> : null}
                  {slug === "quote" ? <QuotePage /> : null}
                  {slug === "store" ? <StorePage /> : null}
                </PageEditProvider>
              </div>
              <button
                type="button"
                className="mt-4 h-11 rounded-full border border-line px-5 text-sm"
                onClick={() => {
                  setVisualOpen(false);
                  setVisualUnlocked("");
                  setVisualPassword("");
                }}
              >
                Close
              </button>
            </div>
          )}
          {visualError ? <p className="mt-3 text-sm text-red">{visualError}</p> : null}
        </div>
      ) : null}
      <h2 className="mt-10 font-display text-4xl tracking-wide">Quick Edit</h2>
      <form
        className="mt-4 grid gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          setError("");
          setSaved(false);
          void savePageCopy({ data: { page: slug, fields } })
            .then(() => setSaved(true))
            .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Couldn’t save that page"));
        }}
      >
        {page.fields.map((field) => (
          <label key={field.key} className="grid gap-1 text-sm">
            {field.label}
            {field.multiline ? (
              <textarea className="min-h-28 rounded-xl border border-line bg-paper px-3 py-2" value={fields[field.key] ?? ""} onChange={(event) => setFields({ ...fields, [field.key]: event.target.value })} />
            ) : (
              <input className="h-11 rounded-xl border border-line bg-paper px-3" value={fields[field.key] ?? ""} onChange={(event) => setFields({ ...fields, [field.key]: event.target.value })} />
            )}
          </label>
        ))}
        <button type="submit" className="h-11 w-fit rounded-full bg-red px-5 text-sm font-semibold text-snow">
          Save Page
        </button>
        {saved ? <p className="text-sm text-steel">Saved.</p> : null}
        {error ? <p className="text-sm text-red">{error}</p> : null}
      </form>
    </main>
  );
}

