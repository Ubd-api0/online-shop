import { revalidatePath } from "next/cache";

// Public pages (home, about, best-selling, events, contact and the shared
// header categories) are pre-rendered and refreshed every 60s (ISR — see
// `export const revalidate` on those pages). Call this after the owner
// changes catalogue/store content so the change shows up immediately instead.
export function refreshStorefront() {
  try {
    revalidatePath("/", "layout");
  } catch (err) {
    // outside a request (scripts, tests) there's nothing to revalidate
    console.warn("[revalidate] skipped:", err.message);
  }
}
