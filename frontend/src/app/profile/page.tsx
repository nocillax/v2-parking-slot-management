"use client";

import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ProfileForm } from "@/components/auth/ProfileForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import api from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { useToast } from "@/hooks/use-toast";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const { user, updateUser } = useAuthStore();
  const { toast } = useToast();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get("/auth/me");
        updateUser(response.data.data.user);
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to load profile",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (!user) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [user, updateUser, toast]);

  if (loading) {
    return (
      <ProtectedRoute>
        <main className="container mx-auto flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold md:text-3xl">Profile</h1>
          </div>
          <Card>
            <CardHeader className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="space-y-6">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-32 mt-6" />
            </CardContent>
          </Card>
        </main>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <main className="container mx-auto flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold md:text-3xl">Profile</h1>
        </div>
        <Card>
          <CardHeader className="space-y-2">
            <CardTitle className="text-xl">Personal Information</CardTitle>
            <CardDescription>
              View and update your profile information.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm user={user!} onUpdate={updateUser} />
          </CardContent>
        </Card>
      </main>
    </ProtectedRoute>
  );
}
