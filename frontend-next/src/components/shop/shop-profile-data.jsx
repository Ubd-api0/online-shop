"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ProductCard } from "@/components/product/product-card";
import { Ratings } from "@/components/product/ratings";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ShopProfileData({ products = [], events = [], isOwner = false }) {
  const [active, setActive] = useState(1);
  const allReviews = products.map((product) => product.reviews || []).flat();

  const tabClass = (tab) =>
    cn(
      "cursor-pointer text-[17px] font-semibold sm:text-[20px]",
      active === tab ? "text-brand" : "text-content"
    );

  return (
    <div className="w-full">
      <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full flex-wrap gap-x-5 gap-y-2">
          <h5 onClick={() => setActive(1)} className={tabClass(1)}>
            Shop Products
          </h5>
          <h5 onClick={() => setActive(2)} className={tabClass(2)}>
            Running Events
          </h5>
          <h5 onClick={() => setActive(3)} className={tabClass(3)}>
            Shop Reviews
          </h5>
        </div>
        {isOwner && (
          <Link href="/dashboard" className="shrink-0">
            <Button size="sm">Go Dashboard</Button>
          </Link>
        )}
      </div>

      <br />

      {active === 1 && (
        <div className="mb-12 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((i) => (
            <ProductCard data={i} key={i._id} />
          ))}
        </div>
      )}

      {active === 2 && (
        <div className="w-full">
          <div className="mb-12 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {events.map((i) => (
              <ProductCard data={i} key={i._id} />
            ))}
          </div>
          {events.length === 0 && (
            <h5 className="w-full py-5 text-center text-[18px] text-content">
              No Events have for this shop!
            </h5>
          )}
        </div>
      )}

      {active === 3 && (
        <div className="w-full">
          {allReviews.map((item, index) => (
            <div className="my-4 flex w-full" key={index}>
              <div className="relative size-[50px] shrink-0 overflow-hidden rounded-full bg-surface-alt">
                {item.user?.avatar && (
                  <Image src={item.user.avatar} alt="" fill className="object-cover" />
                )}
              </div>
              <div className="pl-2">
                <div className="flex w-full items-center">
                  <h1 className="pr-2 font-semibold text-content">{item.user?.name}</h1>
                  <Ratings rating={item.rating} />
                </div>
                <p className="text-muted">{item?.comment}</p>
                <p className="text-[14px] text-muted">{item.createdAt?.substring(0, 10)}</p>
              </div>
            </div>
          ))}
          {allReviews.length === 0 && (
            <h5 className="w-full py-5 text-center text-[18px] text-content">
              No Reviews have for this shop!
            </h5>
          )}
        </div>
      )}
    </div>
  );
}
