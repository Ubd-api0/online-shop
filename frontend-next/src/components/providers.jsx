"use client";

import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import { ReduxProvider } from "@/redux/provider";
import { CartHydrator } from "@/redux/cart-hydrator";
import { SessionLoader } from "@/redux/session-loader";

export function Providers({ children }) {
  return (
    <ReduxProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <CartHydrator />
        <SessionLoader />
        {children}
        <Toaster position="top-center" />
      </ThemeProvider>
    </ReduxProvider>
  );
}
