"use client";

import { useEffect, useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
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
        <PageContainer>
          <div className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-5 w-72" />
            </div>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-4 w-2/3" />
              </CardHeader>
              <CardContent className="space-y-8 pt-6">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <Skeleton className="h-10 w-32" />
              </CardContent>
            </Card>
          </div>
        </PageContainer>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <PageContainer>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
            <p className="text-muted-foreground">
              View and manage your account details.
            </p>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your name and default vehicle number.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {user && <ProfileForm user={user} onUpdate={updateUser} />}
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    </ProtectedRoute>
  );
}
