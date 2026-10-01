"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { Camera, Loader2, Store, CreditCard } from "lucide-react";
import api from "@/lib/axios";
import Cloudinary from "@/lib/cloudinary";
import { loadUser } from "@/redux/slices/user";
import { normalizePhone, isValidPhone } from "@/lib/phone";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { PhoneInput } from "@/components/ui/phone-input";
import { cn } from "@/lib/utils";

// Settings are split into separate pages (own URLs), linked by these tabs.
const TABS = [
  { href: "/settings", label: "Store info", icon: Store },
  { href: "/settings/payments", label: "Payments", icon: CreditCard },
];

export function SettingsTabs() {
  const pathname = usePathname();
  return (
    <div className="mb-6 flex gap-1 border-b border-border">
      {TABS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "-mb-px flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
              active ? "border-brand text-brand-hover" : "border-transparent text-muted hover:text-content"
            )}
          >
            <Icon className="size-4" />
            {label}
          </Link>
        );
      })}
    </div>
  );
}

function Loading() {
  return (
    <div className="flex justify-center py-20">
      <Loader2 className="size-7 animate-spin text-brand" />
    </div>
  );
}

const fromSeller = (s) => ({
  name: s?.name || "",
  email: s?.email || "",
  description: s?.description || "",
  address: s?.address || "",
  phoneNumber: s?.phoneNumber ? String(s.phoneNumber) : "",
  zipCode: s?.zipCode && String(s.zipCode) !== "0" ? String(s.zipCode) : "", // old records stored 0
});

export function StoreInfoSettings() {
  const { seller } = useSelector((state) => state.seller);
  const dispatch = useDispatch();
  const [form, setForm] = useState(() => fromSeller(seller));
  const [loadedId, setLoadedId] = useState(seller?._id || null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [saving, setSaving] = useState(false);

  // The store record can arrive after first render (page opened by URL).
  useEffect(() => {
    if (seller?._id && seller._id !== loadedId) {
      setForm(fromSeller(seller));
      setLoadedId(seller._id);
    }
  }, [seller, loadedId]);

  if (!seller) return <Loading />;

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarPreview(URL.createObjectURL(file));
    try {
      const imageUrl = await Cloudinary.upload(file, "shop-avatar");
      await api.put("/shop/update-shop-avatar", { image: imageUrl });
      dispatch(loadUser());
      toast.success("Store logo updated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Upload failed");
    }
  };

  const save = async (e) => {
    e.preventDefault();
    if (form.phoneNumber && !isValidPhone(form.phoneNumber)) {
      toast.error("Please enter a valid phone number, e.g. 0300-1234567");
      return;
    }
    setSaving(true);
    try {
      await api.put("/shop/update-seller-info", { ...form, phoneNumber: normalizePhone(form.phoneNumber) });
      toast.success("Store info updated");
      dispatch(loadUser());
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not save");
    } finally {
      setSaving(false);
    }
  };

  const avatarSrc = avatarPreview || seller?.avatar;

  return (
    <div className="grid w-full max-w-5xl gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
      <Card variant="solid" className="flex flex-col items-center self-start p-6 text-center">
        <div className="relative">
          <div className="relative size-32 overflow-hidden rounded-full border border-border bg-surface-alt">
            {avatarSrc ? (
              <Image src={avatarSrc} alt="" fill className="object-cover" />
            ) : (
              <Store className="absolute inset-0 m-auto size-10 text-muted" />
            )}
          </div>
          <label
            htmlFor="shop-avatar"
            className="absolute bottom-1 right-1 flex size-9 cursor-pointer items-center justify-center rounded-full border border-border bg-surface shadow"
            title="Change logo"
          >
            <Camera className="size-4 text-content" />
          </label>
          <input type="file" id="shop-avatar" className="hidden" onChange={handleImage} accept="image/*" />
        </div>
        <p className="mt-4 font-semibold text-content">{seller?.name}</p>
        <p className="mt-1 text-xs text-muted">Logo shown on your store page and messages. Square images work best.</p>
      </Card>

      <Card variant="solid" className="p-6">
        <h2 className="mb-1 text-lg font-semibold text-content">Store details</h2>
        <p className="mb-5 text-sm text-muted">Shown to customers on the Contact page, invoices and emails.</p>
        <form className="grid gap-4 sm:grid-cols-2" onSubmit={save}>
          <div className="space-y-2">
            <Label htmlFor="s-name">Store name</Label>
            <Input id="s-name" required value={form.name} onChange={set("name")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="s-email">Contact email</Label>
            <Input id="s-email" type="email" value={form.email} onChange={set("email")} placeholder="store@example.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="s-phone">Phone number</Label>
            <PhoneInput id="s-phone" value={form.phoneNumber} onChange={(phoneNumber) => setForm((f) => ({ ...f, phoneNumber }))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="s-zip">Postal code</Label>
            <Input
              id="s-zip"
              inputMode="numeric"
              maxLength={5}
              value={form.zipCode}
              onChange={(e) => setForm((f) => ({ ...f, zipCode: e.target.value.replace(/\D/g, "").slice(0, 5) }))}
              placeholder="e.g. 54000"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="s-address">Store address</Label>
            <Input id="s-address" required value={form.address} onChange={set("address")} placeholder="Street, area, city" />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="s-desc">Description</Label>
            <Textarea id="s-desc" rows={3} value={form.description} onChange={set("description")} placeholder="A sentence or two about your store — shown on the About page." />
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="animate-spin" />} Save changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export function PaymentSettings() {
  const { seller } = useSelector((state) => state.seller);
  const dispatch = useDispatch();
  if (!seller) return <Loading />;
  // keyed so the form re-initialises if the store record changes
  return (
    <div className="w-full max-w-3xl">
      <PaymentSettingsPanel key={seller._id} seller={seller} onSaved={() => dispatch(loadUser())} />
    </div>
  );
}

const DEFAULT_PS = {
  codEnabled: true,
  onlineFullEnabled: true,
  partialAdvanceEnabled: false,
  advancePercent: 20,
  gateways: { stripe: true, paypal: true, easypaisa: false, jazzcash: false },
};

function PaymentSettingsPanel({ seller, onSaved }) {
  const [ps, setPs] = useState({
    ...DEFAULT_PS,
    ...(seller?.paymentSettings || {}),
    gateways: { ...DEFAULT_PS.gateways, ...(seller?.paymentSettings?.gateways || {}) },
  });
  const [saving, setSaving] = useState(false);

  const setFlag = (k) => (e) => setPs((p) => ({ ...p, [k]: e.target.checked }));
  const setGw = (k) => (e) => setPs((p) => ({ ...p, gateways: { ...p.gateways, [k]: e.target.checked } }));

  const save = async () => {
    if (!ps.codEnabled && !ps.onlineFullEnabled && !ps.partialAdvanceEnabled) {
      toast.error("Enable at least one payment method");
      return;
    }
    setSaving(true);
    try {
      await api.put("/shop/update-payment-settings", {
        paymentSettings: { ...ps, advancePercent: Number(ps.advancePercent) },
      });
      toast.success("Payment settings updated!");
      onSaved?.();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card variant="solid" className="mx-auto w-full p-6">
      <h3 className="mb-3 border-b border-border pb-3 text-lg font-semibold text-content">Payment Criteria</h3>
      <p className="mb-4 text-sm text-muted">
        Choose how customers may pay. These options are shown at checkout; a product can further restrict them via
        its own override.
      </p>

      <CheckRow label="Cash on Delivery" checked={ps.codEnabled} onChange={setFlag("codEnabled")} hint="Customer pays the full amount on delivery." />
      <CheckRow label="Full online payment" checked={ps.onlineFullEnabled} onChange={setFlag("onlineFullEnabled")} hint="Customer pays the whole order online before dispatch." />
      <CheckRow label="Partial advance" checked={ps.partialAdvanceEnabled} onChange={setFlag("partialAdvanceEnabled")} hint="Customer pays a percentage online now, the rest on delivery." />

      {ps.partialAdvanceEnabled && (
        <div className="flex items-center gap-3 py-2 pl-7">
          <label className="text-sm text-muted">Advance percentage</label>
          <Input
            type="number"
            min={1}
            max={100}
            value={ps.advancePercent}
            onChange={(e) => setPs((p) => ({ ...p, advancePercent: e.target.value }))}
            className="w-[90px]"
          />
          <span className="text-sm text-muted">%</span>
        </div>
      )}

      <h4 className="mb-1 mt-5 text-[15px] font-semibold text-content">Online gateways</h4>
      <div className="grid grid-cols-2 gap-x-6">
        <CheckRow label="Stripe (card)" checked={ps.gateways.stripe} onChange={setGw("stripe")} />
        <CheckRow label="PayPal" checked={ps.gateways.paypal} onChange={setGw("paypal")} />
        <CheckRow label="EasyPaisa" checked={ps.gateways.easypaisa} onChange={setGw("easypaisa")} />
        <CheckRow label="JazzCash" checked={ps.gateways.jazzcash} onChange={setGw("jazzcash")} />
      </div>

      <Button onClick={save} disabled={saving} className="mt-5">
        {saving ? "Saving…" : "Save payment settings"}
      </Button>
    </Card>
  );
}

function CheckRow({ label, checked, onChange, hint }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 py-2">
      <input type="checkbox" className="mt-1" checked={!!checked} onChange={onChange} />
      <span>
        <span className="block text-content">{label}</span>
        {hint && <span className="block text-sm text-muted">{hint}</span>}
      </span>
    </label>
  );
}
