"use client";

import { User } from "@providers/AuthProvider";
import { useState } from "react";
import Image from "next/image";
import { HiOutlineUserCircle } from "react-icons/hi2";
import { useAppContext } from "@providers/AppProvider";

export default function UsernameCollapsablePlate() {
  const { sidebarExpanded } = useAppContext();

  const [userInfo] = useState<User | null>(null);

  const guestUser: User = {
    userID: "",
    profilePicture: "/images/profile.png",
    email: "Not Signed In",
    username: "guestuser",
    firstName: "Not",
    lastName: "Signed In",
  };

  return (
    <div
      className={`
        flex items-center justify-center rounded-[12px]
        cursor-pointer hover:bg-bg-btn-hover
        transition-colors duration-300
        overflow-hidden
      `}
    >
      {/* Avatar (fixed, layout anchor) */}
      <div className="min-w-[40px] min-h-[40px] p-1 rounded-full flex items-center justify-center overflow-hidden">
        {userInfo?.profilePicture ? (
          <Image
            src={userInfo.profilePicture}
            alt="Profile Picture"
            width={40}
            height={40}
            className="rounded-full"
          />
        ) : (
          <HiOutlineUserCircle className="min-w-[28px] min-h-[28px]" />
        )}
      </div>

      {/* Text (animated like sidebar labels) */}
      <div
        className={`
          flex flex-col overflow-hidden whitespace-nowrap
          transition-all duration-450 ease-in-out
          ${sidebarExpanded
            ? "w-[160px] ml-2 opacity-100"
            : "w-0 ml-0 opacity-0"}
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
