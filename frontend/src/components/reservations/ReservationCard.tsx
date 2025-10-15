"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Reservation } from "@/types";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";

interface ReservationCardProps {
  reservation: Reservation;
  onCancel: (id: string) => void;
}

export function ReservationCard({
  reservation,
  onCancel,
}: ReservationCardProps) {
  const { toast } = useToast();

  const handleCancel = async () => {
    try {
      await api.patch(`/reservations/${reservation.id}/cancel`);
      toast({
        title: "Reservation cancelled",
        description: "Your reservation has been cancelled successfully.",
      });
      onCancel(reservation.id);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to cancel reservation. Please try again.",
        variant: "destructive",
      });
      console.error(err);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {reservation.slot?.facility?.name} - Slot{" "}
          {reservation.slot?.slot_number}
        </CardTitle>
        <CardDescription>{reservation.slot?.facility?.address}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm">
          Start: {new Date(reservation.start_time).toLocaleString()}
        </p>
        <p className="text-sm">
          End: {new Date(reservation.end_time).toLocaleString()}
        </p>
        <p className="text-sm">Status: {reservation.status}</p>
        <p className="text-sm">Amount: ${reservation.total_amount}</p>
        <p className="text-sm">Payment: {reservation.payment_status}</p>
        {reservation.vehicle_no && (
          <p className="text-sm">Vehicle: {reservation.vehicle_no}</p>
        )}
      </CardContent>
      <CardFooter>
        {reservation.status === "Active" && (
          <Button variant="destructive" onClick={handleCancel}>
            Cancel Reservation
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
