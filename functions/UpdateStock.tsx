import { supabase } from "../utils/supabase";

interface DeviceUpdate {
  device_id: number;
  count: number;
  stock_quantity: number;
  [key: string]: any; // for other properties
}

export async function UpdateStock(devices: DeviceUpdate[] | DeviceUpdate) {
  try {
    // Convert single object to array if necessary
    const deviceArray = Array.isArray(devices) ? devices : [devices];

    const updatePromises = deviceArray.map(async (device) => {
      const { device_id, count, stock_quantity } = device;

      if (!device_id || typeof count !== "number") {
        throw new Error(`Invalid device data: ${JSON.stringify(device)}`);
      }

      // Calculate new stock quantity
      const newStockQuantity = stock_quantity - count - 1;

      if (newStockQuantity < 0) {
        throw new Error(`Insufficient stock for device ID ${device_id}`);
      }

      // Update the stock quantity in the database
      const { error, data } = await supabase
        .from("devices")
        .update({ stock_quantity: newStockQuantity })
        .eq("device_id", device_id)
        .select("stock_quantity");

      if (error) {
        throw error;
      }

      return { device_id, newStockQuantity, success: true };
    });

    const results = await Promise.all(updatePromises);
    return {
      success: true,
      message: "Stock quantities updated successfully",
      updates: results,
    };
  } catch (error) {
    console.error("Error updating stock:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update stock",
    };
  }
}
