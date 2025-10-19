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
import { Facility } from "@/types/types";
import { SlotsDialog } from "./SlotsDialog";

interface FacilityCardProps {
  facility: Facility;
}

export function FacilityCard({ facility }: FacilityCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{facility.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription>
          {facility.area?.name} - {facility.address}
          <p className="mt-2">({facility.area?.type})</p>
        </CardDescription>
      </CardContent>
      <CardFooter>
        <SlotsDialog facility={facility}>
          <Button className="w-full">View Slots</Button>
        </SlotsDialog>
      </CardFooter>
    </Card>
  );
}
