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
import { Input } from "@/components/ui/input";
import { MapPin, Search, ChevronRight } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import api from "@/lib/api";

interface Division {
  id: string;
  name: string;
  code: string;
}

interface District {
  id: string;
  name: string;
  code: string;
}

interface Area {
  id: string;
  name: string;
  type: string;
  popular: boolean;
}

interface AreaSelectorProps {
  selectedAreaId?: string;
  selectedAreaName?: string;
  onAreaSelect: (areaId: string, areaName: string) => void;
  trigger?: React.ReactNode;
}

export function AreaSelector({
  selectedAreaId,
  selectedAreaName,
  onAreaSelect,
  trigger,
}: AreaSelectorProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"division" | "district" | "area">(
    "division"
  );

  const [divisions, setDivisions] = useState<Division[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);

  const [selectedDivision, setSelectedDivision] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [selectedArea, setSelectedArea] = useState<string>("");

  const [divisionSearch, setDivisionSearch] = useState("");
  const [districtSearch, setDistrictSearch] = useState("");
  const [areaSearch, setAreaSearch] = useState("");

  const [loading, setLoading] = useState(false);

  // Load divisions on mount
  useEffect(() => {
    const loadDivisions = async () => {
      try {
        const response = await api.get("/divisions");
        const divisionsData = response.data?.message?.divisions || [];
        setDivisions(divisionsData);
      } catch (error) {
        console.error(
          "Failed to load divisions:",
          (error as any)?.response?.data || (error as Error)?.message
        );
        setDivisions([]);
      }
    };
    loadDivisions();
  }, []);

  // Load districts when division is selected
  useEffect(() => {
    if (selectedDivision) {
      const loadDistricts = async () => {
        setLoading(true);
        try {
          const response = await api.get("/districts", {
            params: { division_id: selectedDivision },
          });
          const districtsData = response.data?.message?.districts || [];
          setDistricts(districtsData);
        } catch (error) {
          console.error("Failed to load districts:", error);
          setDistricts([]);
        } finally {
          setLoading(false);
        }
      };
      loadDistricts();
    } else {
      setDistricts([]);
    }
  }, [selectedDivision]);

  // Load areas when district is selected
  useEffect(() => {
    if (selectedDistrict) {
      const loadAreas = async () => {
        setLoading(true);
        try {
          const response = await api.get("/areas", {
            params: { district_id: selectedDistrict },
          });
          const areasData = response.data?.message?.areas || [];
          setAreas(areasData);
        } catch (error) {
          console.error("Failed to load areas:", error);
          setAreas([]);
        } finally {
          setLoading(false);
        }
      };
      loadAreas();
    } else {
      setAreas([]);
    }
  }, [selectedDistrict]);

  const filteredDivisions = (divisions || []).filter((division) => {
    const searchTerm = divisionSearch.toLowerCase();
    const divisionName = division.name.toLowerCase();
    return divisionName.includes(searchTerm);
  });

  const filteredDistricts = (districts || []).filter((district) => {
    const searchTerm = districtSearch.toLowerCase();
    const districtName = district.name.toLowerCase();
    return districtName.includes(searchTerm);
  });

  const filteredAreas = (areas || []).filter((area) => {
    const searchTerm = areaSearch.toLowerCase();
    const areaName = area.name.toLowerCase();
    return areaName.includes(searchTerm);
  });

  const handleDivisionSelect = (divisionId: string) => {
    setSelectedDivision(divisionId);
    setSelectedDistrict("");
    setSelectedArea("");
    setStep("district");
  };

  const handleDistrictSelect = (districtId: string) => {
    setSelectedDistrict(districtId);
    setSelectedArea("");
    setStep("area");
  };

  const handleAreaSelect = (areaId: string) => {
    const area = areas.find((a) => a.id === areaId);
    if (area) {
      setSelectedArea(areaId);
      onAreaSelect(areaId, area.name);
      setOpen(false);
      resetSelection();
    }
  };

  const resetSelection = () => {
    setStep("division");
    setSelectedDivision("");
    setSelectedDistrict("");
    setSelectedArea("");
    setDivisionSearch("");
    setDistrictSearch("");
    setAreaSearch("");
  };

  const handleBack = () => {
    if (step === "district") {
      setStep("division");
      setSelectedDivision("");
      setSelectedDistrict("");
    } else if (step === "area") {
      setStep("district");
      setSelectedDistrict("");
      setSelectedArea("");
    }
  };

  const getSelectedAreaName = () => {
    return selectedAreaName || "Select Area";
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            {selectedAreaId ? getSelectedAreaName() : "Select Area"}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Select Location</DialogTitle>
          <DialogDescription>
            Choose your preferred area to filter parking facilities.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Step Indicator */}
          <div className="flex flex-col items-center space-y-4">
            <div className="flex items-center space-x-4">
              {/* Step 1: Division */}
              <div className="flex items-center space-x-2">
                <div
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium transition-colors ${
                    step === "division"
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-muted-foreground text-muted-foreground"
                  }`}
                >
                  1
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>

              {/* Step 2: District */}
              <div className="flex items-center space-x-2">
                <div
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium transition-colors ${
                    step === "district"
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-muted-foreground text-muted-foreground"
                  }`}
                >
                  2
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>

              {/* Step 3: Area */}
              <div className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium transition-colors ${
                    step === "area"
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-muted-foreground text-muted-foreground"
                  }`}
                >
                  3
                </div>
              </div>
            </div>

            {/* Step Title */}
            <div className="text-center">
              <h3 className="text-lg font-semibold">
                {step === "division" && "Select Division"}
                {step === "district" && "Select District"}
                {step === "area" && "Select Area"}
              </h3>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-4">
            {/* Back Button Area - Above search bar */}
            <div className="h-10 flex items-center">
              {(step === "district" || step === "area") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBack}
                  className="p-1 h-8 w-8 transition-all duration-300 ease-in-out"
                >
                  <ChevronRight className="h-4 w-4 rotate-180" />
                </Button>
              )}
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={
                  step === "division"
                    ? "Search divisions..."
                    : step === "district"
                    ? "Search districts..."
                    : "Search areas..."
                }
                value={
                  step === "division"
                    ? divisionSearch
                    : step === "district"
                    ? districtSearch
                    : areaSearch
                }
                onChange={(e) => {
                  if (step === "division") setDivisionSearch(e.target.value);
                  else if (step === "district")
                    setDistrictSearch(e.target.value);
                  else setAreaSearch(e.target.value);
                }}
                className="pl-9 transition-all duration-300 ease-in-out"
              />
            </div>

            {/* Content Area */}
            <div className="relative min-h-[240px]">
              {/* Division Content */}
              <div
                className={`absolute inset-0 transition-all duration-300 ease-in-out ${
                  step === "division"
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 translate-x-4 pointer-events-none"
                }`}
              >
                <ScrollArea className="h-60">
                  <div className="space-y-2">
                    {divisions.length === 0 ? (
                      <div className="text-center py-4 text-muted-foreground">
                        Loading divisions...
                      </div>
                    ) : filteredDivisions.length === 0 && divisionSearch ? (
                      <div className="text-center py-4 text-muted-foreground">
                        No divisions found matching "{divisionSearch}"
                      </div>
                    ) : (
                      filteredDivisions.map((division) => (
                        <button
                          key={division.id}
                          onClick={() => handleDivisionSelect(division.id)}
                          className="w-full p-3 text-left border rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors flex items-center justify-between"
                        >
                          <div>
                            <div className="font-medium">{division.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {division.code}
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </button>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </div>

              {/* District Content */}
              <div
                className={`absolute inset-0 transition-all duration-300 ease-in-out ${
                  step === "district"
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 -translate-x-4 pointer-events-none"
                }`}
              >
                {loading ? (
                  <div className="text-center py-4">Loading districts...</div>
                ) : districts.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    No districts available
                  </div>
                ) : (
                  <ScrollArea className="h-60">
                    <div className="space-y-2">
                      {filteredDistricts.length === 0 && districtSearch && (
                        <div className="text-center py-4 text-muted-foreground">
                          No districts found matching "{districtSearch}"
                        </div>
                      )}
                      {filteredDistricts.map((district) => (
                        <button
                          key={district.id}
                          onClick={() => handleDistrictSelect(district.id)}
                          className="w-full p-3 text-left border rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors flex items-center justify-between"
                        >
                          <div>
                            <div className="font-medium">{district.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {district.code}
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </div>

              {/* Area Content */}
              <div
                className={`absolute inset-0 transition-all duration-300 ease-in-out ${
                  step === "area"
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 -translate-x-4 pointer-events-none"
                }`}
              >
                {loading ? (
                  <div className="text-center py-4">Loading areas...</div>
                ) : areas.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    No areas available
                  </div>
                ) : (
                  <ScrollArea className="h-60">
                    <div className="space-y-2">
                      {filteredAreas.length === 0 && areaSearch && (
                        <div className="text-center py-4 text-muted-foreground">
                          No areas found matching "{areaSearch}"
                        </div>
                      )}
                      {filteredAreas.map((area) => (
                        <button
                          key={area.id}
                          onClick={() => handleAreaSelect(area.id)}
                          className="w-full p-3 text-left border rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
                        >
                          <div className="font-medium">{area.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {area.type}
                          </div>
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
