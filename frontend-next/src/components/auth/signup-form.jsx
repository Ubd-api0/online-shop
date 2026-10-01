"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, User, MailCheck } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";
import Cloudinary from "@/lib/cloudinary";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { GoogleButton, OrDivider } from "@/components/auth/google-button";

export function SignupForm({ next }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sentTo, setSentTo] = useState(null); // email the activation link went to
  const tooShort = password.length > 0 && password.length < 6;

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    setAvatar(file || null);
    e.target.value = ""; // allow re-picking the same file after Remove
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      let imageUrl = null;
      if (avatar) {
        imageUrl = await Cloudinary.upload(avatar, "users");
      }

      // API route reads `file` (matches backend/controller/user.js's field
      // name) — the original CRA app sent `image` here, a mismatch that
      // left every new signup with no avatar set.
      const { data } = await api.post("/user/create-user", {
        file: imageUrl,
        name,
        email,
        password,
      });

      toast.success(data.message);
      setSentTo(email.trim());
    } catch (error) {
      toast.error(error.response?.data?.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  if (sentTo) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <Card variant="solid" className="w-full max-w-md p-8 text-center">
          <MailCheck className="mx-auto size-16 text-brand" strokeWidth={1.5} />
          <h1 className="mt-4 text-xl font-semibold text-content">
            Check your inbox
          </h1>
          <p className="mt-2 text-sm text-muted">
            We sent an activation link to{" "}
            <span className="font-medium text-content">{sentTo}</span>. Open it
            to verify your email — you&apos;ll be signed in automatically. The
            link is valid for 24 hours.
          </p>
          <p className="mt-4 text-xs text-muted">
            Didn&apos;t get it? Check spam, or simply log in — we&apos;ll send a
            fresh link.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button onClick={() => router.push("/login")}>Go to login</Button>
            <Button variant="outline" onClick={() => setSentTo(null)}>
              Use another email
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center font-display text-3xl font-extrabold text-content">
          Register as new user
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card variant="glass" className="p-6 sm:p-10">
          <div className="mb-6 space-y-6">
            <GoogleButton next={next} label="Sign up with Google" />
            <OrDivider />
          </div>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                required
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email Address</Label>
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
                  autoComplete="new-password"
                  required
                  minLength={6}
                  aria-invalid={tooShort}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setVisible((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted"
                >
                  {visible ? (
                    <Eye className="size-5" />
                  ) : (
                    <EyeOff className="size-5" />
                  )}
                </button>
              </div>
              <p
                className={
                  tooShort ? "text-xs text-danger" : "text-xs text-muted"
                }
              >
                At least 6 characters
              </p>
            </div>

            <div className="space-y-1.5">
              <Label>
                Profile photo{" "}
                <span className="font-normal text-muted">(optional)</span>
              </Label>
              <div className="flex items-center gap-4">
                <span className="relative block size-10 shrink-0 overflow-hidden rounded-full bg-surface-alt">
                  {avatar ? (
                    <Image
                      src={URL.createObjectURL(avatar)}
                      alt="avatar"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <User className="absolute inset-0 m-auto size-6 text-muted" />
                  )}
                </span>
                <label
                  htmlFor="file-input"
                  className="cursor-pointer rounded-DEFAULT border border-border bg-surface px-4 py-2 text-sm font-medium text-muted shadow-sm hover:bg-surface-alt"
                >
                  {avatar ? "Change photo" : "Upload a photo"}
                  <input
                    type="file"
                    id="file-input"
                    accept=".jpg,.jpeg,.png,.webp"
                    onChange={handleFileInputChange}
                    className="sr-only"
                  />
                </label>
                {avatar && (
                  <button
                    type="button"
                    onClick={() => setAvatar(null)}
                    className="text-sm text-muted hover:text-danger"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Creating account…" : "Submit"}
            </Button>

            <div className="flex w-full items-center text-sm text-content">
              <span>Already have an account?</span>
              <Link href={next ? `/login?redirect=${encodeURIComponent(next)}` : "/login"} className="pl-2 text-brand hover:underline">
                Sign In
              </Link>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
