"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { Camera } from "lucide-react";
import api from "@/lib/axios";
import Cloudinary from "@/lib/cloudinary";
import { loadUser, updateUserInformation, clearErrors, clearMessages } from "@/redux/slices/user";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PhoneInput } from "@/components/ui/phone-input";
import { normalizePhone, isValidMobile } from "@/lib/phone";

export function ProfileInfo() {
  const { user, error, successMessage } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || "");
  const [password, setPassword] = useState("");

  // Opened directly by URL, the user record may arrive after first render.
  useEffect(() => {
    if (!user) return;
    setName((v) => v || user.name || "");
    setEmail((v) => v || user.email || "");
    setPhoneNumber((v) => v || user.phoneNumber || "");
  }, [user]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearErrors());
    }
    if (successMessage) {
      toast.success(successMessage);
      dispatch(clearMessages());
    }
  }, [error, successMessage, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (phoneNumber && !isValidMobile(phoneNumber)) {
      toast.error("Please enter a valid mobile number, e.g. 0300-1234567");
      return;
    }
    dispatch(updateUserInformation({ name, email, phoneNumber: normalizePhone(phoneNumber), password }));
  };

  const handleImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const imageUrl = await Cloudinary.upload(file, "avatars");
      await api.put("/user/update-avatar", { image: imageUrl });
      dispatch(loadUser());
      toast.success("Avatar updated successfully!");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Upload failed");
    }
  };

  return (
    <Card variant="solid" className="p-5 sm:p-6">
      <div className="flex justify-center">
        <div className="relative">
          <div className="relative size-24 overflow-hidden rounded-full border-4 border-brand/30 bg-surface-alt sm:size-28">
            {user?.avatar && <Image src={user.avatar} alt="avatar" fill className="object-cover" />}
          </div>
          <label
            htmlFor="avatar"
            className="glass-surface absolute bottom-1 right-1 flex size-9 cursor-pointer items-center justify-center rounded-full"
          >
            <Camera className="size-5 text-content" />
          </label>
          <input type="file" id="avatar" className="hidden" onChange={handleImage} accept="image/*" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Label className="mb-2 block">Full Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label className="mb-2 block">Email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <Label className="mb-2 block">Phone Number</Label>
            <PhoneInput value={phoneNumber} onChange={setPhoneNumber} />
          </div>
          <div>
            <Label className="mb-2 block">Current password (to confirm)</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
        </div>

        <Button type="submit" className="mt-6 w-full sm:w-auto">
          Update Profile
        </Button>
      </form>
    </Card>
  );
}
