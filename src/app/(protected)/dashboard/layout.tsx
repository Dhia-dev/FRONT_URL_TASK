"use client";

import { Navbar } from "@/components/layouts/navbar";
import { useAuth } from "@/hooks/use-auth";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <Navbar />
      <main className="pt-16">{children}</main>
    </>
  );
}
