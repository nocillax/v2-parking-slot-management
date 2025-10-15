"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { FacilityCard } from "@/components/dashboard/FacilityCard";
import { AreaSelector } from "@/components/dashboard/AreaSelector";
import { Skeleton } from "@/components/ui/skeleton";
import { Facility } from "@/types";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";

export default function Home() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAreaId, setSelectedAreaId] = useState<string | undefined>();
  const [selectedAreaName, setSelectedAreaName] = useState<string>("");
  const { user } = useAuthStore();

  const fetchFacilities = async (areaId?: string) => {
    try {
      setLoading(true);
      const params = areaId ? { area_id: areaId } : {};
      const response = await api.get("/facilities", { params });
      setFacilities(response.data.data.rows);
      setError(null);
    } catch (err) {
      setError("Failed to fetch facilities. Please try again later.");
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Load user's default area if available
    if (user?.default_area_id) {
      setSelectedAreaId(user.default_area_id);
      // Fetch area name
      const fetchAreaName = async () => {
        try {
          const response = await api.get(`/areas/${user.default_area_id}`);
          setSelectedAreaName(response.data.data.name);
        } catch (error) {
          console.error("Failed to fetch area name:", error);
        }
      };
      fetchAreaName();
    }
  }, [user]);

  useEffect(() => {
    fetchFacilities(selectedAreaId);
  }, [selectedAreaId]);

  const handleAreaSelect = async (areaId: string, areaName: string) => {
    setSelectedAreaId(areaId);
    setSelectedAreaName(areaName);

    // Save to user profile
    try {
      await api.patch("/auth/me", { default_area_id: areaId });
    } catch (error) {
      console.error("Failed to save default area:", error);
    }
  };

  const handleClearFilter = () => {
    setSelectedAreaId(undefined);
    setSelectedAreaName("");
  };

  return (
    <ProtectedRoute>
      <main className="container mx-auto flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold md:text-3xl">
            Available Facilities
          </h1>
          <div className="flex items-center gap-4">
            {selectedAreaName && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Filtered by: {selectedAreaName}</span>
                <button
                  onClick={handleClearFilter}
                  className="text-primary hover:underline"
                >
                  Clear
                </button>
              </div>
            )}
            <AreaSelector
              selectedAreaId={selectedAreaId}
              selectedAreaName={selectedAreaName}
              onAreaSelect={handleAreaSelect}
            />
          </div>
        </div>
        {loading && (
          <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-[200px] w-full" />
            ))}
          </div>
        )}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && !error && facilities.length === 0 && (
          <p className="text-muted-foreground">
            {selectedAreaId
              ? `No facilities found in ${selectedAreaName}.`
              : "No facilities found."}
          </p>
        )}
        {!loading && !error && facilities.length > 0 && (
          <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
            {facilities.map((facility) => (
              <FacilityCard key={facility.id} facility={facility} />
            ))}
          </div>
        )}
      </main>
    </ProtectedRoute>
  );
}
