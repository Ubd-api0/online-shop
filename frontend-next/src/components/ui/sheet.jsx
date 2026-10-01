"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetClose = DialogPrimitive.Close;

const sideClasses = {
  right:
    "right-0 top-0 h-full w-[85%] max-w-sm border-l " +
    "data-[state=open]:animate-[slide-in-from-right_220ms_ease-out] " +
    "data-[state=closed]:animate-[slide-out-to-right_180ms_ease-in]",
  left:
    "left-0 top-0 h-full w-[85%] max-w-sm border-r " +
    "data-[state=open]:animate-[slide-in-from-left_220ms_ease-out] " +
    "data-[state=closed]:animate-[slide-out-to-left_180ms_ease-in]",
};

export function SheetContent({ className, side = "right", children, ...props }) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay
        className={cn(
          "fixed inset-0 z-[1000] bg-black/50 backdrop-blur-sm",
          "data-[state=open]:animate-[fade-in_150ms_ease-out]",
          "data-[state=closed]:animate-[fade-out_150ms_ease-in]"
        )}
      />
      <DialogPrimitive.Content
        className={cn(
          "fixed z-[1000] flex flex-col glass-surface border-border",
          sideClasses[side],
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

export function SheetHeader({ className, ...props }) {
  return (
    <div
      className={cn("flex items-center justify-between border-b border-border p-4", className)}
      {...props}
    />
  );
}

export function SheetTitle({ className, ...props }) {
  return (
    <DialogPrimitive.Title
      className={cn("font-display text-base font-semibold text-content", className)}
      {...props}
    />
  );
}
