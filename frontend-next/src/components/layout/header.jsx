"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Heart, ShoppingCart, User, ChevronDown, Home, LayoutGrid, Search, MessageCircle } from "lucide-react";
import { useSelector } from "react-redux";
import api from "@/lib/axios";
import appConfig from "@/config/appConfig";
import { navItems } from "@/config/nav";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { WishlistDrawer } from "@/components/wishlist/wishlist-drawer";

function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

function Brand() {
  return (
    <Link href="/" className="flex shrink-0 items-center">
      {appConfig.logoUrl ? (
        <Image src={appConfig.logoUrl} alt={appConfig.name} width={120} height={32} className="h-8 w-auto object-contain" />
      ) : (
        <span className="font-display text-xl font-bold text-brand">{appConfig.name}</span>
      )}
    </Link>
  );
}

export function Header({ categories = [] }) {
  const router = useRouter();
  const cart = useSelector((state) => state.cart.cart);
  const wishlist = useSelector((state) => state.wishlist.wishlist);
  const { isAuthenticated, user } = useSelector((state) => state.user);

  const [openCart, setOpenCart] = useState(false);
  const [openWishlist, setOpenWishlist] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);
  const [allProducts, setAllProducts] = useState(null);
  const [results, setResults] = useState([]);
  const [selectedCat, setSelectedCat] = useState("All");
  const [catOpen, setCatOpen] = useState(false);
  const [mobileCatOpen, setMobileCatOpen] = useState(false);

  // Lazily fetch the catalog once, only when the visitor starts searching —
  // avoids pulling the whole product list on every page load just for search.
  useEffect(() => {
    if (debouncedSearch.length > 0 && allProducts === null) {
      api.get("/product/get-all-products").then(({ data }) => setAllProducts(data.products || []));
    }
  }, [debouncedSearch, allProducts]);

  const filteredProducts = useMemo(() => {
    let filtered = allProducts || [];
    if (selectedCat !== "All") {
      filtered = filtered.filter((p) => p.category?.toLowerCase() === selectedCat.toLowerCase());
    }
    if (debouncedSearch) {
      filtered = filtered.filter((p) => p.name.toLowerCase().includes(debouncedSearch.toLowerCase()));
    }
    return filtered;
  }, [allProducts, selectedCat, debouncedSearch]);

  useEffect(() => setResults(filteredProducts), [filteredProducts]);

  const catList = ["All", ...categories.map((c) => c.name)];

  const pickCategory = (name) => {
    setSelectedCat(name);
    setCatOpen(false);
    setMobileCatOpen(false);
    router.push(name === "All" ? "/products" : `/products?category=${encodeURIComponent(name)}`);
  };

  return (
    <>
      <header className="sticky top-0 z-[999] w-full glass-surface border-x-0 border-t-0">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-3 py-3 800px:px-6">
          <div className="hidden sm:flex">
            <Brand />
          </div>

          <div className="relative flex h-[42px] flex-1 items-stretch overflow-visible rounded-DEFAULT border border-border">
            <button
              type="button"
              onClick={() => setCatOpen((v) => !v)}
              className="flex min-w-[104px] max-w-[150px] shrink-0 items-center justify-between gap-1 rounded-l-DEFAULT border-r border-border bg-surface-alt px-3"
            >
              <span className="truncate text-sm text-content">{selectedCat}</span>
              <ChevronDown className="size-3.5 shrink-0 text-muted" />
            </button>

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="min-w-0 flex-1 bg-surface px-3 text-sm text-content outline-none"
            />

            <button
              type="button"
              aria-label="Search"
              className="flex shrink-0 items-center justify-center rounded-r-DEFAULT bg-brand px-4 text-white hover:bg-brand-hover"
            >
              <Search className="size-[18px]" />
            </button>

            {catOpen && (
              <div className="glass-surface absolute left-0 top-[calc(100%+4px)] z-[100] hidden max-h-[320px] w-[240px] overflow-y-auto rounded-DEFAULT 800px:block">
                {catList.map((name) => (
                  <button
                    key={name}
                    onClick={() => pickCategory(name)}
                    className={`block w-full px-3 py-2 text-left text-sm hover:bg-surface-alt ${
                      selectedCat === name ? "font-medium text-brand" : "text-content"
                    }`}
                  >
                    {name}
                  </button>
                ))}
              </div>
            )}

            {search.length > 1 && results.length > 0 && (
              <div className="glass-surface absolute left-0 top-[calc(100%+4px)] z-[90] max-h-[300px] w-full overflow-y-auto rounded-DEFAULT">
                {results.slice(0, 10).map((p) => (
                  <Link
                    key={p._id}
                    href={`/product/${p._id}`}
                    onClick={() => setSearch("")}
                    className="flex items-center gap-2 p-2 hover:bg-surface-alt"
                  >
                    {p.images?.[0] && (
                      <Image src={p.images[0]} width={40} height={40} className="size-10 object-contain" alt="" />
                    )}
                    <span className="text-sm text-content">{p.name}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="hidden items-center gap-4 800px:flex">
            <ThemeToggle />

            <button onClick={() => setOpenWishlist(true)} className="relative" aria-label="Wishlist">
              <Heart className="size-[22px] text-content" />
              {wishlist?.length > 0 && (
                <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-brand text-[10px] text-white">
                  {wishlist.length}
                </span>
              )}
            </button>

            <button onClick={() => setOpenCart(true)} className="relative" aria-label="Cart">
              <ShoppingCart className="size-[22px] text-content" />
              {cart?.length > 0 && (
                <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-brand text-[10px] text-white">
                  {cart.length}
                </span>
              )}
            </button>

            {isAuthenticated && user?.role === "business_owner" && (
              <Link href="/dashboard" className="text-sm font-semibold text-brand hover:text-brand-hover">
                Dashboard
              </Link>
            )}

            {isAuthenticated ? (
              <Link href="/profile">
                {user?.avatar ? (
                  <Image src={user.avatar} width={32} height={32} className="size-8 rounded-full object-cover" alt="" />
                ) : (
                  <User className="size-[22px] text-content" />
                )}
              </Link>
            ) : (
              <Link href="/login">
                <User className="size-[22px] text-content" />
              </Link>
            )}
          </div>
        </div>

        <div className="hidden border-t border-border 800px:block">
          <div className="mx-auto max-w-7xl px-3 800px:px-6">
            <nav className="flex h-11 items-center gap-6">
              {navItems.map((i) => (
                <Link key={i.title} href={i.url} className="text-sm font-medium text-muted transition hover:text-brand">
                  {i.title}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* mobile category drawer */}
      {mobileCatOpen && (
        <div className="fixed inset-0 z-[9999] bg-black/40 800px:hidden" onClick={() => setMobileCatOpen(false)}>
          <div
            className="glass-surface h-full w-[75%] max-w-[300px] overflow-y-auto p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-3 font-semibold text-content">Categories</h3>
            {catList.map((name) => (
              <div
                key={name}
                onClick={() => pickCategory(name)}
                className={`cursor-pointer border-b border-border p-2 ${
                  selectedCat === name ? "font-medium text-brand" : "text-content"
                }`}
              >
                {name}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* mobile bottom nav */}
      <div className="glass-surface fixed bottom-0 left-0 z-[999] flex w-full justify-around border-x-0 border-b-0 py-2 800px:hidden">
        <Link href="/" className="flex flex-col items-center text-xs text-content">
          <Home className="size-5" />
          Home
        </Link>
        <button onClick={() => setMobileCatOpen(true)} className="flex flex-col items-center text-xs text-content">
          <LayoutGrid className="size-5" />
          Category
        </button>
        <button onClick={() => setOpenCart(true)} className="relative flex flex-col items-center text-xs text-content">
          <ShoppingCart className="size-5" />
          Cart
          {cart?.length > 0 && (
            <span className="absolute -top-1 right-1 rounded bg-brand px-1 text-[10px] text-white">
              {cart.length}
            </span>
          )}
        </button>
        <button onClick={() => setOpenWishlist(true)} className="relative flex flex-col items-center text-xs text-content">
          <Heart className="size-5" />
          Wishlist
          {wishlist?.length > 0 && (
            <span className="absolute -top-1 right-1 rounded bg-brand px-1 text-[10px] text-white">
              {wishlist.length}
            </span>
          )}
        </button>
        <Link href="/inbox" className="flex flex-col items-center text-xs text-content">
          <MessageCircle className="size-5" />
          Inbox
        </Link>
        {isAuthenticated ? (
          <Link href="/profile" className="flex flex-col items-center text-xs text-content">
            {user?.avatar ? (
              <Image src={user.avatar} width={22} height={22} className="size-[22px] rounded-full object-cover" alt="" />
            ) : (
              <User className="size-5" />
            )}
            Account
          </Link>
        ) : (
          <Link href="/login" className="flex flex-col items-center text-xs text-content">
            <User className="size-5" />
            Login
          </Link>
        )}
      </div>

      <CartDrawer open={openCart} onOpenChange={setOpenCart} />
      <WishlistDrawer open={openWishlist} onOpenChange={setOpenWishlist} />
    </>
  );
}
