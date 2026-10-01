"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

// Follows the app theme (Sonner defaults to light, which put light theme text
// on a white toast in dark mode) and uses a solid surface + status colors.
export function Toaster(props) {
  const { resolvedTheme } = useTheme();
  return (
    <Sonner
      theme={resolvedTheme === "dark" ? "dark" : "light"}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "!bg-surface !text-content !border !border-border !rounded-DEFAULT !shadow-xl",
          title: "!text-content !font-medium",
          description: "!text-muted",
          success: "[&_[data-icon]]:!text-success",
          error: "[&_[data-icon]]:!text-danger",
          warning: "[&_[data-icon]]:!text-warning",
          info: "[&_[data-icon]]:!text-info",
          actionButton: "!bg-brand !text-white",
          cancelButton: "!bg-surface-alt !text-content",
          closeButton: "!bg-surface !text-content !border-border",
        },
      }}
      {...props}
    />
  );
}
