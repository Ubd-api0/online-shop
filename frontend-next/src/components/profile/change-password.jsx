"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loadUser } from "@/redux/slices/user";
import { toast } from "sonner";
import api from "@/lib/axios";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function ChangePassword() {
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  // Accounts created with Google have no password yet — let them create one.
  const creating = user?.passwordSet === false;
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
      toast.success(creating ? "Password created — you can now also sign in with email" : data?.message || "Password updated");
      if (creating) dispatch(loadUser());
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
        {!creating && (
          <div>
            <Label className="mb-2 block">Old Password</Label>
            <Input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
          </div>
        )}
        {creating && (
          <p className="rounded-DEFAULT bg-surface-alt px-3 py-2 text-sm text-muted">
            You signed up with Google. Create a password to also sign in with your email.
          </p>
        )}
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
          {creating ? "Create password" : "Update Password"}
        </Button>
      </form>
    </Card>
  );
}
