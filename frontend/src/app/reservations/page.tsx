import { ReservationList } from "@/components/reservations/ReservationList";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Reservations",
  description: "View your active and past parking reservations.",
};

export default function MyReservationsPage() {
  return (
    <div className="container mx-auto py-8">
      <ReservationList />
    </div>
  );
}
