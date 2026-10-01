"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import api from "@/lib/axios";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ActivationPage() {
  const { activation_token } = useParams();
  const [state, setState] = useState({ status: "loading", message: "" });
  const sent = useRef(false);

  useEffect(() => {
    // React runs effects twice in development — verify the link only once.
    if (!activation_token || sent.current) return;
    sent.current = true;
    api
      .post("/user/activation", { activation_token })
      .then(({ data }) => {
        setState({ status: "success", message: "" });
        // The activation response signs the user in; reload so the session loads.
        const to = data?.user?.role === "business_owner" ? "/dashboard" : "/";
        setTimeout(() => window.location.assign(to), 1800);
      })
      .catch((err) =>
        setState({ status: "error", message: err.response?.data?.message || "This activation link is invalid." })
      );
  }, [activation_token]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card variant="solid" className="w-full max-w-md p-8 text-center">
        {state.status === "loading" && (
          <>
            <Loader2 className="mx-auto size-14 animate-spin text-brand" />
            <h1 className="mt-4 text-xl font-semibold text-content">Verifying your email…</h1>
          </>
        )}
        {state.status === "success" && (
          <>
            <CheckCircle2 className="mx-auto size-16 text-success" strokeWidth={1.5} />
            <h1 className="mt-4 text-xl font-semibold text-content">Your email is verified!</h1>
            <p className="mt-2 text-sm text-muted">You&apos;re signed in. Taking you to the store…</p>
          </>
        )}
        {state.status === "error" && (
          <>
            <XCircle className="mx-auto size-16 text-danger" strokeWidth={1.5} />
            <h1 className="mt-4 text-xl font-semibold text-content">We couldn&apos;t verify this link</h1>
            <p className="mt-2 text-sm text-muted">{state.message}</p>
            <div className="mt-6 flex justify-center gap-3">
              <Link href="/login">
                <Button>Log in</Button>
              </Link>
              <Link href="/sign-up">
                <Button variant="outline">Sign up</Button>
              </Link>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
