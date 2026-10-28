import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { getPageCopy } from "@/lib/access.functions";
import { pageDefaults } from "@/lib/page-copy";
import { usePageEdit } from "@/lib/page-edit";

export function usePageCopy(page: string) {
  const edit = usePageEdit();
  const [copy, setCopy] = useState<Record<string, string>>(pageDefaults[page] ?? {});
  useEffect(() => {
    void getPageCopy({ data: { page } })
      .then(setCopy)
      .catch(() => setCopy(pageDefaults[page] ?? {}));
  }, [page]);
  const base = edit?.page === page ? { ...copy, ...(pageDefaults[page] ?? {}), ...edit.fields } : copy;
  const images = edit?.images[page];
  const texts = edit?.texts[page];
  const next = { ...base };
  if (images) {
    for (const [slot, url] of Object.entries(images)) next[`img:${slot}`] = url;
  }
  if (texts) Object.assign(next, texts);
  return next;
}

export function useDomEdits(page: string) {
  const copy = usePageCopy(page);
  const copyRef = useRef(copy);
  copyRef.current = copy;
  const doms = Object.entries(copy)
    .filter(([key]) => key.startsWith("dom:"))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");
  useLayoutEffect(() => {
    document.querySelectorAll<HTMLElement>(`[data-edit-root="${page}"]`).forEach((root) => {
      for (const [key, value] of Object.entries(copyRef.current)) {
        if (!key.startsWith("dom:")) continue;
        const el = elementAt(root, key.slice(4));
        if (el && el.dataset.editing !== "1" && el.innerText !== value && el.querySelector("*") == null) el.innerText = value;
      }
    });
  }, [page, doms]);
  return (node: HTMLElement | null) => {
    if (node) node.dataset.editRoot = page;
  };
}

function elementAt(root: HTMLElement, path: string) {
  let node: HTMLElement = root;
  for (const part of path.split("/")) {
    const [tag, indexText] = part.split(":");
    const next = node.children[Number(indexText)];
    if (!(next instanceof HTMLElement) || next.tagName !== tag) return null;
    node = next;
  }
  return node;
}
