"use client";

import { useState, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import api from "@/lib/api";
import { Reservation } from "@/types";
import { ReservationCard } from "./ReservationCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "../ui/button";

export function ReservationList() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("Active");
  const [slotTypeFilter, setSlotTypeFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const { ref, inView } = useInView({
    threshold: 0,
    triggerOnce: false,
  });

  const fetchReservations = async (currentPage: number) => {
    // Initial load, not subsequent pages
    if (currentPage === 1) setLoading(true);
    else setLoadingMore(true);

    setError(null);
    try {
      const params: {
        status?: string;
        slot_type?: string;
        page: number;
        limit: number;
        sortBy: string;
      } = {
        page: currentPage,
        limit: 9, // 3x3 grid
        sortBy: "start_time:asc",
      };

      if (statusFilter !== "all") {
        params.status = statusFilter;
      }
      if (slotTypeFilter !== "all") {
        params.slot_type = slotTypeFilter;
      }

      const response = await api.get("/reservations/me", { params });
      const newReservations = response.data.data.rows;

      setReservations((prev) =>
        currentPage === 1 ? newReservations : [...prev, ...newReservations]
      );
      setHasMore(newReservations.length > 0);
    } catch (err) {
      console.error("Failed to fetch reservations:", err);
      setError("Could not load your reservations. Please try again later.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    // When filters change, reset reservations and trigger a fetch for page 1.
    setReservations([]);
    setHasMore(true);
    setPage(1);
  }, [statusFilter, slotTypeFilter]);

  useEffect(() => {
    // This effect handles the actual data fetching.
    // It runs when the page changes (for infinite scroll) OR when the filters change (because the effect above sets page to 1).
    fetchReservations(page);
  }, [page, statusFilter, slotTypeFilter]);

  useEffect(() => {
    // Load more when the trigger element is in view
    if (inView && !loading && !loadingMore && hasMore) {
      setPage((prevPage) => prevPage + 1);
    }
  }, [inView, loading, loadingMore, hasMore]);
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Reservations</h1>
          <p className="text-muted-foreground">
            View your upcoming, active, and past bookings.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <Select value={slotTypeFilter} onValueChange={setSlotTypeFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Slot Types</SelectItem>
              <SelectItem value="Normal">Normal</SelectItem>
              <SelectItem value="VIP">VIP</SelectItem>
              <SelectItem value="Handicapped">Handicapped</SelectItem>
              <SelectItem value="Bike">Bike</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Checked-in">Checked-in</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Expired">Expired</SelectItem>
              <SelectItem value="Overstayed">Overstayed</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading reservations...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12 bg-card border border-destructive/50 rounded-lg">
          <p className="text-destructive">{error}</p>
          <Button
            variant="outline"
            onClick={() => fetchReservations(1)}
            className="mt-4"
          >
            Try Again
          </Button>
        </div>
      ) : reservations.length === 0 ? (
        <div className="text-center py-20 bg-card border rounded-lg">
          <h3 className="text-xl font-semibold">No Reservations Found</h3>
          <p className="text-muted-foreground mt-2">
            You don't have any reservations matching this filter.
          </p>
          <Button variant="default" className="mt-4" asChild>
            <a href="/">Find a Parking Spot</a>
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {reservations.map((reservation) => (
              <ReservationCard
                key={reservation.id}
                reservation={reservation}
                onUpdate={() => {
                  // When a card is updated (e.g., cancelled), reset and refetch from page 1
                  setReservations([]);
                  setHasMore(true);
                  setPage(1);
                }}
              />
            ))}
          </div>
          {/* Infinite scroll trigger and loader */}
          <div ref={ref} className="h-10">
            {loadingMore && (
              <div className="text-center py-6">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
