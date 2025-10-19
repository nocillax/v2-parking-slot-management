"use client";

import { useCallback, useEffect, useState } from "react";
import * as z from "zod";
import { PageContainer } from "@/components/layout/PageContainer";
import { AdminRoute } from "@/components/auth/AdminRoute";
import { DataTable } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { User } from "@/types/types";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { columns } from "./columns";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, Trash, UserPlus, Pencil } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UserForm, formSchema } from "./UserForm";
import { DeleteConfirmationDialog } from "@/components/shared/DeleteConfirmationDialog";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [usersToDelete, setUsersToDelete] = useState<string[]>([]);

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

  const handleFormSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      const data = { ...values };
      // Don't send an empty password field on update
      if (selectedUser && !data.password) {
        delete data.password;
      }

      if (selectedUser) {
        // Update user
        await api.put(`/users/${selectedUser.id}`, data);
        toast({ title: "Success", description: "User updated successfully." });
      } else {
        // Create user
        await api.post("/users", data);
        toast({ title: "Success", description: "User created successfully." });
      }
      await fetchUsers();
      setIsFormOpen(false);
      setSelectedUser(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "An error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      await api.delete("/users", { data: { ids: usersToDelete } });
      toast({
        title: "Success",
        description: "Selected users have been deleted.",
      });
      await fetchUsers();
      setIsDeleteConfirmOpen(false);
      setUsersToDelete([]);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete users.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openCreateForm = () => {
    setSelectedUser(null);
    setIsFormOpen(true);
  };

  const openUpdateForm = (user: User) => {
    setSelectedUser(user);
    setIsFormOpen(true);
  };

  const openDeleteConfirm = (ids: string[]) => {
    setUsersToDelete(ids);
    setIsDeleteConfirmOpen(true);
  };

  const formTitle = selectedUser ? "Update User" : "Create New User";

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
            <DataTable
              columns={columns}
              data={users}
              filterKey="email"
              filterPlaceholder="Filter by email..."
              toolbarActions={(table) => {
                const selectedRows = table.getFilteredSelectedRowModel().rows;
                const numSelected = selectedRows.length;

                return (
                  <div className="flex w-full items-center gap-2">
                    {numSelected > 0 && (
                      <>
                        <Button
                          variant="outline"
                          disabled={numSelected !== 1}
                          onClick={() =>
                            openUpdateForm(selectedRows[0].original)
                          }
                        >
                          <Pencil className="mr-2 h-4 w-4" /> Update
                        </Button>
                        <Button
                          variant="outline"
                          className="border text-red-500 hover:bg-red-500/10 hover:text-red-600"
                          onClick={() =>
                            openDeleteConfirm(
                              selectedRows.map((r) => r.original.id)
                            )
                          }
                        >
                          <Trash className="mr-2 h-4 w-4" /> Delete (
                          {numSelected})
                        </Button>
                      </>
                    )}
                    <div className="ml-auto flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={fetchUsers}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      <Button onClick={openCreateForm}>
                        <UserPlus className="mr-2 h-4 w-4" /> Create User
                      </Button>
                    </div>
                  </div>
                );
              }}
            />
          )}
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{formTitle}</DialogTitle>
            </DialogHeader>
            <UserForm
              onSubmit={handleFormSubmit}
              initialData={selectedUser || undefined}
              isSubmitting={isSubmitting}
            />
          </DialogContent>
        </Dialog>
        <DeleteConfirmationDialog
          open={isDeleteConfirmOpen}
          onOpenChange={setIsDeleteConfirmOpen}
          onConfirm={handleDelete}
          title={`Are you sure you want to delete ${usersToDelete.length} user(s)?`}
          description="This action cannot be undone. This will permanently delete the selected user(s)."
        />
      </PageContainer>
    </AdminRoute>
  );
}
