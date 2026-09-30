"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Country, State } from "country-state-city";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "sonner";
import { MapPin, Tag, CreditCard } from "lucide-react";
import api from "@/lib/axios";
import { effectivePolicy, availableMethods } from "@/lib/paymentPolicy";
import { updateUserAddress } from "@/redux/slices/user";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CheckoutForm({ mode }) {
  const { user } = useSelector((state) => state.user);
  const cartItems = useSelector((state) => state.cart.cart);
  const buyNow = useSelector((state) => state.cart.buyNow);
  const cartHydrated = useSelector((state) => state.cart.hydrated);
  const isBuyNow = mode === "buy-now" && !!buyNow;
  // What's being bought: the single Buy Now product, or only the cart items
  // the customer ticked. Unticked cart items are left untouched.
  const cart = useMemo(
    () => (isBuyNow ? [buyNow] : cartItems.filter((i) => i.selected)),
    [isBuyNow, buyNow, cartItems]
  );
  const dispatch = useDispatch();
  const router = useRouter();

  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [addressType, setAddressType] = useState("Home");
  const [usingSaved, setUsingSaved] = useState(false);
  const [showNewAddress, setShowNewAddress] = useState(!(user?.addresses?.length > 0));

  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [zipCode, setZipCode] = useState("");

  const [couponCode, setCouponCode] = useState("");
  const [couponCodeData, setCouponCodeData] = useState(null);
  const [discountPrice, setDiscountPrice] = useState(null);

  const [paymentSettings, setPaymentSettings] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("");

  useEffect(() => {
    api
      .get("/payment/config")
      .then((res) => setPaymentSettings(res.data.paymentSettings))
      .catch(() => setPaymentSettings(null));
  }, []);

  const policy = effectivePolicy(paymentSettings, cart);
  const methods = availableMethods(policy);

  useEffect(() => {
    if (methods.length && !methods.find((m) => m.key === paymentMethod)) {
      setPaymentMethod(methods[0].key);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [methods.length]);

  const subTotalPrice = cart.reduce((acc, item) => acc + item.qty * item.discountPrice, 0);
  const shipping = subTotalPrice * 0.1;
  const discountPercentage = couponCodeData ? discountPrice : 0;
  const totalPrice = (subTotalPrice + shipping - discountPercentage).toFixed(2);

  const paymentSubmit = async () => {
    if (!address1 || !zipCode || !country || !city) {
      toast.error("Please fill shipping address!");
      return;
    }
    if (!paymentMethod) {
      toast.error("Please choose a payment method!");
      return;
    }

    try {
      const { data } = await api.post("/order/check-availability", { cart });
      if (data && data.ok === false) {
        toast.error(`Currently unavailable: ${data.issues.map((i) => i.name).join(", ")}`);
        return;
      }
    } catch {
      // ignore — authoritative check happens at order creation
    }

    const shippingAddress = { address1, address2, zipCode, country, city };

    const alreadySaved = (user?.addresses || []).some(
      (a) => a.address1 === address1 && String(a.zipCode) === String(zipCode) && a.city === city
    );
    if (!usingSaved && !alreadySaved) {
      dispatch(updateUserAddress({ country, city, address1, address2, zipCode, addressType }));
    }

    const orderData = {
      cart,
      source: isBuyNow ? "buy-now" : "cart",
      totalPrice,
      subTotalPrice,
      shipping,
      discountPrice,
      shippingAddress,
      user,
      paymentMethod,
      advancePercent: policy.advancePercent,
    };

    localStorage.setItem("latestOrder", JSON.stringify(orderData));
    router.push("/payment");
  };

  const applyCoupon = async (e) => {
    e.preventDefault();
    try {
      const name = couponCode;
      const res = await api.get(`/coupon/get-coupon-value/${name}`);

      if (!res.data.couponCode) {
        toast.error("Coupon doesn't exist!");
        return;
      }

      const shopId = res.data.couponCode.shopId;
      const couponValue = res.data.couponCode.value;
      const validProducts = cart.filter((item) => item.shopId === shopId);

      if (validProducts.length === 0) {
        toast.error("Coupon not valid for this shop");
        return;
      }

      const eligibleAmount = validProducts.reduce((acc, item) => acc + item.qty * item.discountPrice, 0);
      const discount = (eligibleAmount * couponValue) / 100;

      setDiscountPrice(discount);
      setCouponCodeData(res.data.couponCode);
      toast.success("Coupon applied successfully!");
      setCouponCode("");
    } catch {
      toast.error("Invalid coupon code");
    }
  };

  const applySavedAddress = (item) => {
    setAddress1(item.address1 || "");
    setAddress2(item.address2 || "");
    setZipCode(item.zipCode || "");
    setCountry(item.country || "");
    setCity(item.city || "");
    setAddressType(item.addressType || "Home");
    setUsingSaved(true);
    setShowNewAddress(false);
  };

  const startNewAddress = () => {
    setAddress1("");
    setAddress2("");
    setZipCode("");
    setCountry("");
    setCity("");
    setUsingSaved(false);
    setShowNewAddress(true);
  };

  if (!cartHydrated) return <div className="min-h-[50vh] bg-surface-alt" />;

  if (cart.length === 0) {
    return (
      <div className="bg-surface-alt px-4 py-16 text-center text-content">
        <p className="mb-3">Nothing to checkout — select some items in your cart first.</p>
        <Link href="/products" className="text-brand underline">
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-surface-alt py-6">
      <div className="mx-auto max-w-7xl px-3 lg:px-5">
        <div className="flex flex-col gap-5 lg:flex-row">
          <div className="w-full space-y-5 lg:w-[68%]">
            <ShippingInfo
              user={user}
              country={country}
              setCountry={setCountry}
              city={city}
              setCity={setCity}
              addressType={addressType}
              setAddressType={setAddressType}
              showNewAddress={showNewAddress}
              startNewAddress={startNewAddress}
              applySavedAddress={applySavedAddress}
              address1={address1}
              setAddress1={setAddress1}
              address2={address2}
              setAddress2={setAddress2}
              zipCode={zipCode}
              setZipCode={setZipCode}
            />
            <PaymentMethodPicker
              methods={methods}
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
              policy={policy}
              totalPrice={totalPrice}
            />
          </div>

          <div className="w-full lg:w-[32%]">
            <CartSummary
              items={cart}
              isBuyNow={isBuyNow}
              applyCoupon={applyCoupon}
              totalPrice={totalPrice}
              shipping={shipping}
              subTotalPrice={subTotalPrice}
              couponCode={couponCode}
              setCouponCode={setCouponCode}
              discountPercentage={discountPercentage}
              paymentSubmit={paymentSubmit}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ShippingInfo({
  user,
  country,
  setCountry,
  city,
  setCity,
  addressType,
  setAddressType,
  showNewAddress,
  startNewAddress,
  applySavedAddress,
  address1,
  setAddress1,
  address2,
  setAddress2,
  zipCode,
  setZipCode,
}) {
  const saved = user?.addresses || [];

  return (
    <Card variant="solid" className="p-5">
      <div className="mb-5 flex items-center gap-2 border-b border-border pb-4">
        <MapPin className="size-[22px] text-brand" />
        <h2 className="text-[20px] font-semibold text-content">Shipping Address</h2>
      </div>

      {saved.length > 0 && (
        <div className="mb-5 space-y-3">
          {saved.map((item, index) => {
            const selected = !showNewAddress && item.address1 === address1 && String(item.zipCode) === String(zipCode);
            return (
              <label
                key={index}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-DEFAULT border p-3 transition",
                  selected ? "border-brand bg-brand/10" : "border-border hover:border-brand/40"
                )}
              >
                <input type="radio" name="address" className="mt-1" checked={selected} onChange={() => applySavedAddress(item)} />
                <div>
                  <h4 className="font-semibold text-content">{item.addressType}</h4>
                  <p className="text-sm text-muted">
                    {[item.address1, item.address2, item.city, item.country].filter(Boolean).join(", ")}
                  </p>
                </div>
              </label>
            );
          })}
          <button type="button" onClick={startNewAddress} className="text-sm font-semibold text-brand">
            {showNewAddress ? "— Using a new address —" : "+ Use a new address"}
          </button>
        </div>
      )}

      {showNewAddress && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Full Name">
            <Input value={user?.name || ""} disabled />
          </Field>
          <Field label="Email">
            <Input value={user?.email || ""} disabled />
          </Field>
          <Field label="Country">
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="mt-1 h-[45px] w-full rounded-DEFAULT border border-border bg-surface px-3 text-content outline-none focus:border-brand"
            >
              <option value="">Choose Country</option>
              {Country.getAllCountries().map((item) => (
                <option key={item.isoCode} value={item.isoCode}>
                  {item.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="State / City">
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="mt-1 h-[45px] w-full rounded-DEFAULT border border-border bg-surface px-3 text-content outline-none focus:border-brand"
            >
              <option value="">Choose City</option>
              {State.getStatesOfCountry(country).map((item) => (
                <option key={item.isoCode} value={item.isoCode}>
                  {item.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Zip Code">
            <Input type="number" value={zipCode} onChange={(e) => setZipCode(e.target.value)} />
          </Field>
          <Field label="Address Type">
            <select
              value={addressType}
              onChange={(e) => setAddressType(e.target.value)}
              className="mt-1 h-[45px] w-full rounded-DEFAULT border border-border bg-surface px-3 text-content outline-none focus:border-brand"
            >
              <option value="Home">Home</option>
              <option value="Office">Office</option>
              <option value="Other">Other</option>
            </select>
          </Field>
          <Field label="Address Line 1">
            <Input value={address1} onChange={(e) => setAddress1(e.target.value)} />
          </Field>
          <Field label="Address Line 2">
            <Input value={address2} onChange={(e) => setAddress2(e.target.value)} />
          </Field>
        </div>
      )}
    </Card>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="text-sm font-medium text-muted">{label}</label>
      {children}
    </div>
  );
}

function CartSummary({
  items,
  isBuyNow,
  applyCoupon,
  totalPrice,
  shipping,
  subTotalPrice,
  couponCode,
  setCouponCode,
  discountPercentage,
  paymentSubmit,
}) {
  return (
    <Card variant="solid" className="sticky top-24 p-5">
      <h2 className="mb-4 border-b border-border pb-4 text-[20px] font-semibold text-content">Order Summary</h2>

      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
        {isBuyNow ? "Buy now" : `${items.length} ${items.length === 1 ? "item" : "items"} from cart`}
      </p>
      <ul className="mb-5 max-h-60 space-y-3 overflow-y-auto border-b border-border pb-4">
        {items.map((item) => (
          <li key={item._id} className="flex items-center gap-3">
            <div className="relative size-12 shrink-0 overflow-hidden rounded-DEFAULT bg-surface-alt">
              {item.images?.[0] && <Image src={item.images[0]} alt={item.name} fill className="object-contain" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="line-clamp-1 text-sm text-content">{item.name}</p>
              <p className="text-xs text-muted">
                ${item.discountPrice} × {item.qty}
              </p>
            </div>
            <span className="text-sm font-semibold text-content">${(item.discountPrice * item.qty).toFixed(2)}</span>
          </li>
        ))}
      </ul>

      <div className="space-y-4">
        <div className="flex justify-between">
          <span className="text-muted">Subtotal</span>
          <span className="font-semibold text-content">${subTotalPrice.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted">Shipping Fee</span>
          <span className="font-semibold text-content">${shipping.toFixed(2)}</span>
        </div>
        <div className="flex justify-between border-b border-border pb-4">
          <span className="text-muted">Discount</span>
          <span className="font-semibold text-green-600">
            -${discountPercentage ? discountPercentage.toFixed(2) : "0.00"}
          </span>
        </div>
        <div className="flex justify-between text-lg font-bold text-content">
          <span>Total</span>
          <span className="text-brand">${totalPrice}</span>
        </div>
      </div>

      <form onSubmit={applyCoupon} className="mt-6">
        <div className="flex">
          <div className="relative flex-1">
            <Tag className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <Input
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              placeholder="Coupon code"
              className="rounded-r-none pl-9"
            />
          </div>
          <Button type="submit" className="rounded-l-none">
            Apply
          </Button>
        </div>
      </form>

      <Button onClick={paymentSubmit} className="mt-6 w-full">
        Proceed to Payment
      </Button>
    </Card>
  );
}

function PaymentMethodPicker({ methods, paymentMethod, setPaymentMethod, policy, totalPrice }) {
  const advance = Math.round((Number(totalPrice) * policy.advancePercent) / 100);

  const describe = (key) => {
    if (key === "cod") return "Pay the full amount in cash when your order arrives.";
    if (key === "online_full") return "Pay the full amount now via card or wallet.";
    if (key === "partial_advance") return `Pay ${policy.advancePercent}% (Rs. ${advance}) now, the rest on delivery.`;
    return "";
  };

  return (
    <Card variant="solid" className="p-5">
      <div className="mb-4 flex items-center gap-2 border-b border-border pb-4">
        <CreditCard className="size-5 text-brand" />
        <h2 className="text-[20px] font-semibold text-content">Payment Method</h2>
      </div>

      {methods.length === 0 ? (
        <p className="text-sm text-muted">
          No payment method is available for the items in your cart. Please contact the store.
        </p>
      ) : (
        <div className="space-y-3">
          {methods.map((m) => (
            <label
              key={m.key}
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-DEFAULT border p-3 transition",
                paymentMethod === m.key ? "border-brand bg-brand/10" : "border-border hover:border-brand/40"
              )}
            >
              <input
                type="radio"
                name="paymentMethod"
                className="mt-1"
                checked={paymentMethod === m.key}
                onChange={() => setPaymentMethod(m.key)}
              />
              <div>
                <div className="font-medium text-content">{m.label}</div>
                <div className="text-sm text-muted">{describe(m.key)}</div>
              </div>
            </label>
          ))}
        </div>
      )}
    </Card>
  );
}
