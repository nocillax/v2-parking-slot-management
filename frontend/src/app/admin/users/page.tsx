"use client";

import { useCallback, useEffect, useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { AdminRoute } from "@/components/auth/AdminRoute";
import { User } from "@/types";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("/users");
      setUsers(response.data.data.rows);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch users.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return (
    <AdminRoute>
      <PageContainer>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              User Management
            </h1>
            <p className="text-muted-foreground">
              View and manage all users in the system.
            </p>
          </div>
          {loading ? (
            <Skeleton className="h-96 w-full" />
          ) : (
            <DataTable columns={columns} data={users} onRefresh={fetchUsers} />
          )}
        </div>
      </PageContainer>
    </AdminRoute>
  );
}
