"use client";

import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "next/navigation";
import { useEffect, ReactNode, useState } from "react";

const LoadingScreen = () => (
  <div className="flex min-h-screen items-center justify-center">
    <p>Loading...</p>
  </div>
);

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Wait until the component has mounted on the client before checking auth
    // and redirecting. This avoids hydration mismatches.
    if (isMounted && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isMounted, router]);

  // While we wait for the client to mount, show a loading screen.
  // This prevents a flash of the protected content or a brief flash of the login page.
  if (!isMounted) {
    return <LoadingScreen />;
  }

  // If authenticated, render the children. Otherwise, the useEffect above will handle the redirect.
  return isAuthenticated ? <>{children}</> : null;
}
