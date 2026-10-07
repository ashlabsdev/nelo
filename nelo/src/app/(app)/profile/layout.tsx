import {
  ReactNode,
} from "react";

import ProfileNav from "@/components/profile/profile-nav";

export default function ProfileLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <section className="mx-auto max-w-4xl">

      <ProfileNav />

      {children}

    </section>
  );
}