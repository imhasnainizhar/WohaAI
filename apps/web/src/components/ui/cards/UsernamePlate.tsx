"use client";

import { User } from "@/providers/AuthProvider";
import { useState } from "react";
import Image from "next/image";
import { HiOutlineUserCircle } from "react-icons/hi2";

export default function UsernamePlate() {

  const [userInfo] = useState<User | null>(null);

  const guestUser: User = {
    id: "",
    profilePicture: "/images/profile.png",
    email: "Not Signed In",
    username: "guestuser",
    firstName: "Not",
    lastName: "Signed In",
  };

  return (
    <div
      className={`
        flex items-center justify-start rounded-[12px]
        cursor-pointer hover:bg-bg-btn-hover
        active:bg-bg-btn-active
        transition-colors duration-300
        overflow-hidden w-full
      `}
    >
      {/* Avatar (fixed, layout anchor) */}
      <div className="w-auto h-auto p-1 m-1 rounded-full flex items-center justify-center overflow-hidden">
        {userInfo?.profilePicture ? (
          <Image
            src={userInfo.profilePicture}
            alt="Profile Picture"
            width={40}
            height={40}
            className="rounded-full"
          />
        ) : (
          <HiOutlineUserCircle className="min-w-[30px] min-h-[30px]" />
        )}
      </div>

      {/* Text (animated like sidebar labels) */}
      <div
        className={`
          flex flex-col overflow-hidden whitespace-nowrap
          transition-all duration-450 ease-in-out
        `}
      >
        <div className="text-text-primary text-[14px] font-medium truncate capitalize">
          {userInfo?.firstName || guestUser.firstName}{" "}
          {userInfo?.lastName || guestUser.lastName}
        </div>
        <div className="text-text-secondary text-[12px] font-medium truncate lowercase">
          @{userInfo?.username || guestUser.username}
        </div>
      </div>
    </div>
  );
}
