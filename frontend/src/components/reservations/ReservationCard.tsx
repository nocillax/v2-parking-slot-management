"use client";

import { Reservation } from "@/types/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Car, Tag, ParkingSquare } from "lucide-react";
import dayjs from "dayjs";
import { Button } from "../ui/button";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import { useState } from "react";

interface ReservationCardProps {
  reservation: Reservation;
  onUpdate: () => void;
}

const getStatusVariant = (
  status: string
): "default" | "destructive" | "secondary" | "outline" => {
  switch (status) {
    case "Active":
    case "Checked-in":
      return "default";
    case "Cancelled":
    case "Expired":
    case "Overstayed":
      return "destructive";
    case "Completed":
      return "secondary";
    default:
      return "outline";
  }
};

export function ReservationCard({
  reservation,
  onUpdate,
}: ReservationCardProps) {
  const { id, slot, status, start_time, end_time, total_amount } = reservation;
  const { toast } = useToast();
  const [isCancelling, setIsCancelling] = useState(false);

  // Gracefully handle cases where slot or facility data might be missing
  if (!slot || !slot.facility) {
    return null; // Or return a skeleton/error card
  }
  const { facility, location_tag, slot_type } = slot;

  const startTime = dayjs(start_time);
  const endTime = dayjs(end_time);

  // A reservation is cancellable if its status is 'Active' and the start time is in the future.
  const isCancellable = status === "Active" && startTime.isAfter(dayjs());

  const handleCancel = async () => {
    if (!isCancellable) return;

    setIsCancelling(true);
    try {
      await api.patch(`/reservations/${id}/cancel`, {}); // Send an empty body
      toast({
        title: "Reservation Cancelled",
        description: "Your reservation has been successfully cancelled.",
        variant: "success",
      });
      onUpdate(); // Trigger the parent component to refetch the list
    } catch (error: any) {
      toast({
        title: "Cancellation Failed",
        description:
          error.response?.data?.message ||
          "Could not cancel the reservation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <Card className="flex flex-col justify-between">
      <CardHeader>
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-lg">{facility.name}</CardTitle>
          <Badge variant={getStatusVariant(status)} className="capitalize">
            {status}
          </Badge>
        </div>
        <CardDescription className="flex items-center gap-2 pt-1">
          <MapPin className="h-4 w-4" />
          {facility.address}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 text-sm">
        <div className="flex items-center">
          <ParkingSquare className="h-4 w-4 mr-3 text-muted-foreground" />
          <span className="font-medium">Slot:</span>
          <span className="ml-auto text-right">
            {location_tag} ({slot_type})
          </span>
        </div>
        <div className="flex items-center">
          <Calendar className="h-4 w-4 mr-3 text-muted-foreground" />
          <span className="font-medium">Date:</span>
          <span className="ml-auto">{startTime.format("MMM D, YYYY")}</span>
        </div>
        <div className="flex items-center">
          <Clock className="h-4 w-4 mr-3 text-muted-foreground" />
          <span className="font-medium">Time:</span>
          <span className="ml-auto">
            {startTime.format("h:mm A")} - {endTime.format("h:mm A")}
          </span>
        </div>
        {reservation.vehicle_number && (
          <div className="flex items-center">
            <Car className="h-4 w-4 mr-3 text-muted-foreground" />
            <span className="font-medium">Vehicle No:</span>
            <span className="ml-auto font-mono">
              {reservation.vehicle_number}
            </span>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between items-center bg-muted/50 px-6 py-3">
        <div className="flex items-center">
          <Tag className="h-4 w-4 mr-3 text-muted-foreground" />
          <span className="font-medium">Total Amount</span>
          <span className="ml-2 text-lg font-bold text-primary">
            ৳{total_amount}
          </span>
        </div>
        {isCancellable && (
          <Button
            variant="destructive"
            size="sm"
            onClick={handleCancel}
            disabled={isCancelling}
          >
            {isCancelling ? "Cancelling..." : "Cancel"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
