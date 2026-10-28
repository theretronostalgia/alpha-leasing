import { createFileRoute } from "@tanstack/react-router";
import { StoreExperience } from "@/components/store-experience";
import { useDomEdits } from "@/lib/use-page-copy";

export const Route = createFileRoute("/store")({ component: StorePage });

export function StorePage() {
  const editRoot = useDomEdits("store");
  return (
    <main ref={editRoot}>
      <StoreExperience />
    </main>
  );
}
