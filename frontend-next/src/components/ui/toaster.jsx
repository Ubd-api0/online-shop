"use client";

import { Toaster as Sonner } from "sonner";

export function Toaster(props) {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "glass-surface !rounded-DEFAULT !text-content group-[.toaster]:shadow-lg",
          description: "!text-muted",
          actionButton: "!bg-brand !text-white",
          cancelButton: "!bg-surface-alt !text-content",
        },
      }}
      {...props}
    />
  );
}
