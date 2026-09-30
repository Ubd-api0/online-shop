"use client";

import { useState } from "react";
import { ProfileSidebar } from "@/components/profile/profile-sidebar";
import { ProfileContent } from "@/components/profile/profile-content";

export function ProfilePageClient() {
  const [active, setActive] = useState(1);

  return (
    <div className="mx-auto flex max-w-7xl gap-4 px-4 py-10 800px:px-6">
      <div className="w-14 shrink-0 800px:sticky 800px:top-[100px] 800px:w-[300px] 800px:self-start">
        <ProfileSidebar active={active} setActive={setActive} />
      </div>
      <div className="min-w-0 flex-1">
        <ProfileContent active={active} />
      </div>
    </div>
  );
}
