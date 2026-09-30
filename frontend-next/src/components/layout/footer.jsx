import Link from "next/link";
import appConfig from "@/config/appConfig";
import { footerShopLinks, footerCompanyLinks, footerLegalLinks } from "@/config/nav";

function LinkList({ title, items }) {
  return (
    <div>
      <h3 className="mb-3 font-semibold text-white">{title}</h3>
      <ul className="space-y-2">
        {items.map((l) => (
          <li key={l.name}>
            <Link href={l.link} className="text-sm text-gray-400 transition hover:text-white">
              {l.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-neutral-800 bg-neutral-900 px-4 py-10 text-white">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <h2 className="mb-2 font-display text-lg font-bold">{appConfig.name}</h2>
          <p className="text-sm text-gray-400">{appConfig.tagline}</p>
        </div>
        <LinkList title="Shop" items={footerShopLinks} />
        <LinkList title="Company" items={footerCompanyLinks} />
        <LinkList title="Legal" items={footerLegalLinks} />
      </div>
      <div className="mx-auto mt-8 max-w-7xl border-t border-neutral-800 pt-6 text-sm text-gray-500">
        © {new Date().getFullYear()} {appConfig.name}. All rights reserved.
      </div>
    </footer>
  );
}
