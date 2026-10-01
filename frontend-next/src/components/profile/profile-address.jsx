"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { Trash2, Pencil, Plus, MapPin } from "lucide-react";
import { updateUserAddress, deleteUserAddress } from "@/redux/slices/user";
import { normalizeAddress } from "@/lib/shipping/pakistan";
import { AddressFields, EMPTY_ADDRESS, addressError, formatAddressLines } from "@/components/address/address-fields";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export function ProfileAddress() {
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [draft, setDraft] = useState(null); // address being added / edited

  const addresses = (user?.addresses || []).map((a) => ({ ...EMPTY_ADDRESS, ...normalizeAddress(a) }));

  const save = async (e) => {
    e.preventDefault();
    const err = addressError(draft);
    if (err) return toast.error(err);
    const res = await dispatch(updateUserAddress(draft));
    if (res.error) return toast.error(res.payload || "Could not save address");
    toast.success("Address saved");
    setDraft(null);
  };

  return (
    <div className="w-full">
      <div className="mb-4 flex justify-end">
        <Button onClick={() => setDraft({ ...EMPTY_ADDRESS, fullName: user?.name || "" })}>
          <Plus /> Add new
        </Button>
      </div>

      {addresses.length === 0 ? (
        <Card variant="solid" className="flex flex-col items-center gap-2 p-10 text-center">
          <MapPin className="size-10 text-muted" />
          <p className="text-muted">No saved addresses yet. Add one to check out faster.</p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {addresses.map((item) => (
            <Card key={item._id} variant="solid" className="flex justify-between gap-4 p-4">
              <div className="min-w-0">
                <div className="mb-1 flex items-center gap-2">
                  <span className="font-semibold text-content">{item.fullName || user?.name}</span>
                  <Badge variant="muted">{item.addressType}</Badge>
                </div>
                {item.phone && <p className="text-sm text-muted">{item.phone}</p>}
                {formatAddressLines(item).map((l) => (
                  <p key={l} className="text-sm text-muted">
                    {l}
                  </p>
                ))}
                {addressError(item) && <p className="mt-1 text-xs text-warning">Incomplete — edit to add missing details</p>}
              </div>
              <div className="flex shrink-0 flex-col gap-3">
                <button onClick={() => setDraft({ ...item })} aria-label="Edit address" className="text-muted hover:text-brand">
                  <Pencil className="size-[18px]" />
                </button>
                <button onClick={() => dispatch(deleteUserAddress(item._id))} aria-label="Delete address" className="text-danger">
                  <Trash2 className="size-[18px]" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Sheet open={!!draft} onOpenChange={(o) => !o && setDraft(null)}>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>{draft?._id ? "Edit address" : "Add address"}</SheetTitle>
          </SheetHeader>
          {draft && (
            <form onSubmit={save} className="space-y-5 overflow-y-auto p-5">
              <AddressFields value={draft} onChange={setDraft} compact />
              <Button type="submit" className="w-full">
                Save address
              </Button>
            </form>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
