"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Facility } from "@/types/types";
import api from "@/lib/api";
import { Calendar, Clock, Car } from "lucide-react";

interface ReservationDialogProps {
  facility: Facility;
  trigger?: React.ReactNode;
}

export function ReservationDialog({
  facility,
  trigger,
}: ReservationDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    slotType: "",
    count: "1",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (
      !formData.slotType ||
      !formData.count ||
      !formData.startDate ||
      !formData.startTime ||
      !formData.endDate ||
      !formData.endTime
    ) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    const count = parseInt(formData.count);
    if (count < 1 || count > 10) {
      toast({
        title: "Validation Error",
        description: "Number of slots must be between 1 and 10.",
        variant: "destructive",
      });
      return;
    }

    const startDateTime = new Date(
      `${formData.startDate}T${formData.startTime}`
    );
    const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);
    const now = new Date();
    const minStartTime = new Date(now.getTime() + 30 * 60 * 1000); // 30 minutes from now

    if (startDateTime <= minStartTime) {
      toast({
        title: "Validation Error",
        description: "Start time must be at least 30 minutes from now.",
        variant: "destructive",
      });
      return;
    }

    if (endDateTime <= startDateTime) {
      toast({
        title: "Validation Error",
        description: "End time must be after start time.",
        variant: "destructive",
      });
      return;
    }

    const durationHours =
      (endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60 * 60);
    if (durationHours > 24) {
      toast({
        title: "Validation Error",
        description: "Reservations cannot exceed 24 hours.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      const reservationData = {
        facility_id: facility.id,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        requests: [
          {
            slot_type: formData.slotType,
            count: count,
          },
        ],
      };

      const response = await api.post("/reservations", reservationData);

      toast({
        title: "Reservation Successful!",
        description: `Successfully reserved ${count} ${formData.slotType} slot(s).`,
      });

      setOpen(false);
      resetForm();

      // Optionally refresh the slots view
      window.location.reload();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to create reservation.";
      toast({
        title: "Reservation Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      slotType: "",
      count: "1",
      startDate: "",
      startTime: "",
      endDate: "",
      endTime: "",
    });
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const getMinTime = (date: string) => {
    const today = new Date().toISOString().split("T")[0];
    if (date === today) {
      const now = new Date();
      now.setMinutes(now.getMinutes() + 30); // Add 30 minutes buffer
      return now.toTimeString().slice(0, 5);
    }
    return "00:00";
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button>Reserve Now</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Reserve Parking Slots
          </DialogTitle>
          <DialogDescription>
            Reserve parking slots at {facility.name}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Slot Type */}
          <div className="space-y-2">
            <Label htmlFor="slotType">Slot Type</Label>
            <Select
              value={formData.slotType}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, slotType: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select slot type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Normal">Normal (৳25/hr)</SelectItem>
                <SelectItem value="VIP">VIP (৳50/hr)</SelectItem>
                <SelectItem value="Handicapped">
                  Handicapped (৳25/hr)
                </SelectItem>
                <SelectItem value="Bike">Bike (৳15/hr)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Number of Slots */}
          <div className="space-y-2">
            <Label htmlFor="count">Number of Slots</Label>
            <Input
              id="count"
              type="number"
              min="1"
              max="10"
              value={formData.count}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, count: e.target.value }))
              }
              placeholder="1"
            />
          </div>

          {/* Start Time */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Start Time
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="date"
                min={getMinDate()}
                value={formData.startDate}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    startDate: e.target.value,
                  }))
                }
              />
              <Input
                type="time"
                value={formData.startTime}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    startTime: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          {/* End Time */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              End Time
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="date"
                min={formData.startDate || getMinDate()}
                value={formData.endDate}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, endDate: e.target.value }))
                }
              />
              <Input
                type="time"
                value={formData.endTime}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, endTime: e.target.value }))
                }
              />
            </div>
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating Reservation..." : "Reserve Slots"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
