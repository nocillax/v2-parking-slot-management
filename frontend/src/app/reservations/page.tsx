"use client";

import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Skeleton } from "@/components/ui/skeleton";
import api from "@/lib/api";
import { Reservation } from "@/types";
import { ReservationCard } from "@/components/reservations/ReservationCard";

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const response = await api.get("/reservations/me");
      setReservations(response.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch reservations. Please try again later.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleReservationUpdate = (cancelledId: string) => {
    setReservations((prev) =>
      prev.filter((reservation) => reservation.id !== cancelledId)
    );
  };

  return (
    <ProtectedRoute>
      <main className="container mx-auto flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold md:text-3xl">My Reservations</h1>
        </div>
        {loading && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-[200px] w-full" />
            ))}
          </div>
        )}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && !error && reservations.length === 0 && (
          <p className="text-muted-foreground">No reservations found.</p>
        )}
        {!loading && !error && reservations.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {reservations.map((reservation) => (
              <ReservationCard
                key={reservation.id}
                reservation={reservation}
                onCancel={handleReservationUpdate}
              />
            ))}
          </div>
        )}
      </main>
    </ProtectedRoute>
  );
}
