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
    <Card variant="solid" className="p-5">
      <h2 className="mb-6 text-center font-display text-2xl font-semibold text-content">
        Change Password
      </h2>
      <form onSubmit={handleSubmit} className="mx-auto max-w-xl space-y-4">
        <div>
          <Label className="mb-2 block">Old Password</Label>
          <Input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
        </div>
        <div>
          <Label className="mb-2 block">New Password</Label>
          <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
        </div>
        <div>
          <Label className="mb-2 block">Confirm Password</Label>
          <Input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
        <Button type="submit" variant="outline" className="w-full">
          Update Password
        </Button>
      </form>
    </Card>
  );
}
