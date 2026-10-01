"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

// Single login for everyone. On success we hard-redirect by role:
//   business_owner -> /dashboard      customer -> /
// A full reload guarantees the Redux session (loadUser) and the
// proxy.js route guard both see the fresh cookie.
export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/user/login-user", { email, password });
      toast.success("Login successful!");
      const isOwner = data?.user?.role === "business_owner";
      window.location.assign(isOwner ? "/dashboard" : "/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed, please try again");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center font-display text-3xl font-extrabold text-content">
          Login to your account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card variant="glass" className="p-6 sm:p-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={visible ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setVisible((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted"
                >
                  {visible ? <Eye className="size-5" /> : <EyeOff className="size-5" />}
                </button>
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Signing in…" : "Submit"}
            </Button>

            <div className="flex w-full items-center text-sm text-content">
              <span>Don&apos;t have an account?</span>
              <Link href="/sign-up" className="pl-2 text-brand hover:underline">
                Sign Up
              </Link>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
