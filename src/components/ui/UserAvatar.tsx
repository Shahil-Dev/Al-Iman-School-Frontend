"use client";

import React, { useEffect, useState } from "react";
import type { User } from "@/src/context/UserContext";
import { getUserDisplay } from "@/src/lib/userDisplay";

interface UserAvatarProps {
  user: User | null;
  size?: number;
  loading?: boolean;
  className?: string;
}

export default function UserAvatar({
  user,
  size = 40,
  loading = false,
  className = "",
}: UserAvatarProps) {
  const { name, photoUrl, initial } = getUserDisplay(user);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [photoUrl]);

  const showPhoto = Boolean(photoUrl) && !imageFailed;
  // Show a skeleton instead of a letter while the profile photo may still arrive
  const showSkeleton = !showPhoto && loading;

  return (
    <span
      role="img"
      aria-label={name || "User"}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.42) }}
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden font-bold select-none ${
        showSkeleton ? "animate-pulse" : ""
      } ${className}`}
    >
      {showPhoto ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photoUrl as string}
          alt=""
          draggable={false}
          onError={() => setImageFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : showSkeleton ? null : (
        <span aria-hidden="true">{initial}</span>
      )}
    </span>
  );
}