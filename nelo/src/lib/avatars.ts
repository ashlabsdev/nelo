export const AVATARS = [
  {
    id: 1,
    src: "/avatars/avatar1.webp",
    name: "Avatar 1",
  },
  {
    id: 2,
    src: "/avatars/avatar2.webp",
    name: "Avatar 2",
  },
  {
    id: 3,
    src: "/avatars/avatar3.webp",
    name: "Avatar 3",
  },
  {
    id: 4,
    src: "/avatars/avatar4.webp",
    name: "Avatar 4",
  },
  {
    id: 5,
    src: "/avatars/avatar5.webp",
    name: "Avatar 5",
  },
];

export function getAvatarSrc(avatarId: number) {
  return (
    AVATARS.find((avatar) => avatar.id === avatarId)?.src ??
    "/avatars/avatar-1.png"
  );
}
