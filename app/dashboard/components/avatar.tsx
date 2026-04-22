import type { JSX } from "react";

interface AvatarProps {
  src?: string;
  name: string;
}

export function Avatar({ src, name }: AvatarProps): JSX.Element {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        width={56}
        height={56}
        className="rounded-full border-2 border-[#7c6af7] object-cover w-14 h-14"
      />
    );
  }

  return (
    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#3d2a8a] to-[#7c6af7] flex items-center justify-center text-[22px] font-bold text-white border-2 border-[#7c6af7] shrink-0">
      {name.charAt(0).toUpperCase()}
    </div>
  );
}
