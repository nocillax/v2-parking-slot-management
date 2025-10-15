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
  vehicle_no?: string;
  check_in_time?: string;
  check_out_time?: string;
  slot?: {
    id: string;
    slot_number: string;
    facility: {
      id: string;
      name: string;
      address: string;
    };
  };
}
