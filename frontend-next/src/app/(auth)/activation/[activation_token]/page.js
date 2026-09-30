"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import api from "@/lib/axios";

export default function ActivationPage() {
  const { activation_token } = useParams();
  const router = useRouter();
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!activation_token) return;
    api
      .post("/user/activation", { activation_token })
      .then(() => {
        setTimeout(() => router.push("/login"), 2000);
      })
      .catch(() => setError(true));
  }, [activation_token, router]);

  return (
    <div className="flex h-screen w-full items-center justify-center">
      {error ? (
        <p className="text-red-500">Your token has expired.</p>
      ) : (
        <p className="text-green-500">Your account has been created successfully!</p>
      )}
    </div>
  );
}
