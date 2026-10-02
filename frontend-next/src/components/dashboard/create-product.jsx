"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { CreditCard, Images, Package, Tag } from "lucide-react";
import Cloudinary from "@/lib/cloudinary";
import { createProduct, clearErrors } from "@/redux/slices/products";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DASHBOARD_FORM_WIDTH, SectionCard, selectClass } from "@/components/dashboard/section-card";
import { ImagePicker } from "@/components/dashboard/image-picker";

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
    <form onSubmit={handleSubmit} className={DASHBOARD_FORM_WIDTH}>
      <SectionCard icon={Package} title="Product details" description="What customers see on the product page.">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>
              Name <span className="text-danger">*</span>
            </Label>
            <Input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your product name..." />
          </div>

          <div className="space-y-2">
            <Label>
              Description <span className="text-danger">*</span>
            </Label>
            <Textarea required rows={6} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Enter your product description..." />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>
                Category <span className="text-danger">*</span>
              </Label>
              <select required className={selectClass} value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="">Choose a category</option>
                {(categories || []).map((c) => (
                  <option value={c.name} key={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {(categories || []).length === 0 && (
                <p className="text-xs text-danger">No categories yet — add them under Dashboard → Categories.</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Tags</Label>
              <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="e.g. sofa, velvet, living room" />
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard icon={Tag} title="Pricing & inventory" description="Prices are in PKR. Weight is used to calculate delivery charges.">
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Original price</Label>
              <Input type="number" value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)} placeholder="Before discount" />
            </div>
            <div className="space-y-2">
              <Label>
                Price (with discount) <span className="text-danger">*</span>
              </Label>
              <Input required type="number" value={discountPrice} onChange={(e) => setDiscountPrice(e.target.value)} placeholder="What the customer pays" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label>
                Fulfillment <span className="text-danger">*</span>
              </Label>
              <select className={selectClass} value={fulfillment} onChange={(e) => setFulfillment(e.target.value)}>
                <option value="in_stock">In stock (sell from inventory)</option>
                <option value="made_to_order">Made to order (manufacture after purchase)</option>
              </select>
              <p className="text-xs text-muted">
                {madeToOrder
                  ? "Customers can always order; the item is produced per order and stock is not tracked."
                  : 'Customers see "Currently unavailable" once stock reaches 0.'}
              </p>
            </div>

            {madeToOrder ? (
              <div className="space-y-2">
                <Label>Lead time (days)</Label>
                <Input type="number" min={0} value={leadTimeDays} onChange={(e) => setLeadTimeDays(e.target.value)} placeholder='e.g. 7 — "ships in ~7 days"' />
              </div>
            ) : (
              <div className="space-y-2">
                <Label>
                  Stock <span className="text-danger">*</span>
                </Label>
                <Input required type="number" value={stock} onChange={(e) => setStock(e.target.value)} placeholder="Units available" />
              </div>
            )}

            <div className="space-y-2">
              <Label>Packed weight (kg)</Label>
              <Input type="number" step="0.1" min="0" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} placeholder="e.g. 1.5" />
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard icon={Images} title="Images" description="The first image is the main photo.">
        <ImagePicker id="upload" files={images} onChange={setImages} />
      </SectionCard>

      <SectionCard icon={CreditCard} title="Payment rules" description="Optional — limit how customers can pay for this product.">
        <label className="flex items-center gap-2 font-medium text-content">
          <input
            type="checkbox"
            checked={override.enabled}
            onChange={(e) => setOverride((o) => ({ ...o, enabled: e.target.checked }))}
          />
          Custom payment rules for this product
        </label>
        {override.enabled && (
          <div className="mt-3 space-y-3 text-sm text-content">
            <p className="text-muted">
              Unchecked options are blocked for any cart containing this product (intersected with the store settings).
            </p>
            <div className="grid gap-2 sm:grid-cols-3">
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
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span>Minimum advance %</span>
              <Input
                type="number"
                min={1}
                max={100}
                placeholder="store default"
                value={override.advancePercent}
                onChange={(e) => setOverride((o) => ({ ...o, advancePercent: e.target.value }))}
                className="w-[130px]"
              />
            </div>
          </div>
        )}
      </SectionCard>

      <div className="flex justify-end">
        <Button type="submit" disabled={submitting} className="w-full sm:w-auto sm:min-w-[180px]">
          {submitting ? "Creating…" : "Create product"}
        </Button>
      </div>
    </form>
  );
}
