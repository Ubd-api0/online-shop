"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, User } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";
import Cloudinary from "@/lib/cloudinary";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function SignupForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    setAvatar(file || null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      router.push("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center font-display text-3xl font-extrabold text-content">
          Register as new user
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card variant="glass" className="p-6 sm:p-10">
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
                  minLength={4}
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

            <div className="flex items-center gap-4">
              <span className="relative block size-10 shrink-0 overflow-hidden rounded-full bg-surface-alt">
                {avatar ? (
                  <Image src={URL.createObjectURL(avatar)} alt="avatar" fill className="object-cover" />
                ) : (
                  <User className="absolute inset-0 m-auto size-6 text-muted" />
                )}
              </span>
              <label
                htmlFor="file-input"
                className="cursor-pointer rounded-DEFAULT border border-border bg-surface px-4 py-2 text-sm font-medium text-muted shadow-sm hover:bg-surface-alt"
              >
                Upload a file
                <input
                  type="file"
                  id="file-input"
                  accept=".jpg,.jpeg,.png"
                  onChange={handleFileInputChange}
                  className="sr-only"
                />
              </label>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Creating account…" : "Submit"}
            </Button>

            <div className="flex w-full items-center text-sm text-content">
              <span>Already have an account?</span>
              <Link href="/login" className="pl-2 text-brand hover:underline">
                Sign In
              </Link>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
