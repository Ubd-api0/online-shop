"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { Camera } from "lucide-react";
import api from "@/lib/axios";
import Cloudinary from "@/lib/cloudinary";
import { loadUser, updateUserInformation, clearErrors } from "@/redux/slices/user";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function ProfileInfo() {
  const { user, error, successMessage } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || "");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearErrors());
    }
    if (successMessage) {
      toast.success(successMessage);
    }
  }, [error, successMessage, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(updateUserInformation({ name, email, phoneNumber, password }));
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
    <Card variant="solid" className="p-5">
      <div className="flex justify-center">
        <div className="relative">
          <div className="relative size-[140px] overflow-hidden rounded-full border-4 border-green-500 bg-surface-alt">
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

      <form onSubmit={handleSubmit} className="mt-8">
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
            <Input type="number" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
          </div>
          <div>
            <Label className="mb-2 block">Password</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
        </div>

        <Button type="submit" variant="outline" className="mt-6">
          Update Profile
        </Button>
      </form>
    </Card>
  );
}
