"use client";

import { useState } from "react";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { X, Pencil, Trash2, FolderPlus, FolderOpen } from "lucide-react";
import { createCategory, updateCategory, deleteCategory } from "@/redux/slices/storefront";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/dashboard/section-card";
import { cn } from "@/lib/utils";

const EMPTY = { name: "", subTitle: "", image: "" };

export function CategoryManager() {
  const dispatch = useDispatch();
  const { categories } = useSelector((state) => state.storefront);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const reset = () => {
    setForm(EMPTY);
    setEditingId(null);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Name is required");
    setSaving(true);
    try {
      if (editingId) {
        await dispatch(updateCategory({ id: editingId, payload: form })).unwrap();
        toast.success("Category updated");
      } else {
        await dispatch(createCategory(form)).unwrap();
        toast.success("Category added");
      }
      reset();
    } catch (err) {
      toast.error(err?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const edit = (c) => {
    setEditingId(c._id);
    setForm({ name: c.name, subTitle: c.subTitle || "", image: c.image || "" });
  };

  const remove = async (c) => {
    if (!window.confirm(`Delete "${c.name}"?`)) return;
    await dispatch(deleteCategory(c._id));
    toast.success("Category deleted");
    if (editingId === c._id) reset();
  };

  const list = categories || [];

  return (
    <div className="mx-auto grid w-full max-w-5xl items-start gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
      <SectionCard
        icon={editingId ? Pencil : FolderPlus}
        title={editingId ? "Edit category" : "Add category"}
        description="Categories group your products in the shop menu and filters."
        className="lg:sticky lg:top-[88px]"
        action={
          editingId && (
            <button type="button" onClick={reset} aria-label="Cancel editing" className="p-1 text-muted hover:text-content">
              <X className="size-4" />
            </button>
          )
        }
      >
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label>
              Name <span className="text-danger">*</span>
            </Label>
            <Input value={form.name} onChange={set("name")} placeholder="e.g. Sofas" />
          </div>
          <div className="space-y-2">
            <Label>Subtitle</Label>
            <Input value={form.subTitle} onChange={set("subTitle")} placeholder="Optional, e.g. Comfortable seating" />
          </div>
          <div className="space-y-2">
            <Label>Image URL</Label>
            <Input value={form.image} onChange={set("image")} placeholder="Optional, https://…" />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button disabled={saving} type="submit" className="flex-1 sm:flex-none sm:min-w-[140px]">
              {saving ? "Saving…" : editingId ? "Update category" : "Add category"}
            </Button>
            {editingId && (
              <Button type="button" variant="outline" onClick={reset}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </SectionCard>

      <SectionCard icon={FolderOpen} title={`Your categories (${list.length})`}>
        {list.length === 0 && <p className="text-sm text-muted">No categories yet. Add your first one.</p>}
        <div className="-mx-4 divide-y divide-border sm:-mx-5">
          {list.map((c) => (
            <div key={c._id} className={cn("flex items-center gap-3 px-4 py-3 sm:px-5", editingId === c._id && "bg-surface-alt")}>
              {c.image ? (
                <div className="relative size-12 shrink-0 overflow-hidden rounded-DEFAULT bg-surface-alt">
                  <Image src={c.image} alt="" fill sizes="48px" className="object-cover" />
                </div>
              ) : (
                <div className="size-12 shrink-0 rounded-DEFAULT bg-surface-alt" />
              )}
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium text-content">{c.name}</div>
                {c.subTitle && <div className="truncate text-xs text-muted">{c.subTitle}</div>}
              </div>
              <button onClick={() => edit(c)} aria-label={`Edit ${c.name}`} className="p-2 text-muted hover:text-brand">
                <Pencil className="size-4" />
              </button>
              <button onClick={() => remove(c)} aria-label={`Delete ${c.name}`} className="p-2 text-muted hover:text-danger">
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
