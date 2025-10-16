export interface Slot {
  id: string;
  facility_id: string;
  slot_type: "Normal" | "VIP" | "Handicapped" | "Bike";
  status: "Free" | "Reserved" | "Occupied";
  hourly_rate?: number; // Optional since we use global pricing now
  location_tag?: string;
  createdAt: string;
  updatedAt: string;
  facility?: {
    id: string;
    name: string;
    address: string;
  };
}

export interface Facility {
  id: string;
  name: string;
  address: string;
  area_id: string;
  latitude?: string;
  longitude?: string;
  admin_id: string;
  createdAt: string;
  updatedAt: string;
  area?: {
    id: string;
    district_id: string;
    name: string;
    type: string;
    popular: boolean;
    center_latitude: string;
    center_longitude: string;
    createdAt: string;
    updatedAt: string;
  };
}

export interface Reservation {
  id: string;
  user_id: string;
  slot_id: string;
  start_time: string;
  end_time: string;
  status:
    | "Active"
    | "Checked-in"
    | "Completed"
    | "Expired"
    | "Overstayed"
    | "Cancelled";
  total_amount: number;
  payment_status: "Pending" | "Paid" | "Failed";
  vehicle_number?: string;
  check_in_time?: string;
  check_out_time?: string;
  slot?: {
    id: string;
    location_tag: string;
    slot_type: string;
    facility: {
      id: string;
      name: string;
      address: string;
    };
  };
}
