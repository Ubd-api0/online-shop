"use client";

import { useId } from "react";
import { Home, Briefcase, MapPin } from "lucide-react";
import { PROVINCES, provinceName, normalizeAddress } from "@/lib/shipping/pakistan";
import { CityCombobox } from "@/components/address/city-combobox";
import { PhoneInput } from "@/components/ui/phone-input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export const EMPTY_ADDRESS = {
  fullName: "",
  phone: "",
  country: "PK",
  province: "",
  city: "",
  address1: "",
  address2: "",
  zipCode: "",
  addressType: "Home",
};

export const PHONE_RE = /^(\+92|0092|0)?3\d{2}[- ]?\d{7}$/;

// Returns the first problem with an address, or null when it's complete.
export function addressError(a) {
  if (!a?.fullName?.trim()) return "Please enter the recipient's full name";
  if (!a?.phone?.trim()) return "Please enter a mobile number";
  if (!PHONE_RE.test(a.phone.replace(/\s/g, ""))) return "Enter a valid mobile number, e.g. 0300-1234567";
  if (!a?.province) return "Please choose a province";
  if (!a?.city?.trim()) return "Please choose a city";
  if (!a?.address1?.trim()) return "Please enter your house / street address";
  return null;
}

export function formatAddressLines(raw) {
  const a = normalizeAddress(raw);
  return [
    [a.address1, a.address2].filter(Boolean).join(", "),
    [a.city, provinceName(a.province), a.zipCode].filter(Boolean).join(", "),
  ].filter(Boolean);
}

const TYPES = [
  { key: "Home", icon: Home },
  { key: "Office", icon: Briefcase },
  { key: "Other", icon: MapPin },
];

const selectClass =
  "h-11 w-full rounded-DEFAULT border border-border bg-surface px-3 text-sm text-content outline-none transition-colors focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/50";

// `compact` keeps one column (for narrow containers like the side sheet).
export function AddressFields({ value, onChange, compact = false }) {
  const id = useId();
  const set = (k) => (e) => onChange({ ...value, [k]: e.target.value });

  return (
    <div className={cn("grid gap-4", !compact && "sm:grid-cols-2")}>
      <Field label="Full name" htmlFor={`${id}-name`}>
        <Input id={`${id}-name`} value={value.fullName} onChange={set("fullName")} placeholder="Recipient's name" autoComplete="name" />
      </Field>
      <Field label="Mobile number" htmlFor={`${id}-phone`}>
        <PhoneInput id={`${id}-phone`} value={value.phone} onChange={(phone) => onChange({ ...value, phone })} />
      </Field>
      <Field label="Province / Region" htmlFor={`${id}-prov`}>
        <select
          id={`${id}-prov`}
          className={selectClass}
          value={value.province}
          onChange={(e) => onChange({ ...value, province: e.target.value, city: "" })}
        >
          <option value="">Choose province</option>
          {PROVINCES.map((p) => (
            <option key={p.code} value={p.code}>
              {p.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="City" htmlFor={`${id}-city`}>
        <CityCombobox
          id={`${id}-city`}
          province={value.province}
          value={value.city}
          onChange={(city) => onChange({ ...value, city })}
          disabled={!value.province}
          placeholder={value.province ? "Search or choose your city" : "Choose a province first"}
        />
      </Field>
      <Field label="House / Street address" htmlFor={`${id}-a1`} className={compact ? undefined : "sm:col-span-2"}>
        <Input
          id={`${id}-a1`}
          value={value.address1}
          onChange={set("address1")}
          placeholder="House no., street, block / sector"
          autoComplete="address-line1"
        />
      </Field>
      <Field label="Area / Landmark (optional)" htmlFor={`${id}-a2`}>
        <Input id={`${id}-a2`} value={value.address2} onChange={set("address2")} placeholder="e.g. near Jamia Masjid" autoComplete="address-line2" />
      </Field>
      <Field label="Postal code (optional)" htmlFor={`${id}-zip`}>
        <Input id={`${id}-zip`} inputMode="numeric" value={value.zipCode} onChange={set("zipCode")} placeholder="e.g. 54000" autoComplete="postal-code" />
      </Field>
      <div className={compact ? undefined : "sm:col-span-2"}>
        <span className="mb-2 block text-sm font-medium text-content">Label this address</span>
        <div className="flex gap-2">
          {TYPES.map(({ key, icon: Icon }) => (
            <button
              type="button"
              key={key}
              onClick={() => onChange({ ...value, addressType: key })}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm transition-colors",
                value.addressType === key
                  ? "border-brand bg-brand/10 text-brand"
                  : "border-border text-muted hover:border-brand/50 hover:text-content"
              )}
            >
              <Icon className="size-3.5" />
              {key}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Field({ label, htmlFor, className, children }) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}
