"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "sonner";
import {
  MapPin,
  Truck,
  Zap,
  Package,
  CreditCard,
  Wallet,
  Banknote,
  Ticket,
  ShieldCheck,
  Pencil,
  Plus,
  X,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import api from "@/lib/axios";
import { updateUserAddress } from "@/redux/slices/user";
import { completeCheckout } from "@/redux/slices/cart";
import { normalizeAddress } from "@/lib/shipping/pakistan";
import { formatPrice, formatShortDate } from "@/lib/format";
import {
  AddressFields,
  EMPTY_ADDRESS,
  addressError,
  formatAddressLines,
} from "@/components/address/address-fields";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const METHOD_META = {
  cod: { icon: Banknote, title: "Cash on Delivery", text: "Pay in cash when your parcel arrives." },
  online_full: { icon: CreditCard, title: "Pay online", text: "Card, EasyPaisa, JazzCash or PayPal — pay in full now." },
  partial_advance: { icon: Wallet, title: "Advance + COD", text: "Pay part now online, the rest in cash on delivery." },
};

export function CheckoutForm({ mode }) {
  const { user } = useSelector((state) => state.user);
  const cartItems = useSelector((state) => state.cart.cart);
  const buyNow = useSelector((state) => state.cart.buyNow);
  const cartHydrated = useSelector((state) => state.cart.hydrated);
  const dispatch = useDispatch();
  const router = useRouter();

  const isBuyNow = mode === "buy-now" && !!buyNow;
  // What's being bought: the single Buy Now product, or only the cart items
  // the customer ticked. Unticked cart items are left untouched.
  const items = useMemo(
    () => (isBuyNow ? [buyNow] : cartItems.filter((i) => i.selected)),
    [isBuyNow, buyNow, cartItems]
  );
  const itemsKey = items.map((i) => `${i._id}:${i.qty}`).join(",");

  // ---- address ----------------------------------------------------------
  const savedAddresses = useMemo(
    () =>
      (user?.addresses || []).map((a) => ({
        ...EMPTY_ADDRESS,
        ...normalizeAddress(a),
        fullName: a.fullName || user?.name || "",
        phone: a.phone || (user?.phoneNumber ? `0${user.phoneNumber}`.replace(/^00/, "0") : ""),
      })),
    [user]
  );
  const [selectedId, setSelectedId] = useState(null);
  const [editing, setEditing] = useState(null); // null | address draft being edited / created
  const [saveForLater, setSaveForLater] = useState(true);

  // Pick the first saved address once the user record has loaded (checkout
  // is login-only, so it always arrives); otherwise open a blank form.
  useEffect(() => {
    if (!user || selectedId || editing) return;
    if (savedAddresses.length) setSelectedId(savedAddresses[0]._id);
    else setEditing({ ...EMPTY_ADDRESS, fullName: user?.name || "" });
  }, [savedAddresses, selectedId, editing, user]);

  // The user record can arrive after the form opened — fill in their name then.
  useEffect(() => {
    if (user?.name) setEditing((e) => (e && !e._id && !e.fullName ? { ...e, fullName: user.name } : e));
  }, [user?.name]);

  const selectedSaved = savedAddresses.find((a) => a._id === selectedId);
  const address = editing || selectedSaved || null;

  // ---- delivery / voucher / payment --------------------------------------
  const [deliveryOption, setDeliveryOption] = useState("standard");
  const [couponInput, setCouponInput] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");

  // ---- live quote (server-computed) ---------------------------------------
  const [quote, setQuote] = useState(null);
  const [quoting, setQuoting] = useState(false);
  const [placing, setPlacing] = useState(false);
  const reqId = useRef(0);

  const addrKey = address ? `${address.province}|${address.city}` : "";

  useEffect(() => {
    if (!cartHydrated || items.length === 0) return;
    const id = ++reqId.current;
    setQuoting(true);
    const t = setTimeout(async () => {
      try {
        const { data } = await api.post("/order/quote", {
          items: items.map((i) => ({ _id: i._id, qty: i.qty, name: i.name })),
          shippingAddress: address?.province ? { province: address.province, city: address.city } : null,
          deliveryOption,
          couponCode,
          paymentMethod,
        });
        if (id !== reqId.current) return;
        setQuote(data.quote);
        if (data.quote.paymentMethod && data.quote.paymentMethod !== paymentMethod) {
          setPaymentMethod(data.quote.paymentMethod);
        }
        if (couponCode && data.quote.couponError) {
          toast.error(data.quote.couponError);
          setCouponCode("");
        }
      } catch {
        if (id === reqId.current) toast.error("Couldn't calculate your order total. Please retry.");
      } finally {
        if (id === reqId.current) setQuoting(false);
      }
    }, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartHydrated, itemsKey, addrKey, deliveryOption, couponCode, paymentMethod]);

  // ---- actions ----------------------------------------------------------
  const applyCoupon = (e) => {
    e.preventDefault();
    const code = couponInput.trim();
    if (!code) return;
    setCouponCode(code);
    setCouponInput("");
  };

  const placeOrder = async () => {
    if (!address) return toast.error("Please add a delivery address");
    const err = addressError(address);
    if (err) {
      if (!editing) setEditing({ ...address });
      return toast.error(err);
    }
    if (!quote || quoting) return;
    if (quote.issues.length) return toast.error("Some items are unavailable — please update your cart");
    if (!quote.selectedDelivery) return toast.error("We can't deliver to this address yet");
    if (!paymentMethod) return toast.error("Please choose a payment method");

    const shippingAddress = {
      fullName: address.fullName.trim(),
      phone: address.phone.trim(),
      country: "PK",
      province: address.province,
      city: address.city.trim(),
      address1: address.address1.trim(),
      address2: address.address2?.trim() || "",
      zipCode: address.zipCode || "",
      addressType: address.addressType || "Home",
    };

    setPlacing(true);
    // Remember a new / edited address on the account. Awaited, because the
    // full-page redirect below would otherwise abort the request; a failure
    // here never blocks the order.
    if (editing && saveForLater) {
      const sameType = savedAddresses.find((a) => a.addressType === shippingAddress.addressType);
      await dispatch(updateUserAddress({ ...shippingAddress, _id: editing._id || sameType?._id }));
    }

    const orderData = {
      items: items.map((i) => ({ _id: i._id, qty: i.qty })),
      cart: quote.lines,
      source: isBuyNow ? "buy-now" : "cart",
      shippingAddress,
      deliveryOption: quote.selectedDelivery.key,
      couponCode: quote.coupon?.name || "",
      paymentMethod,
      subTotal: quote.subTotal,
      shippingFee: quote.shippingFee,
      codFee: quote.codFee,
      discount: quote.discount,
      totalPrice: quote.totalPrice,
      delivery: quote.selectedDelivery,
      advancePercent: quote.policy.advancePercent,
    };

    // Cash on delivery needs no payment step — place the order right here.
    if (paymentMethod === "cod") {
      try {
        const { data } = await api.post("/order/create-order", {
          ...orderData,
          paymentInfo: { type: "Cash On Delivery", status: "pending_cod" },
        });
        dispatch(completeCheckout(orderData));
        window.location.assign(`/order/success?id=${data.orders?.[0]?._id || ""}`);
      } catch (error) {
        toast.error(error.response?.data?.message || "Could not place your order");
        setPlacing(false);
      }
      return;
    }

    localStorage.setItem("latestOrder", JSON.stringify(orderData));
    setPlacing(false);
    router.push("/payment");
  };

  // ---- render -----------------------------------------------------------
  if (!cartHydrated) return <div className="min-h-[50vh] bg-surface-alt" />;

  if (items.length === 0) {
    return (
      <div className="bg-surface-alt px-4 py-16 text-center text-content">
        <Package className="mx-auto mb-3 size-12 text-muted" />
        <p className="mb-4">Nothing to checkout — select some items in your cart first.</p>
        <Link href="/products">
          <Button>Continue shopping</Button>
        </Link>
      </div>
    );
  }

  const issuesById = new Map((quote?.issues || []).map((i) => [String(i._id), i]));
  const lines = quote?.lines?.length ? quote.lines : items;
  const ctaLabel = paymentMethod === "cod" ? "Place Order" : "Proceed to Pay";
  const canPlace = !!quote && !quoting && !placing && quote.issues.length === 0 && !!quote.selectedDelivery;

  return (
    <div className="bg-surface-alt pb-28 pt-2 lg:pb-10">
      <div className="mx-auto max-w-6xl px-3 lg:px-5">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
          <div className="w-full min-w-0 space-y-4 lg:flex-1">
            {/* 1. Address */}
            <Section icon={MapPin} title="Delivery address">
              {editing ? (
                <div className="space-y-4">
                  <AddressFields value={editing} onChange={setEditing} />
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <label className="flex cursor-pointer items-center gap-2 text-sm text-content">
                      <input
                        type="checkbox"
                        className="size-4 accent-brand"
                        checked={saveForLater}
                        onChange={(e) => setSaveForLater(e.target.checked)}
                      />
                      Save this address to my account
                    </label>
                    {savedAddresses.length > 0 && (
                      <Button variant="ghost" size="sm" onClick={() => setEditing(null)}>
                        Use a saved address
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {savedAddresses.map((a) => (
                      <AddressCard
                        key={a._id}
                        address={a}
                        selected={a._id === selectedId}
                        onSelect={() => setSelectedId(a._id)}
                        onEdit={() => {
                          setSelectedId(a._id);
                          setEditing({ ...a });
                        }}
                      />
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditing({ ...EMPTY_ADDRESS, fullName: user?.name || "" })}
                  >
                    <Plus /> Add new address
                  </Button>
                </div>
              )}
            </Section>

            {/* 2. Delivery option */}
            <Section icon={Truck} title="Delivery option">
              {!address?.province ? (
                <p className="text-sm text-muted">Choose your province and city to see delivery options.</p>
              ) : !quote?.delivery ? (
                <SkeletonLines />
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {quote.delivery.options.map((o) => (
                    <OptionCard
                      key={o.key}
                      selected={quote.selectedDelivery?.key === o.key}
                      onClick={() => setDeliveryOption(o.key)}
                      icon={o.key === "express" ? Zap : Truck}
                      title={o.label}
                      right={
                        o.free ? (
                          <span className="text-right">
                            <span className="block text-xs text-muted line-through">{formatPrice(o.baseFee)}</span>
                            <span className="font-semibold text-emerald-600">FREE</span>
                          </span>
                        ) : (
                          <span className="font-semibold text-content">{formatPrice(o.fee)}</span>
                        )
                      }
                    >
                      Get by {formatShortDate(o.etaFrom)} – {formatShortDate(o.etaTo)}
                    </OptionCard>
                  ))}
                </div>
              )}
              {quote?.hasMadeToOrder && (
                <p className="mt-3 text-xs text-blue-600">
                  Includes made-to-order items — the delivery estimate includes production time.
                </p>
              )}
            </Section>

            {/* 3. Package */}
            <Section
              icon={Package}
              title={isBuyNow ? "Your item" : `Package · ${quote?.itemCount ?? items.length} item(s)`}
              aside={
                quote?.delivery && (
                  <span className="text-xs text-muted">Billable weight {quote.delivery.weightKg} kg</span>
                )
              }
            >
              <ul className="divide-y divide-border">
                {lines.map((item) => {
                  const issue = issuesById.get(String(item._id));
                  return (
                    <li key={item._id} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                      <div className="relative size-16 shrink-0 overflow-hidden rounded-DEFAULT bg-surface-alt sm:size-20">
                        {item.images?.[0] && (
                          <Image src={item.images[0]} alt={item.name} fill className="object-contain" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-sm text-content">{item.name}</p>
                        {item.fulfillment === "made_to_order" && (
                          <p className="mt-0.5 text-xs text-blue-600">
                            Made to order{item.leadTimeDays ? ` · ~${item.leadTimeDays} days` : ""}
                          </p>
                        )}
                        {issue && (
                          <p className="mt-1 flex items-center gap-1 text-xs font-medium text-red-500">
                            <AlertTriangle className="size-3.5" /> {issue.reason}
                          </p>
                        )}
                        <p className="mt-1 text-xs text-muted">Qty: {item.qty}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-brand">{formatPrice(item.discountPrice * item.qty)}</p>
                        {item.originalPrice > item.discountPrice && (
                          <p className="text-xs text-muted line-through">{formatPrice(item.originalPrice * item.qty)}</p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </Section>

            {/* 4. Payment */}
            <Section icon={CreditCard} title="Payment method">
              {!quote ? (
                <SkeletonLines />
              ) : quote.methods.length === 0 ? (
                <p className="text-sm text-muted">
                  No payment method is available for these items. Please contact the store.
                </p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-3">
                  {quote.methods.map((m) => {
                    const meta = METHOD_META[m.key] || { icon: CreditCard, title: m.label, text: "" };
                    return (
                      <OptionCard
                        key={m.key}
                        selected={paymentMethod === m.key}
                        onClick={() => setPaymentMethod(m.key)}
                        icon={meta.icon}
                        title={meta.title}
                      >
                        {m.key === "partial_advance"
                          ? `Pay ${quote.policy.advancePercent}% now, rest on delivery.`
                          : meta.text}
                      </OptionCard>
                    );
                  })}
                </div>
              )}
              {paymentMethod === "cod" && quote?.codFee > 0 && (
                <p className="mt-3 text-xs text-muted">
                  A cash-handling fee of {formatPrice(quote.codFee)} applies to Cash on Delivery.
                </p>
              )}
            </Section>
          </div>

          {/* Summary */}
          <aside className="w-full lg:sticky lg:top-24 lg:w-[360px]">
            <Card variant="solid" className="p-5">
              <h2 className="mb-4 text-lg font-semibold text-content">Order summary</h2>

              {quote?.freeShippingRemaining > 0 && (
                <div className="mb-4 rounded-DEFAULT bg-emerald-500/10 px-3 py-2 text-xs text-emerald-700 dark:text-emerald-400">
                  Add {formatPrice(quote.freeShippingRemaining)} more for <strong>free standard delivery</strong>.
                </div>
              )}

              <form onSubmit={applyCoupon} className="mb-4">
                {quote?.coupon ? (
                  <div className="flex items-center justify-between rounded-DEFAULT border border-dashed border-brand bg-brand/5 px-3 py-2">
                    <span className="flex items-center gap-2 text-sm">
                      <Ticket className="size-4 text-brand" />
                      <span className="font-mono font-semibold text-brand">{quote.coupon.name}</span>
                      <span className="text-muted">({quote.coupon.value}% off)</span>
                    </span>
                    <button type="button" onClick={() => setCouponCode("")} aria-label="Remove voucher">
                      <X className="size-4 text-muted hover:text-content" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Ticket className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
                      <Input
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        placeholder="Voucher code"
                        className="pl-9"
                      />
                    </div>
                    <Button type="submit" variant="outline" disabled={!couponInput.trim()}>
                      Apply
                    </Button>
                  </div>
                )}
              </form>

              <dl className="space-y-2.5 text-sm">
                <SummaryRow label={`Items total (${quote?.itemCount ?? items.length})`} value={quote ? formatPrice(quote.subTotal) : "…"} />
                <SummaryRow
                  label="Delivery fee"
                  value={
                    !address?.province
                      ? "Add address"
                      : !quote?.selectedDelivery
                        ? "…"
                        : quote.selectedDelivery.free
                          ? "FREE"
                          : formatPrice(quote.shippingFee)
                  }
                  valueClass={quote?.selectedDelivery?.free ? "text-emerald-600" : undefined}
                />
                {quote?.codFee > 0 && <SummaryRow label="COD fee" value={formatPrice(quote.codFee)} />}
                {quote?.discount > 0 && (
                  <SummaryRow label="Voucher discount" value={`− ${formatPrice(quote.discount)}`} valueClass="text-emerald-600" />
                )}
              </dl>

              <div className="mt-4 flex items-baseline justify-between border-t border-border pt-4">
                <span className="font-semibold text-content">Total</span>
                <span className="flex items-center gap-2 text-2xl font-bold text-brand">
                  {quoting && <Loader2 className="size-4 animate-spin text-muted" />}
                  {quote ? formatPrice(quote.totalPrice) : "…"}
                </span>
              </div>
              {paymentMethod === "partial_advance" && quote && (
                <p className="mt-1 text-right text-xs text-muted">
                  {formatPrice(Math.round((quote.totalPrice * quote.policy.advancePercent) / 100))} now · rest on delivery
                </p>
              )}

              <Button onClick={placeOrder} disabled={!canPlace} className="mt-5 hidden w-full lg:flex">
                {placing ? <Loader2 className="animate-spin" /> : null}
                {ctaLabel}
              </Button>
              <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted">
                <ShieldCheck className="size-3.5" /> Secure checkout · prices verified at order time
              </p>
            </Card>
          </aside>
        </div>
      </div>

      {/* Mobile sticky action bar (sits above the header's mobile bottom nav) */}
      <div className="fixed inset-x-0 bottom-[56px] z-sticky flex items-center justify-between gap-3 border-t border-border bg-surface px-4 py-3 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] lg:hidden 800px:bottom-0">
        <div>
          <p className="text-xs text-muted">Total</p>
          <p className="text-lg font-bold text-brand">{quote ? formatPrice(quote.totalPrice) : "…"}</p>
        </div>
        <Button onClick={placeOrder} disabled={!canPlace} className="min-w-[150px]">
          {placing ? <Loader2 className="animate-spin" /> : null}
          {ctaLabel}
        </Button>
      </div>
    </div>
  );
}

function Section({ icon: Icon, title, aside, children }) {
  return (
    <Card variant="solid" className="p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-base font-semibold text-content">
          <Icon className="size-5 text-brand" />
          {title}
        </h2>
        {aside}
      </div>
      {children}
    </Card>
  );
}

function AddressCard({ address, selected, onSelect, onEdit }) {
  const incomplete = !!addressError(address);
  return (
    <div
      role="radio"
      aria-checked={selected}
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onSelect()}
      className={cn(
        "relative cursor-pointer rounded-lg border p-3.5 text-left transition-colors",
        selected ? "border-brand bg-brand/5 ring-1 ring-brand" : "border-border hover:border-brand/50"
      )}
    >
      <div className="mb-1 flex items-center gap-2 pr-8">
        <span className="font-medium text-content">{address.fullName || "Add recipient name"}</span>
        <Badge variant="muted">{address.addressType || "Home"}</Badge>
      </div>
      {address.phone && <p className="text-sm text-muted">{address.phone}</p>}
      {formatAddressLines(address).map((l) => (
        <p key={l} className="text-sm text-muted">
          {l}
        </p>
      ))}
      {incomplete && <p className="mt-1 text-xs font-medium text-amber-600">Missing details — tap edit to complete</p>}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onEdit();
        }}
        className="absolute right-3 top-3 text-muted hover:text-brand"
        aria-label="Edit address"
      >
        <Pencil className="size-4" />
      </button>
    </div>
  );
}

function OptionCard({ selected, onClick, icon: Icon, title, right, children }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onClick}
      className={cn(
        "flex w-full items-start gap-3 rounded-lg border p-3.5 text-left transition-colors",
        selected ? "border-brand bg-brand/5 ring-1 ring-brand" : "border-border hover:border-brand/50"
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border",
          selected ? "border-brand" : "border-muted"
        )}
      >
        {selected && <span className="size-2 rounded-full bg-brand" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5 font-medium text-content">
          <Icon className="size-4 text-brand" />
          {title}
        </span>
        <span className="mt-0.5 block text-xs text-muted">{children}</span>
      </span>
      {right}
    </button>
  );
}

function SummaryRow({ label, value, valueClass }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted">{label}</dt>
      <dd className={cn("font-medium text-content", valueClass)}>{value}</dd>
    </div>
  );
}

function SkeletonLines() {
  return (
    <div className="space-y-2">
      <div className="h-14 animate-pulse rounded-lg bg-surface-alt" />
      <div className="h-14 animate-pulse rounded-lg bg-surface-alt" />
    </div>
  );
}
