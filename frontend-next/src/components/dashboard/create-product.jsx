"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { PlusCircle } from "lucide-react";
import Cloudinary from "@/lib/cloudinary";
import { createProduct, clearErrors } from "@/redux/slices/products";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function CreateProductForm() {
  const { seller } = useSelector((state) => state.seller);
  const { success, error } = useSelector((state) => state.products);
  const { categories } = useSelector((state) => state.storefront);
  const router = useRouter();
  const dispatch = useDispatch();

  const [images, setImages] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [stock, setStock] = useState("");
  const [fulfillment, setFulfillment] = useState("in_stock");
  const [leadTimeDays, setLeadTimeDays] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const madeToOrder = fulfillment === "made_to_order";
  const [override, setOverride] = useState({
    enabled: false,
    codEnabled: true,
    onlineFullEnabled: true,
    partialAdvanceEnabled: true,
    advancePercent: "",
  });

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearErrors());
    }
    if (success) {
      toast.success("Product created successfully!");
      router.push("/dashboard-products");
    }
  }, [error, success, dispatch, router]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages((prev) => [...prev, ...files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const imageUrls = await Promise.all(images.map((img) => Cloudinary.upload(img, "products")));
      dispatch(
        createProduct({
          images: imageUrls,
          name,
          description,
          category,
          tags,
          originalPrice,
          discountPrice,
          stock: madeToOrder ? 0 : stock,
          fulfillment,
          leadTimeDays: madeToOrder ? Number(leadTimeDays) || 0 : 0,
          ...(Number(weightKg) > 0 ? { weightKg: Number(weightKg) } : {}),
          shopId: seller._id,
          paymentOverride: override.enabled
            ? {
                enabled: true,
                codEnabled: override.codEnabled,
                onlineFullEnabled: override.onlineFullEnabled,
                partialAdvanceEnabled: override.partialAdvanceEnabled,
                ...(override.advancePercent ? { advancePercent: Number(override.advancePercent) } : {}),
              }
            : { enabled: false },
        })
      );
    } catch (err) {
      toast.error(err.message || "Upload failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card variant="solid" className="w-full max-w-3xl p-4 sm:p-6">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <Label className="mb-2 block">
            Name <span className="text-danger">*</span>
          </Label>
          <Input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your product name..." />
        </div>

        <div>
          <Label className="mb-2 block">
            Description <span className="text-danger">*</span>
          </Label>
          <Textarea required rows={8} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Enter your product description..." />
        </div>

        <div>
          <Label className="mb-2 block">
            Category <span className="text-danger">*</span>
          </Label>
          <select
            required
            className="h-11 w-full rounded-DEFAULT border border-border bg-surface px-3 text-content outline-none focus:border-brand"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Choose a category</option>
            {(categories || []).map((c) => (
              <option value={c.name} key={c._id}>
                {c.name}
              </option>
            ))}
          </select>
          {(categories || []).length === 0 && (
            <p className="mt-1 text-xs text-danger">No categories yet — add them under Dashboard → Categories.</p>
          )}
        </div>

        <div>
          <Label className="mb-2 block">Tags</Label>
          <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Enter your product tags..." />
        </div>

        <div>
          <Label className="mb-2 block">Original Price</Label>
          <Input type="number" value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)} placeholder="Enter your product price..." />
        </div>

        <div>
          <Label className="mb-2 block">
            Price (With Discount) <span className="text-danger">*</span>
          </Label>
          <Input required type="number" value={discountPrice} onChange={(e) => setDiscountPrice(e.target.value)} placeholder="Enter your product price with discount..." />
        </div>

        <div>
          <Label className="mb-2 block">
            Fulfillment <span className="text-danger">*</span>
          </Label>
          <select
            className="h-11 w-full rounded-DEFAULT border border-border bg-surface px-3 text-content outline-none focus:border-brand"
            value={fulfillment}
            onChange={(e) => setFulfillment(e.target.value)}
          >
            <option value="in_stock">In stock (sell from inventory)</option>
            <option value="made_to_order">Made to order (manufacture after purchase)</option>
          </select>
          <p className="mt-1 text-xs text-muted">
            {madeToOrder
              ? "Customers can always order; the item is produced per order and stock is not tracked."
              : 'Customers see "Currently unavailable" once stock reaches 0.'}
          </p>
        </div>

        {madeToOrder ? (
          <div>
            <Label className="mb-2 block">Lead time (days)</Label>
            <Input type="number" min={0} value={leadTimeDays} onChange={(e) => setLeadTimeDays(e.target.value)} placeholder='e.g. 7 — shown to customers as "ships in ~7 days"' />
          </div>
        ) : (
          <div>
            <Label className="mb-2 block">
              Product Stock <span className="text-danger">*</span>
            </Label>
            <Input required type="number" value={stock} onChange={(e) => setStock(e.target.value)} placeholder="Enter your product stock..." />
          </div>
        )}

        <div>
          <Label className="mb-2 block">Packed weight (kg)</Label>
          <Input
            type="number"
            step="0.1"
            min="0"
            value={weightKg}
            onChange={(e) => setWeightKg(e.target.value)}
            placeholder="e.g. 1.5 — used to calculate delivery charges"
          />
        </div>

        <div className="rounded-DEFAULT border border-border p-3">
          <label className="flex items-center gap-2 font-medium text-content">
            <input
              type="checkbox"
              checked={override.enabled}
              onChange={(e) => setOverride((o) => ({ ...o, enabled: e.target.checked }))}
            />
            Custom payment rules for this product
          </label>
          {override.enabled && (
            <div className="mt-3 space-y-2 pl-1 text-sm text-content">
              <p className="text-muted">
                Unchecked options are blocked for any cart containing this product (intersected with the store settings).
              </p>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={override.codEnabled}
                  onChange={(e) => setOverride((o) => ({ ...o, codEnabled: e.target.checked }))}
                />
                Allow Cash on Delivery
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={override.onlineFullEnabled}
                  onChange={(e) => setOverride((o) => ({ ...o, onlineFullEnabled: e.target.checked }))}
                />
                Allow full online payment
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={override.partialAdvanceEnabled}
                  onChange={(e) => setOverride((o) => ({ ...o, partialAdvanceEnabled: e.target.checked }))}
                />
                Allow partial advance
              </label>
              <div className="flex items-center gap-2">
                <span>Minimum advance %</span>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  placeholder="store default"
                  value={override.advancePercent}
                  onChange={(e) => setOverride((o) => ({ ...o, advancePercent: e.target.value }))}
                  className="w-[110px]"
                />
              </div>
            </div>
          )}
        </div>

        <div>
          <Label className="mb-2 block">
            Upload Images <span className="text-danger">*</span>
          </Label>
          <input type="file" id="upload" className="hidden" multiple onChange={handleImageChange} accept="image/*" />
          <div className="flex flex-wrap items-center gap-2">
            <label htmlFor="upload" className="cursor-pointer text-muted hover:text-brand">
              <PlusCircle className="size-8" />
            </label>
            {images.map((img, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={URL.createObjectURL(img)} alt="" className="size-[100px] rounded-DEFAULT object-cover" />
            ))}
          </div>
        </div>

        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? "Creating…" : "Create"}
        </Button>
      </form>
    </Card>
  );
}
