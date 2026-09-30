"use client";

import { useState } from "react";
import { Country, State } from "country-state-city";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { updateUserAddress, deleteUserAddress } from "@/redux/slices/user";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export function ProfileAddress() {
  const [open, setOpen] = useState(false);
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [addressType, setAddressType] = useState("");

  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!country || !city || !address1 || !zipCode || !addressType) {
      toast.error("Please fill all fields");
      return;
    }
    dispatch(updateUserAddress({ country, city, address1, address2, zipCode, addressType }));
    setOpen(false);
    setCountry("");
    setCity("");
    setZipCode("");
    setAddress1("");
    setAddress2("");
    setAddressType("");
  };

  const handleDelete = (item) => {
    dispatch(deleteUserAddress(item._id));
  };

  return (
    <div className="w-full">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-display text-2xl font-semibold text-content">My Addresses</h2>
        <Button onClick={() => setOpen(true)}>Add New</Button>
      </div>

      <div className="space-y-4">
        {(user?.addresses || []).map((item) => (
          <Card
            key={item._id}
            variant="solid"
            className="flex flex-col justify-between gap-4 p-4 md:flex-row md:items-center"
          >
            <div>
              <h4 className="font-semibold text-content">{item.addressType}</h4>
              <p className="text-sm text-muted">
                {item.address1} {item.address2}
              </p>
              <p className="text-sm text-muted">{user?.phoneNumber}</p>
            </div>
            <button onClick={() => handleDelete(item)} aria-label="Delete address">
              <Trash2 className="size-[22px] text-red-500" />
            </button>
          </Card>
        ))}
      </div>

      {(user?.addresses || []).length === 0 && (
        <p className="mt-10 text-center text-muted">No saved addresses</p>
      )}

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Add Address</SheetTitle>
          </SheetHeader>
          <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto p-5">
            <div>
              <Label className="mb-2 block">Country</Label>
              <select
                className="h-[45px] w-full rounded-DEFAULT border border-border bg-surface px-3 text-content outline-none focus:border-brand"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              >
                <option value="">Select Country</option>
                {Country.getAllCountries().map((item) => (
                  <option key={item.isoCode} value={item.isoCode}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label className="mb-2 block">State</Label>
              <select
                className="h-[45px] w-full rounded-DEFAULT border border-border bg-surface px-3 text-content outline-none focus:border-brand"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              >
                <option value="">Select State</option>
                {State.getStatesOfCountry(country).map((item) => (
                  <option key={item.isoCode} value={item.isoCode}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label className="mb-2 block">Address 1</Label>
              <Input value={address1} onChange={(e) => setAddress1(e.target.value)} />
            </div>
            <div>
              <Label className="mb-2 block">Address 2</Label>
              <Input value={address2} onChange={(e) => setAddress2(e.target.value)} />
            </div>
            <div>
              <Label className="mb-2 block">Zip Code</Label>
              <Input type="number" value={zipCode} onChange={(e) => setZipCode(e.target.value)} />
            </div>
            <div>
              <Label className="mb-2 block">Address Type</Label>
              <select
                className="h-[45px] w-full rounded-DEFAULT border border-border bg-surface px-3 text-content outline-none focus:border-brand"
                value={addressType}
                onChange={(e) => setAddressType(e.target.value)}
              >
                <option value="">Select Type</option>
                <option value="Home">Home</option>
                <option value="Office">Office</option>
                <option value="Default">Default</option>
              </select>
            </div>
            <Button type="submit" className="w-full">
              Save Address
            </Button>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
