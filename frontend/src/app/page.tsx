"use client";

import { PageContainer } from "@/components/layout/PageContainer";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { FacilityCard } from "@/components/dashboard/FacilityCard";
import { AreaSelector } from "@/components/dashboard/AreaSelector";
import { Skeleton } from "@/components/ui/skeleton";
import { Facility } from "@/types/types";
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
      <PageContainer>
        <div className="space-y-6">
          <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-muted-foreground">
                Find and reserve your next parking spot.
              </p>
            </div>
            <div className="flex w-full items-center justify-end gap-4 md:w-auto">
              {selectedAreaName && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{selectedAreaName}</span>
                  <button
                    onClick={handleClearFilter}
                    className="text-primary hover:underline"
                  >
                    (Clear)
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
          {error && <p className="text-center text-red-500">{error}</p>}
          {!loading && !error && facilities.length === 0 && (
            <div className="flex h-40 items-center justify-center rounded-md border border-dashed">
              <p className="text-muted-foreground">
                {selectedAreaId
                  ? `No facilities found in ${selectedAreaName}.`
                  : "Select an area to see available facilities."}
              </p>
            </div>
          )}
          {!loading && !error && facilities.length > 0 && (
            <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
              {facilities.map((facility) => (
                <FacilityCard key={facility.id} facility={facility} />
              ))}
            </div>
          )}
        </div>
      </PageContainer>
    </ProtectedRoute>
  );
}
