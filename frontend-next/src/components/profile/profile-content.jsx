"use client";

import { ProfileInfo } from "@/components/profile/profile-info";
import { ProfileOrders, ProfileRefunds, ProfileTrackOrders } from "@/components/profile/profile-orders";
import { ChangePassword } from "@/components/profile/change-password";
import { ProfileAddress } from "@/components/profile/profile-address";

export function ProfileContent({ active }) {
  return (
    <div className="w-full">
      {active === 1 && <ProfileInfo />}
      {active === 2 && <ProfileOrders />}
      {active === 3 && <ProfileRefunds />}
      {active === 5 && <ProfileTrackOrders />}
      {active === 6 && <ChangePassword />}
      {active === 7 && <ProfileAddress />}
    </div>
  );
}
