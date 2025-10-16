"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slot, Facility } from "@/types";
import api from "@/lib/api";
import { Car, Bike, Crown, Accessibility, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatSlotTypeForAPI } from "@/utils/formatters";
import { getSlotPrice } from "@/utils/priceConfig";

interface SlotsDialogProps {
  facility: Facility;
  children?: React.ReactNode;
}

const getSlotIcon = (slotType: string) => {
  switch (slotType) {
    case "VIP":
      return <Crown className="h-4 w-4" />;
    case "Handicapped":
      return <Accessibility className="h-4 w-4" />;
    case "Bike":
      return <Bike className="h-4 w-4" />;
    default:
      return <Car className="h-4 w-4" />;
  }
};

export function SlotsDialog({ facility, children }: SlotsDialogProps) {
  const [open, setOpen] = useState(false);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlotType, setSelectedSlotType] = useState<string>("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [reservationDialogOpen, setReservationDialogOpen] = useState(false);
  const [selectedSlotCount, setSelectedSlotCount] = useState<number>(1);
  const [reserving, setReserving] = useState(false);
  const { toast } = useToast();

  const fetchSlots = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/facilities/${facility.id}/slots`);
      setSlots(response.data.data.rows);
    } catch (err) {
      setError("Failed to fetch slots. Please try again.");
      console.error("Fetch slots error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchSlots();
    }
  }, [open]);

  // Filter out occupied slots, as they are not reservable
  const availableSlots = slots.filter((slot) => slot.status !== "Occupied");

  // Filter slots by type
  const filteredSlots =
    selectedSlotType === "all"
      ? availableSlots
      : availableSlots.filter(
          (slot) =>
            slot.slot_type.toLowerCase() === selectedSlotType.toLowerCase()
        );

  const handleReservation = async () => {
    if (!startTime || !endTime) {
      toast({
        title: "Validation Error",
        description: "Please select both start and end times.",
        variant: "destructive",
      });
      return;
    }

    const start = new Date(startTime);
    const end = new Date(endTime);
    const now = new Date();
    const minStartTime = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes from now

    if (start <= minStartTime) {
      toast({
        title: "Validation Error",
        description: "Start time must be at least 5 minutes from now.",
        variant: "destructive",
      });
      return;
    }

    if (start >= end) {
      toast({
        title: "Validation Error",
        description: "End time must be after start time.",
        variant: "destructive",
      });
      return;
    }

    if (end.getTime() - start.getTime() < 30 * 60 * 1000) {
      toast({
        title: "Validation Error",
        description: "Minimum reservation duration is 30 minutes.",
        variant: "destructive",
      });
      return;
    }

    try {
      setReserving(true);

      // Convert to UTC for consistent server-side validation
      const formattedSlotType = formatSlotTypeForAPI(selectedSlotType);

      const reservationData = {
        facility_id: facility.id,
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        requests: [
          {
            slot_type: formattedSlotType,
            count: selectedSlotCount,
          },
        ],
      };

      const response = await api.post("/reservations", reservationData);

      if (response.data.success) {
        toast({
          title: "Reservation Successful!",
          description: `Successfully reserved ${selectedSlotCount} ${formattedSlotType} slot(s).`,
          variant: "success",
        });
        setReservationDialogOpen(false);
        // Refresh slots to show updated availability
        fetchSlots();
      }
    } catch (error: any) {
      console.error("Reservation error:", error);
      toast({
        title: "Reservation Failed",
        description:
          error.response?.data?.message || "Failed to make reservation.",
        variant: "destructive",
      });
    } finally {
      setReserving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {facility.name} - Parking Slots
          </DialogTitle>
          <DialogDescription>{facility.address}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Filter and Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select
                value={selectedSlotType}
                onValueChange={setSelectedSlotType}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="vip">VIP</SelectItem>
                  <SelectItem value="handicapped">Handicapped</SelectItem>
                  <SelectItem value="bike">Bike</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col items-end gap-1">
              <Button size="sm" onClick={() => setReservationDialogOpen(true)}>
                Reserve Now
              </Button>
            </div>
          </div>

          {/* Slots Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading slots...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500">{error}</p>
              <Button variant="outline" onClick={fetchSlots} className="mt-4">
                Try Again
              </Button>
            </div>
          ) : slots.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No slots found for this facility.
              </p>
            </div>
          ) : filteredSlots.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No slots match the selected filter.
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[500px]">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSlots.map((slot) => (
                  <div
                    key={slot.id}
                    className={`border rounded-lg p-5 bg-card`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {slot.location_tag && (
                          <h3 className="text-lg font-semibold text-foreground mb-1">
                            {slot.location_tag}
                          </h3>
                        )}
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          {getSlotIcon(slot.slot_type)}
                          <span>{slot.slot_type}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-baseline gap-1">
                          <span className="text-xl font-bold text-primary">
                            ৳{getSlotPrice(slot.slot_type as any)}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            /hr
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </DialogContent>

      {/* Reservation Dialog */}
      <Dialog
        open={reservationDialogOpen}
        onOpenChange={setReservationDialogOpen}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Reserve Parking Slot</DialogTitle>
            <DialogDescription>
              Select your reservation details for {facility.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Number of Slots */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Number of Slots</label>
              <Select
                value={selectedSlotCount.toString()}
                onValueChange={(value) => setSelectedSlotCount(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select number of slots" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Slot</SelectItem>
                  <SelectItem value="2">2 Slots</SelectItem>
                  <SelectItem value="3">3 Slots</SelectItem>
                  <SelectItem value="4">4 Slots</SelectItem>
                  <SelectItem value="5">5 Slots</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Slot Type Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Slot Type</label>
              <Select
                value={selectedSlotType}
                onValueChange={setSelectedSlotType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select slot type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="vip">VIP</SelectItem>
                  <SelectItem value="handicapped">Handicapped</SelectItem>
                  <SelectItem value="bike">Bike</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Start Time */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Time</label>
              <input
                type="datetime-local"
                className="w-full px-3 py-2 border rounded-md bg-background"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                min={new Date(Date.now() + 6 * 60 * 1000)
                  .toISOString()
                  .slice(0, 16)}
              />
            </div>

            {/* End Time */}
            <div className="space-y-2">
              <label className="text-sm font-medium">End Time</label>
              <input
                type="datetime-local"
                className="w-full px-3 py-2 border rounded-md bg-background"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                min={
                  startTime
                    ? new Date(new Date(startTime).getTime() + 30 * 60 * 1000)
                        .toISOString()
                        .slice(0, 16)
                    : new Date(Date.now() + 31 * 60 * 1000)
                        .toISOString()
                        .slice(0, 16)
                }
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setReservationDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={() => handleReservation()} disabled={reserving}>
                {reserving ? "Reserving..." : "Reserve"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
