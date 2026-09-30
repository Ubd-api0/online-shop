"use client";

import { useState } from "react";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { Camera } from "lucide-react";
import api from "@/lib/axios";
import Cloudinary from "@/lib/cloudinary";
import { loadSeller } from "@/redux/slices/seller";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function ShopSettings() {
  const { seller } = useSelector((state) => state.seller);
  const dispatch = useDispatch();

  const [avatarPreview, setAvatarPreview] = useState(null);
  const [name, setName] = useState(seller?.name || "");
  const [email, setEmail] = useState(seller?.email || "");
  const [description, setDescription] = useState(seller?.description || "");
  const [address, setAddress] = useState(seller?.address || "");
  const [phoneNumber, setPhoneNumber] = useState(seller?.phoneNumber || "");
  const [zipCode, setZipCode] = useState(seller?.zipCode || "");

  const handleImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarPreview(URL.createObjectURL(file));
    try {
      const imageUrl = await Cloudinary.upload(file, "shop-avatar");
      await api.put("/shop/update-shop-avatar", { image: imageUrl });
      dispatch(loadSeller());
      toast.success("Avatar updated successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Error");
    }
  };

  const updateHandler = async (e) => {
    e.preventDefault();
    try {
      await api.put("/shop/update-seller-info", { name, email, address, zipCode, phoneNumber, description });
      toast.success("Shop info updated successfully!");
      dispatch(loadSeller());
    } catch (error) {
      toast.error(error.response?.data?.message);
    }
  };

  const avatarSrc = avatarPreview || seller?.avatar;

  return (
    <div className="flex w-full flex-col items-center">
      <div className="my-5 flex w-full max-w-xl flex-col">
        <div className="flex w-full items-center justify-center">
          <div className="relative">
            <div className="relative size-[160px] overflow-hidden rounded-full border border-border bg-surface-alt">
              {avatarSrc && <Image src={avatarSrc} alt="" fill className="object-cover" />}
            </div>
            <label
              htmlFor="shop-avatar"
              className="glass-surface absolute bottom-[6px] right-[10px] flex size-8 cursor-pointer items-center justify-center rounded-full"
            >
              <Camera className="size-4 text-content" />
            </label>
            <input type="file" id="shop-avatar" className="hidden" onChange={handleImage} accept="image/*" />
          </div>
        </div>

        <form className="mt-6 flex flex-col gap-4" onSubmit={updateHandler}>
          <div>
            <Label className="mb-2 block">Shop Name</Label>
            <Input required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label className="mb-2 block">Shop Email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="store@example.com" />
          </div>
          <div>
            <Label className="mb-2 block">Shop Description</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div>
            <Label className="mb-2 block">Shop Address</Label>
            <Input required value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
          <div>
            <Label className="mb-2 block">Shop Phone Number</Label>
            <Input required type="number" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
          </div>
          <div>
            <Label className="mb-2 block">Shop Zip Code</Label>
            <Input required type="number" value={zipCode} onChange={(e) => setZipCode(e.target.value)} />
          </div>
          <Button type="submit" className="self-start">
            Update Shop
          </Button>
        </form>

        <div className="mt-8">
          <PaymentSettingsPanel seller={seller} onSaved={() => dispatch(loadSeller())} />
        </div>
      </div>
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
