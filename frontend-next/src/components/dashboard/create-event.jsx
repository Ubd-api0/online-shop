"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { PlusCircle } from "lucide-react";
import Cloudinary from "@/lib/cloudinary";
import { createEvent, clearErrors } from "@/redux/slices/events";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function CreateEventForm() {
  const { seller } = useSelector((state) => state.seller);
  const { success, error } = useSelector((state) => state.events);
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
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const today = new Date().toISOString().slice(0, 10);
  const minEndDate = startDate
    ? new Date(startDate.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    : "";

  const handleStartDateChange = (e) => {
    setStartDate(new Date(e.target.value));
    setEndDate(null);
  };

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearErrors());
    }
    if (success) {
      toast.success("Event created successfully!");
      router.push("/dashboard-events");
    }
  }, [error, success, dispatch, router]);

  const handleImageChange = (e) => {
    setImages((prev) => [...prev, ...Array.from(e.target.files)]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      toast.error("Please choose event start and end dates");
      return;
    }
    setSubmitting(true);
    try {
      const imageUrls = await Promise.all(images.map((img) => Cloudinary.upload(img, "events")));
      dispatch(
        createEvent({
          images: imageUrls,
          name,
          description,
          category,
          tags,
          originalPrice,
          discountPrice,
          stock,
          shopId: seller._id,
          start_Date: startDate.toISOString(),
          Finish_Date: endDate.toISOString(),
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
            Name <span className="text-red-500">*</span>
          </Label>
          <Input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your event product name..." />
        </div>

        <div>
          <Label className="mb-2 block">
            Description <span className="text-red-500">*</span>
          </Label>
          <Textarea required rows={8} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Enter your event product description..." />
        </div>

        <div>
          <Label className="mb-2 block">
            Category <span className="text-red-500">*</span>
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
        </div>

        <div>
          <Label className="mb-2 block">Tags</Label>
          <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Enter your event product tags..." />
        </div>

        <div>
          <Label className="mb-2 block">Original Price</Label>
          <Input type="number" value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)} placeholder="Enter your event product price..." />
        </div>

        <div>
          <Label className="mb-2 block">
            Price (With Discount) <span className="text-red-500">*</span>
          </Label>
          <Input required type="number" value={discountPrice} onChange={(e) => setDiscountPrice(e.target.value)} placeholder="Enter your event product price with discount..." />
        </div>

        <div>
          <Label className="mb-2 block">
            Product Stock <span className="text-red-500">*</span>
          </Label>
          <Input required type="number" value={stock} onChange={(e) => setStock(e.target.value)} placeholder="Enter your event product stock..." />
        </div>

        <div>
          <Label className="mb-2 block">
            Event Start Date <span className="text-red-500">*</span>
          </Label>
          <Input
            type="date"
            value={startDate ? startDate.toISOString().slice(0, 10) : ""}
            onChange={handleStartDateChange}
            min={today}
          />
        </div>

        <div>
          <Label className="mb-2 block">
            Event End Date <span className="text-red-500">*</span>
          </Label>
          <Input
            type="date"
            value={endDate ? endDate.toISOString().slice(0, 10) : ""}
            onChange={(e) => setEndDate(new Date(e.target.value))}
            min={minEndDate}
          />
        </div>

        <div>
          <Label className="mb-2 block">
            Upload Images <span className="text-red-500">*</span>
          </Label>
          <input type="file" id="event-upload" className="hidden" multiple onChange={handleImageChange} accept="image/*" />
          <div className="flex flex-wrap items-center gap-2">
            <label htmlFor="event-upload" className="cursor-pointer text-muted hover:text-brand">
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
