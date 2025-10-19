"use client";

import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "next/navigation";
import { useEffect, ReactNode } from "react";
import { ProtectedRoute } from "./ProtectedRoute";

export function AdminRoute({ children }: { children: ReactNode }) {
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // This check runs after ProtectedRoute confirms authentication
    if (user && user.role !== "admin") {
      router.push("/"); // Redirect non-admins to the dashboard
    }
  }, [user, router]);

  // If the user is an admin, render the children. Otherwise, redirect.
  return (
    <ProtectedRoute>{user?.role === "admin" ? children : null}</ProtectedRoute>
  );
}
