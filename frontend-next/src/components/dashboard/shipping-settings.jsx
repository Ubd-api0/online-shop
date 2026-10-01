"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Loader2, Truck, Zap, Calculator, MapPin } from "lucide-react";
import api from "@/lib/axios";
import { PROVINCES, provinceName } from "@/lib/shipping/pakistan";
import { CityCombobox } from "@/components/address/city-combobox";
import { ZONES, resolveShippingSettings, deliveryOptions } from "@/lib/shipping/rates";
import { formatPrice } from "@/lib/format";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const selectClass =
  "h-11 w-full rounded-DEFAULT border border-border bg-surface px-3 text-sm text-content outline-none focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/50";

export function ShippingSettings() {
  const [s, setS] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .get("/shop/shipping-settings")
      .then(({ data }) => setS(data.shippingSettings))
      .catch(() => toast.error("Could not load shipping settings"));
  }, []);

  if (!s) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="size-8 animate-spin text-brand" />
      </div>
    );
  }

  const set = (patch) => setS((prev) => ({ ...prev, ...patch }));
  const setRate = (zone, field, value) =>
    setS((prev) => ({ ...prev, rates: { ...prev.rates, [zone]: { ...prev.rates[zone], [field]: value } } }));
  const setExpress = (field, value) => setS((prev) => ({ ...prev, express: { ...prev.express, [field]: value } }));
  const toggleRemote = (code) =>
    set({
      remoteProvinces: s.remoteProvinces.includes(code)
        ? s.remoteProvinces.filter((c) => c !== code)
        : [...s.remoteProvinces, code],
    });

  const save = async () => {
    setSaving(true);
    try {
      const { data } = await api.put("/shop/shipping-settings", { shippingSettings: s });
      setS(data.shippingSettings);
      toast.success("Shipping settings saved");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5">
      <Card variant="solid" className="p-5">
        <h2 className="mb-1 flex items-center gap-2 text-lg font-semibold text-content">
          <MapPin className="size-5 text-brand" /> Ship-from location
        </h2>
        <p className="mb-4 text-sm text-muted">
          Delivery zones are worked out from here: same city, same province, other provinces, or remote areas.
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label>Province</Label>
            <select
              className={selectClass}
              value={s.originProvince}
              onChange={(e) => set({ originProvince: e.target.value, originCity: "" })}
            >
              {PROVINCES.map((p) => (
                <option key={p.code} value={p.code}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label>City</Label>
            <CityCombobox
              province={s.originProvince}
              value={s.originCity}
              onChange={(originCity) => set({ originCity })}
              placeholder="Choose the city you ship from"
            />
          </div>
          <div className="space-y-2">
            <Label>Default parcel weight (kg)</Label>
            <Input
              type="number"
              step="0.1"
              min="0.1"
              value={s.defaultWeightKg}
              onChange={(e) => set({ defaultWeightKg: e.target.value })}
            />
            <p className="text-xs text-muted">Used for products without their own weight.</p>
          </div>
        </div>
      </Card>

      <Card variant="solid" className="p-5">
        <h2 className="mb-1 flex items-center gap-2 text-lg font-semibold text-content">
          <Truck className="size-5 text-brand" /> Standard delivery rates
        </h2>
        <p className="mb-4 text-sm text-muted">
          Enter your courier&apos;s tariff: a price for the first 0.5 kg and for each extra 0.5 kg, plus the delivery time in
          days. Weights are rounded up to the next 0.5 kg, the way couriers bill.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="text-left text-muted">
                <th className="pb-2 font-medium">Zone</th>
                <th className="pb-2 font-medium">First 0.5 kg</th>
                <th className="pb-2 font-medium">Each extra 0.5 kg</th>
                <th className="pb-2 font-medium">Days (min – max)</th>
              </tr>
            </thead>
            <tbody>
              {ZONES.map((z) => (
                <tr key={z.key} className="border-t border-border">
                  <td className="py-2 pr-3 font-medium text-content">{z.label}</td>
                  <td className="py-2 pr-3">
                    <Input type="number" min="0" value={s.rates[z.key].firstHalfKg} onChange={(e) => setRate(z.key, "firstHalfKg", e.target.value)} />
                  </td>
                  <td className="py-2 pr-3">
                    <Input type="number" min="0" value={s.rates[z.key].extraHalfKg} onChange={(e) => setRate(z.key, "extraHalfKg", e.target.value)} />
                  </td>
                  <td className="py-2">
                    <div className="flex items-center gap-2">
                      <Input type="number" min="0" className="w-20" value={s.rates[z.key].etaMin} onChange={(e) => setRate(z.key, "etaMin", e.target.value)} />
                      <span className="text-muted">–</span>
                      <Input type="number" min="0" className="w-20" value={s.rates[z.key].etaMax} onChange={(e) => setRate(z.key, "etaMax", e.target.value)} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-5">
          <Label className="mb-2 block">Remote areas</Label>
          <div className="flex flex-wrap gap-2">
            {PROVINCES.filter((p) => p.code !== s.originProvince).map((p) => (
              <label
                key={p.code}
                className="flex cursor-pointer items-center gap-2 rounded-full border border-border px-3 py-1.5 text-sm text-content"
              >
                <input type="checkbox" className="accent-brand" checked={s.remoteProvinces.includes(p.code)} onChange={() => toggleRemote(p.code)} />
                {p.name}
              </label>
            ))}
          </div>
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card variant="solid" className="p-5">
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-content">
            <Zap className="size-5 text-brand" /> Express delivery
          </h2>
          <label className="mb-4 flex cursor-pointer items-center gap-2 text-sm text-content">
            <input type="checkbox" className="accent-brand" checked={!!s.express.enabled} onChange={(e) => setExpress("enabled", e.target.checked)} />
            Offer express delivery
          </label>
          {s.express.enabled && (
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label>Price ×</Label>
                <Input type="number" step="0.1" min="1" value={s.express.multiplier} onChange={(e) => setExpress("multiplier", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Min days</Label>
                <Input type="number" min="0" value={s.express.etaMin} onChange={(e) => setExpress("etaMin", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Max days</Label>
                <Input type="number" min="0" value={s.express.etaMax} onChange={(e) => setExpress("etaMax", e.target.value)} />
              </div>
              <p className="col-span-3 text-xs text-muted">Shown only in zones where it is faster than standard delivery.</p>
            </div>
          )}
        </Card>

        <Card variant="solid" className="p-5">
          <h2 className="mb-3 text-lg font-semibold text-content">Free delivery & COD</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Free standard delivery over</Label>
              <Input type="number" min="0" value={s.freeShippingThreshold} onChange={(e) => set({ freeShippingThreshold: e.target.value })} />
              <p className="text-xs text-muted">0 = never free</p>
            </div>
            <div className="space-y-2">
              <Label>COD handling fee</Label>
              <Input type="number" min="0" value={s.codFee} onChange={(e) => set({ codFee: e.target.value })} />
              <p className="text-xs text-muted">Added to Cash-on-Delivery orders</p>
            </div>
          </div>
        </Card>
      </div>

      <RatePreview settings={s} />

      <div className="flex justify-end">
        <Button onClick={save} disabled={saving} size="lg">
          {saving && <Loader2 className="animate-spin" />} Save shipping settings
        </Button>
      </div>
    </div>
  );
}

// Lets the owner sanity-check their tariff before saving.
function RatePreview({ settings }) {
  const [province, setProvince] = useState("SD");
  const [city, setCity] = useState("Karachi");
  const [weight, setWeight] = useState(1.2);
  const [subtotal, setSubtotal] = useState(3000);

  const result = useMemo(() => {
    const numeric = JSON.parse(JSON.stringify(settings), (k, v) => (typeof v === "string" && v !== "" && !isNaN(v) ? Number(v) : v));
    return deliveryOptions({
      settings: resolveShippingSettings(numeric),
      destination: { province, city },
      weightKg: Number(weight),
      subtotal: Number(subtotal),
    });
  }, [settings, province, city, weight, subtotal]);

  return (
    <Card variant="flat" className="p-5">
      <h2 className="mb-3 flex items-center gap-2 font-semibold text-content">
        <Calculator className="size-5 text-brand" /> Try a quote
      </h2>
      <div className="grid gap-3 sm:grid-cols-4">
        <select className={selectClass} value={province} onChange={(e) => { setProvince(e.target.value); setCity(""); }}>
          {PROVINCES.map((p) => (
            <option key={p.code} value={p.code}>
              {p.name}
            </option>
          ))}
        </select>
        <CityCombobox province={province} value={city} onChange={setCity} placeholder="City" />
        <Input type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} aria-label="Weight kg" />
        <Input type="number" value={subtotal} onChange={(e) => setSubtotal(e.target.value)} aria-label="Order value" />
      </div>
      <p className="mt-2 text-xs text-muted">Destination · weight (kg) · order value</p>
      {result && (
        <div className="mt-4 flex flex-wrap gap-3">
          {result.options.map((o) => (
            <div key={o.key} className="rounded-lg border border-border bg-surface px-4 py-3 text-sm">
              <p className="font-medium text-content">
                {o.label}: {o.free ? "FREE" : formatPrice(o.fee)}
              </p>
              <p className="text-muted">
                {ZONES.find((z) => z.key === result.zone)?.label} · {result.weightKg} kg billed · {o.etaMin}–{o.etaMax} days
              </p>
            </div>
          ))}
          <p className="w-full text-xs text-muted">
            to {city || "—"}, {provinceName(province)}
          </p>
        </div>
      )}
    </Card>
  );
}
