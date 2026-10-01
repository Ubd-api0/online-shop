"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

export function DialogContent({ className, children, ...props }) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay
        className={cn(
          "fixed inset-0 z-overlay bg-black/50 backdrop-blur-sm",
          "data-[state=open]:animate-[fade-in_150ms_ease-out]",
          "data-[state=closed]:animate-[fade-out_150ms_ease-in]"
        )}
      />
      <DialogPrimitive.Content
        className={cn(
          "fixed left-1/2 top-1/2 z-overlay w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2",
          "glass-surface rounded-lg p-6",
          "data-[state=open]:animate-[zoom-in_180ms_ease-out]",
          "data-[state=closed]:animate-[zoom-out_150ms_ease-in]",
          "focus:outline-none",
          className
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close
          className={cn(
            "absolute right-4 top-4 rounded-DEFAULT p-1 text-muted transition-colors",
            "hover:bg-surface-alt hover:text-content focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
          )}
        >
          <X className="size-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export function DialogHeader({ className, ...props }) {
  return <div className={cn("mb-4 flex flex-col gap-1.5", className)} {...props} />;
}

export function DialogTitle({ className, ...props }) {
  return (
    <DialogPrimitive.Title
      className={cn("font-display text-lg font-semibold text-content", className)}
      {...props}
    />
  );
}

export function DialogDescription({ className, ...props }) {
  return <DialogPrimitive.Description className={cn("text-sm text-muted", className)} {...props} />;
}

export function DialogFooter({ className, ...props }) {
  return (
    <div className={cn("mt-6 flex flex-col-reverse gap-2 400px:flex-row 400px:justify-end", className)} {...props} />
  );
}
