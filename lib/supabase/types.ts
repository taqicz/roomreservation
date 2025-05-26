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

// Safe type conversion functions
export function safeString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export function safeStringOrNull(value: unknown): string | null {
  return typeof value === "string" ? value : value === null ? null : "";
}

export function safeUserRole(value: unknown): "admin" | "student" {
  return value === "admin" ? "admin" : "student";
}

// Type conversion function
export function convertToProfile(data: any): Profile {
  return {
    id: safeString(data.id),
    email: safeString(data.email),
    full_name: safeStringOrNull(data.full_name),
    user_role: safeUserRole(data.user_role),
    created_at: safeString(data.created_at),
    updated_at: safeStringOrNull(data.updated_at),
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
