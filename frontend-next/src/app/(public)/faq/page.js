import { FaqAccordion } from "@/components/legal/faq-accordion";

export const metadata = { title: "FAQ" };

export default function FAQPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 800px:px-6">
      <h1 className="mb-8 text-3xl font-bold text-content">FAQ</h1>
      <FaqAccordion />
    </div>
  );
}
