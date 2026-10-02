"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { CalendarDays, Images, Package, Tag } from "lucide-react";
import Cloudinary from "@/lib/cloudinary";
import { createEvent, clearErrors } from "@/redux/slices/events";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DASHBOARD_FORM_WIDTH, SectionCard, selectClass } from "@/components/dashboard/section-card";
import { ImagePicker } from "@/components/dashboard/image-picker";

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
    <form onSubmit={handleSubmit} className={DASHBOARD_FORM_WIDTH}>
      <SectionCard icon={Package} title="Event details" description="The product featured in this time-limited sale.">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>
              Name <span className="text-danger">*</span>
            </Label>
            <Input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your event product name..." />
          </div>

          <div className="space-y-2">
            <Label>
              Description <span className="text-danger">*</span>
            </Label>
            <Textarea required rows={6} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Enter your event product description..." />
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
            </div>
            <div className="space-y-2">
              <Label>Tags</Label>
              <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="e.g. sale, sofa, eid" />
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard icon={Tag} title="Pricing & stock" description="Prices are in PKR.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label>Original price</Label>
            <Input type="number" value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)} placeholder="Before discount" />
          </div>
          <div className="space-y-2">
            <Label>
              Price (with discount) <span className="text-danger">*</span>
            </Label>
            <Input required type="number" value={discountPrice} onChange={(e) => setDiscountPrice(e.target.value)} placeholder="Event price" />
          </div>
          <div className="space-y-2">
            <Label>
              Stock <span className="text-danger">*</span>
            </Label>
            <Input required type="number" value={stock} onChange={(e) => setStock(e.target.value)} placeholder="Units available" />
          </div>
        </div>
      </SectionCard>

      <SectionCard icon={CalendarDays} title="Schedule" description="An event runs for at least 3 days.">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>
              Start date <span className="text-danger">*</span>
            </Label>
            <Input
              type="date"
              value={startDate ? startDate.toISOString().slice(0, 10) : ""}
              onChange={handleStartDateChange}
              min={today}
            />
          </div>
          <div className="space-y-2">
            <Label>
              End date <span className="text-danger">*</span>
            </Label>
            <Input
              type="date"
              value={endDate ? endDate.toISOString().slice(0, 10) : ""}
              onChange={(e) => setEndDate(new Date(e.target.value))}
              min={minEndDate}
              disabled={!startDate}
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard icon={Images} title="Images" description="The first image is the main photo.">
        <ImagePicker id="event-upload" files={images} onChange={setImages} />
      </SectionCard>

      <div className="flex justify-end">
        <Button type="submit" disabled={submitting} className="w-full sm:w-auto sm:min-w-[180px]">
          {submitting ? "Creating…" : "Create event"}
        </Button>
      </div>
    </form>
  );
}
