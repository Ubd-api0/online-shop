"use client";

import { useState } from "react";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { X, Pencil, Trash2 } from "lucide-react";
import { createCategory, updateCategory, deleteCategory } from "@/redux/slices/storefront";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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

  return (
    <div className="max-w-3xl">
      <Card variant="solid" className="mb-6 space-y-3 p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-content">{editingId ? "Edit category" : "Add category"}</h3>
          {editingId && (
            <button type="button" onClick={reset} className="text-muted">
              <X className="size-4" />
            </button>
          )}
        </div>
        <form onSubmit={submit} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Input value={form.name} onChange={set("name")} placeholder="Name *" />
            <Input value={form.subTitle} onChange={set("subTitle")} placeholder="Subtitle (optional)" />
          </div>
          <Input value={form.image} onChange={set("image")} placeholder="Image URL (optional)" />
          <Button disabled={saving} type="submit">
            {saving ? "Saving…" : editingId ? "Update" : "Add"}
          </Button>
        </form>
      </Card>

      <Card variant="solid" className="divide-y divide-border">
        {(categories || []).length === 0 && <p className="p-4 text-sm text-muted">No categories yet.</p>}
        {(categories || []).map((c) => (
          <div key={c._id} className="flex items-center gap-3 p-3">
            {c.image ? (
              <div className="relative size-10 shrink-0 overflow-hidden rounded-DEFAULT bg-surface-alt">
                <Image src={c.image} alt="" fill className="object-cover" />
              </div>
            ) : (
              <div className="size-10 shrink-0 rounded-DEFAULT bg-surface-alt" />
            )}
            <div className="min-w-0 flex-1">
              <div className="truncate font-medium text-content">{c.name}</div>
              {c.subTitle && <div className="truncate text-xs text-muted">{c.subTitle}</div>}
            </div>
            <button onClick={() => edit(c)} className="p-2 text-muted hover:text-brand">
              <Pencil className="size-4" />
            </button>
            <button onClick={() => remove(c)} className="p-2 text-muted hover:text-red-500">
              <Trash2 className="size-4" />
            </button>
          </div>
        ))}
      </Card>
    </div>
  );
}
