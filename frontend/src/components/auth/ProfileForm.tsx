"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { useState } from "react";

const profileSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  email: z.string().email("Invalid email address").max(255, "Email too long"),
  vehicle: z
    .string()
    .min(1, "Vehicle number is required")
    .max(20, "Vehicle number too long"),
});

type ProfileForm = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  user: {
    name: string;
    email: string;
    default_vehicle_no?: string;
    default_area_id?: string;
  };
  onUpdate: (user: any) => void;
}

export function ProfileForm({ user, onUpdate }: ProfileFormProps) {
  const [updating, setUpdating] = useState(false);
  const { toast } = useToast();

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name || "",
      email: user.email || "",
      vehicle: user.default_vehicle_no || "",
    },
  });

  const onSubmit = async (data: ProfileForm) => {
    setUpdating(true);
    try {
      const response = await api.patch("/auth/me", {
        name: data.name,
        email: data.email,
        default_vehicle_no: data.vehicle,
      });
      onUpdate(response.data.data.user);
      toast({
        title: "Success",
        description: "Profile updated successfully",
        variant: "success",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-medium">Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter your name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-medium">Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="Enter your email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="vehicle"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-medium">
                Default Vehicle Number
              </FormLabel>
              <FormControl>
                <Input placeholder="Enter vehicle number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={updating} className="mt-6">
          {updating ? "Updating..." : "Update Profile"}
        </Button>
      </form>
    </Form>
  );
}
