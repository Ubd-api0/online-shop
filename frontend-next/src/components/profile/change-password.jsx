"use client";

import { useState } from "react";
import { toast } from "sonner";
import api from "@/lib/axios";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function ChangePassword() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) return toast.error("New password must be at least 6 characters");
    if (newPassword !== confirmPassword) return toast.error("Passwords don't match");
    try {
      const { data } = await api.put("/user/update-user-password", {
        oldPassword,
        newPassword,
        confirmPassword,
      });
      toast.success(data?.message || "Password updated");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <Card variant="solid" className="p-5 sm:p-6">
      <form onSubmit={handleSubmit} className="max-w-md space-y-4">
        <div>
          <Label className="mb-2 block">Old Password</Label>
          <Input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
        </div>
        <div>
          <Label className="mb-2 block">New Password</Label>
          <Input type="password" minLength={6} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          <p className="mt-1 text-xs text-muted">At least 6 characters</p>
        </div>
        <div>
          <Label className="mb-2 block">Confirm Password</Label>
          <Input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
        <Button type="submit" className="w-full sm:w-auto">
          Update Password
        </Button>
      </form>
    </Card>
  );
}
