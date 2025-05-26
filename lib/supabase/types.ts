export interface Room {
  id: number;
  name: string;
  capacity: number;
  location: string;
  description: string;
  image_url: string | null;
  is_available: boolean;
  created_at: string;
}

export interface Booking {
  id: number;
  room_id: number;
  user_id: string;
  event_name: string;
  description: string | null;
  start_time: string;
  end_time: string;
  status: "pending" | "approved" | "rejected" | "cancelled";
  created_at: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  user_role: "admin" | "student";
  created_at: string;
  updated_at?: string | null;
}

// Database response types (what Supabase actually returns)
export interface DatabaseRoom {
  id: number;
  name: string;
  capacity: number;
  location: string;
  description: string;
  image_url: string | null;
  is_available: boolean;
  created_at: string;
}

export interface DatabaseProfile {
  id: string;
  email: string;
  full_name: string | null;
  user_role: "admin" | "student";
  created_at: string;
  updated_at: string | null;
}

export interface DatabaseBooking {
  id: number;
  room_id: number;
  user_id: string;
  event_name: string;
  description: string | null;
  start_time: string;
  end_time: string;
  status: "pending" | "approved" | "rejected" | "cancelled";
  created_at: string;
}

// Type guard functions
export function isValidProfile(data: any): data is Profile {
  return data && typeof data.id === "string" && typeof data.email === "string" && (data.full_name === null || typeof data.full_name === "string") && (data.user_role === "admin" || data.user_role === "student");
}

// Type conversion function
export function convertToProfile(data: DatabaseProfile): Profile {
  return {
    id: String(data.id),
    email: String(data.email),
    full_name: data.full_name ? String(data.full_name) : null,
    user_role: String(data.user_role) as "admin" | "student",
    created_at: String(data.created_at),
    updated_at: data.updated_at ? String(data.updated_at) : null,
  };
}

export interface BookingWithRoom extends Booking {
  rooms: {
    id: number;
    name: string;
    location: string;
  } | null;
}

export interface BookingWithRoomAndProfile extends Booking {
  rooms: {
    id: number;
    name: string;
    location: string;
  } | null;
  profiles: {
    id: string;
    email: string;
    full_name: string | null;
  } | null;
}
