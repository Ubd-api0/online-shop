"use client";

import { useEffect, useMemo } from "react";
import { ImagePlus, X } from "lucide-react";

// Local image picker for create-product / create-event: an "add" tile plus a
// removable preview per picked file. Files are uploaded by the form on submit.
export function ImagePicker({ id, files, onChange }) {
  const previews = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files]);
  useEffect(() => () => previews.forEach((u) => URL.revokeObjectURL(u)), [previews]);

  const add = (e) => {
    onChange([...files, ...Array.from(e.target.files)]);
    e.target.value = ""; // allow picking the same file again after removing it
  };
  const remove = (i) => onChange(files.filter((_, idx) => idx !== i));

  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
      <label
        htmlFor={id}
        className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-DEFAULT border-2 border-dashed border-border text-muted transition-colors hover:border-brand hover:text-brand"
      >
        <ImagePlus className="size-6" />
        <span className="text-xs font-medium">Add images</span>
      </label>
      <input type="file" id={id} className="hidden" multiple onChange={add} accept="image/*" />
      {previews.map((src, i) => (
        <div key={src} className="group relative aspect-square overflow-hidden rounded-DEFAULT border border-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="" className="size-full object-cover" />
          <button
            type="button"
            onClick={() => remove(i)}
            aria-label="Remove image"
            className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white hover:bg-danger"
          >
            <X className="size-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
