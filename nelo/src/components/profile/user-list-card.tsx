import Image from "next/image";
import Link from "next/link";

import {
  getAvatarSrc,
} from "@/lib/avatars";

type UserListCardProps = {
  profile: {
    username: string;
    avatar_id: number;
    bio:
      | string
      | null;
  };
};

export default function UserListCard({
  profile,
}: UserListCardProps) {
  return (
    <Link
      href={`/users/${profile.username}`}
      className="theme-surface theme-border flex items-center gap-4 rounded-xl border p-4 transition hover:opacity-80"
    >
      <Image
        src={getAvatarSrc(
          profile.avatar_id
        )}
        alt={`${profile.username} avatar`}
        width={52}
        height={52}
        className="h-13 w-13 rounded-full object-cover"
      />

      <div className="min-w-0">
        <p className="font-semibold">
          {profile.username}
        </p>

        {profile.bio && (
          <p className="theme-text-secondary mt-1 truncate text-sm">
            {profile.bio}
          </p>
        )}
      </div>
    </Link>
  );
}