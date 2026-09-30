"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, ChevronDown } from "lucide-react";
import { TileIcon } from "@/lib/tileIcons";
import { Card } from "@/components/ui/card";

export function CategoriesSection({ categories = [], featureTiles = [] }) {
  const router = useRouter();
  const [dropDown, setDropDown] = useState(false);

  return (
    <>
      {featureTiles.length > 0 && (
        <div className="mx-auto max-w-7xl px-4 py-6 800px:px-6 800px:py-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featureTiles.map((t, index) => (
              <Card key={index} variant="solid" className="flex items-start gap-3 p-3">
                <TileIcon name={t.icon} className="shrink-0 text-brand" />
                <div>
                  <h3 className="text-sm font-semibold text-content">{t.title}</h3>
                  <p className="text-xs text-muted">{t.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {categories.length > 0 && (
        <div className="pb-6 800px:pb-8">
          <div className="mx-auto max-w-7xl px-4 800px:px-6">
            <button
              onClick={() => setDropDown((v) => !v)}
              className="glass-surface flex h-[45px] w-full items-center justify-between rounded-DEFAULT px-3 lg:hidden"
            >
              <span className="flex items-center gap-2 text-content">
                <Menu className="size-[22px]" />
                Categories
              </span>
              <ChevronDown className={`size-4 transition-transform ${dropDown ? "rotate-180" : ""}`} />
            </button>

            <div className="hidden grid-cols-3 gap-3 lg:grid xl:grid-cols-5">
              {categories.map((c) => (
                <CategoryCard key={c._id} c={c} router={router} />
              ))}
            </div>

            {dropDown && (
              <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:hidden">
                {categories.map((c) => (
                  <CategoryCard key={c._id} c={c} router={router} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function CategoryCard({ c, router }) {
  return (
    <Card
      variant="solid"
      onClick={() => router.push(`/products?category=${encodeURIComponent(c.name)}`)}
      className="flex cursor-pointer items-center justify-between p-3 transition hover:-translate-y-0.5"
    >
      <div>
        <h5 className="text-sm font-medium text-content">{c.name}</h5>
        {c.subTitle && <p className="text-xs text-muted">{c.subTitle}</p>}
      </div>
      {c.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={c.image} className="size-12 rounded object-cover" alt="" />
      )}
    </Card>
  );
}
