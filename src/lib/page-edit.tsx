import { createContext, useContext, useRef, type ReactNode } from "react";
import { savePageField, savePageImage, savePageVideo } from "@/lib/access.functions";

type PageEdit = {
  page: string;
  fields: Record<string, string>;
  images: Record<string, Record<string, string>>;
  texts: Record<string, Record<string, string>>;
  replaceImage: (page: string, slot: string, file: File) => void;
  replaceVideo: (page: string, slot: string, file: File) => void;
};

const PageEditContext = createContext<PageEdit | null>(null);

export function usePageEdit() {
  return useContext(PageEditContext);
}

export function PageEditProvider({
  page,
  fields,
  images,
  texts,
  onImage,
  onText,
  onError,
  children,
}: {
  page: string;
  fields: Record<string, string>;
  images: Record<string, Record<string, string>>;
  texts: Record<string, Record<string, string>>;
  onImage: (page: string, slot: string, url: string) => void;
  onText: (page: string, key: string, value: string) => void;
  onError: (message: string) => void;
  children: ReactNode;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);
  const pending = useRef<{ page: string; slot: string } | null>(null);

  function replaceImage(target: string, slot: string, file: File) {
    void readFile(file)
      .then((image) => savePageImage({ data: { page: target, slot, image } }))
      .then((saved) => onImage(target, slot, saved.url))
      .catch((reason: unknown) => onError(reason instanceof Error ? reason.message : "Couldn’t replace that picture"));
  }

  function replaceVideo(target: string, slot: string, file: File) {
    void readFile(file)
      .then((video) => {
        if (video.startsWith("data:video/")) return video;
        const ext = file.name.split(".").pop()?.toLowerCase();
        const mime = ext === "webm" ? "video/webm" : ext === "mov" ? "video/quicktime" : "video/mp4";
        const comma = video.indexOf(",");
        return `data:${mime};base64,${comma >= 0 ? video.slice(comma + 1) : video}`;
      })
      .then((video) => savePageVideo({ data: { page: target, slot, video } }))
      .then((saved) => onText(target, `vid:${slot}`, saved.url))
      .catch((reason: unknown) => onError(reason instanceof Error ? reason.message : "Couldn’t replace that video"));
  }

  function onClick(event: React.MouseEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement;
    if (target.closest("input, textarea, select, [data-replace]")) return;
    const root = (target.closest("[data-edit-root]") as HTMLElement | null) ?? event.currentTarget;
    const leaf = textLeaf(target, root);
    if (leaf) {
      event.preventDefault();
      event.stopPropagation();
      beginText(leaf, root, page, fields, texts, onText, onError);
      return;
    }
    const video = target.closest("video");
    if (video instanceof HTMLVideoElement && video.dataset.editSlot && video.dataset.editPage) {
      event.preventDefault();
      event.stopPropagation();
      pending.current = { page: video.dataset.editPage, slot: video.dataset.editSlot };
      videoRef.current?.click();
      return;
    }
    const img = imageAt(target, event.clientX, event.clientY);
    if (!img?.dataset.editSlot || !img.dataset.editPage) return;
    event.preventDefault();
    event.stopPropagation();
    pending.current = { page: img.dataset.editPage, slot: img.dataset.editSlot };
    fileRef.current?.click();
  }

  return (
    <PageEditContext.Provider value={{ page, fields, images, texts, replaceImage, replaceVideo }}>
      <div data-editing-scope onClickCapture={onClick} className="[&_img]:cursor-pointer [&_video]:cursor-pointer">
        {children}
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          const choice = pending.current;
          if (file && choice) replaceImage(choice.page, choice.slot, file);
          event.target.value = "";
        }}
      />
      <input
        ref={videoRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          const choice = pending.current;
          if (file && choice) replaceVideo(choice.page, choice.slot, file);
          event.target.value = "";
        }}
      />
    </PageEditContext.Provider>
  );
}

function beginText(
  leaf: HTMLElement,
  root: HTMLElement,
  editorPage: string,
  fields: Record<string, string>,
  texts: Record<string, Record<string, string>>,
  onText: (page: string, key: string, value: string) => void,
  onError: (message: string) => void,
) {
  if (leaf.dataset.editing === "1") return;
  const original = leaf.innerText;
  leaf.contentEditable = "true";
  leaf.dataset.editing = "1";
  leaf.classList.add("outline", "outline-2", "outline-red");
  leaf.focus();
  const finish = () => {
    leaf.removeEventListener("blur", finish);
    leaf.removeEventListener("keydown", onKey);
    leaf.contentEditable = "false";
    delete leaf.dataset.editing;
    leaf.classList.remove("outline", "outline-2", "outline-red");
    const next = leaf.innerText.replace(/\s+/g, " ").trim();
    const before = original.replace(/\s+/g, " ").trim();
    if (!next || next === before) return;
    const fieldPage = leaf.dataset.fieldPage || (root.dataset.editRoot ?? editorPage);
    const field = leaf.dataset.field;
    const key = field || domKey(root, leaf);
    const known = { ...(fieldPage === editorPage ? fields : {}), ...texts[fieldPage] };
    const matched = field || Object.entries(known).find(([name, value]) => !name.startsWith("img:") && !name.startsWith("dom:") && value.trim() === before)?.[0];
    const saveKey = matched || key;
    void savePageField({ data: { page: fieldPage, key: saveKey, value: next } })
      .then(() => onText(fieldPage, saveKey, next))
      .catch((reason: unknown) => onError(reason instanceof Error ? reason.message : "Couldn’t save that text"));
  };
  const onKey = (event: KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      leaf.blur();
    }
  };
  leaf.addEventListener("blur", finish);
  leaf.addEventListener("keydown", onKey);
}

function textLeaf(start: HTMLElement, root: HTMLElement) {
  let el: HTMLElement | null = start;
  while (el && el !== root) {
    if (["INPUT", "TEXTAREA", "SELECT", "IMG", "SVG", "VIDEO", "SOURCE", "CANVAS"].includes(el.tagName)) return null;
    if (el.closest("svg")) return null;
    const kids = [...el.childNodes];
    const onlyText = kids.length > 0 && kids.every((node) => node.nodeType === Node.TEXT_NODE || (node instanceof HTMLElement && node.tagName === "BR"));
    if (onlyText && el.innerText.trim()) return el;
    el = el.parentElement;
  }
  return null;
}

function imageAt(target: HTMLElement, x: number, y: number) {
  const direct = target.closest("img");
  if (direct instanceof HTMLImageElement) return direct;
  const stacked = document.elementsFromPoint(x, y).find((node) => node instanceof HTMLImageElement && node.dataset.editSlot);
  return stacked instanceof HTMLImageElement ? stacked : null;
}

function domKey(root: HTMLElement, el: HTMLElement) {
  const parts: string[] = [];
  let node: HTMLElement | null = el;
  while (node && node !== root) {
    const parent: HTMLElement | null = node.parentElement;
    if (!parent) break;
    const index = Array.prototype.indexOf.call(parent.children, node) as number;
    parts.unshift(`${node.tagName}:${index}`);
    node = parent;
  }
  return `dom:${parts.join("/")}`;
}

function readFile(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Couldn’t read that picture"));
    reader.readAsDataURL(file);
  });
}

export function EditableImage({
  page,
  slot,
  src,
  alt,
  className,
  fill = false,
}: {
  page: string;
  slot: string;
  src: string;
  alt: string;
  className?: string;
  fill?: boolean;
}) {
  const edit = usePageEdit();
  const shown = edit?.images[page]?.[slot] || src;
  const img = <img src={shown} alt={alt} data-edit-page={page} data-edit-slot={slot} className={className} />;
  if (fill) return img;
  return <div className="relative">{img}</div>;
}

export function EditableVideo({
  page,
  slot,
  src,
  poster,
  className,
}: {
  page: string;
  slot: string;
  src: string;
  poster?: string;
  className?: string;
}) {
  const edit = usePageEdit();
  const inputRef = useRef<HTMLInputElement>(null);
  const shown = edit?.texts[page]?.[`vid:${slot}`] || src;
  return (
    <div className="relative">
      <video key={shown} className={className} autoPlay muted loop playsInline controls poster={poster} src={shown} />
      {edit ? (
        <>
          <button
            type="button"
            data-replace="video"
            className="absolute right-3 bottom-3 z-10 rounded-full bg-red px-3 py-1 text-xs font-semibold text-snow"
            onClick={() => inputRef.current?.click()}
          >
            Replace video
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) edit.replaceVideo(page, slot, file);
              event.target.value = "";
            }}
          />
        </>
      ) : null}
    </div>
  );
}
