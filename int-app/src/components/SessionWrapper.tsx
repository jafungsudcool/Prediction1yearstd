"use client"; // บังคับให้เป็น Client Component เพื่อใช้ SessionProvider

import { SessionProvider } from "next-auth/react";

export default function SessionWrapper({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}