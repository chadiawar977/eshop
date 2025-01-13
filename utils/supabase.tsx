import { createClient } from "@supabase/supabase-js";

interface Device {
  device_id: number;
  device_name: string;
  brand: string;
  description: string;
  price: number;
  stock_quantity: number;
  Image: string;
  Attributes: string[];
  category_name: string;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function getDevices(
  page: number,
  pageSize: number,
  search: string = ""
) {
  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;

  let query = supabase
    .from("devices")
    .select("*", { count: "exact" })
    .range(start, end);

  if (search) {
    query = query.ilike("device_name", `%${search}%`);
  }

  const { data, count, error } = await query;

  if (error) {
    console.error("Error fetching devices:", error);
    return { devices: [], totalCount: 0 };
  }

  return { devices: data || [], totalCount: count || 0 };
}

export async function updateDevice(deviceId: number, updates: Partial<Device>) {
  const { data, error } = await supabase
    .from("devices")
    .update(updates)
    .eq("device_id", deviceId);

  if (error) {
    console.error("Error updating device:", error);
    return null;
  }

  return data;
}
