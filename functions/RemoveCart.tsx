"use server";

import { revalidatePath } from "next/cache";
import { supabase } from "@/utils/supabase";

export async function RemoveCart(deviceId: number, user_id: string) {
  try {
    // Fetch the current cart
    const { data: userData, error: cartError } = await supabase
      .from("users")
      .select("cart")
      .eq("user_id", user_id)
      .single();

    if (cartError) throw cartError;
    if (!userData) throw new Error("User not found");

    // Initialize cart array and remove one instance of deviceId
    const currentCart = userData.cart || [];

    const deviceIndex = currentCart.indexOf(deviceId.toString());

    // If device wasn't found in cart, return early
    if (deviceIndex === -1) {
      return {
        success: false,
        message: "Item not found in cart",
      };
    }

    // Create new cart array with one instance of deviceId removed
    const updatedCart = [
      ...currentCart.slice(0, deviceIndex),
      ...currentCart.slice(deviceIndex + 1),
    ];

    // Update the user's cart in the database
    const { error: updateError } = await supabase
      .from("users")
      .update({ cart: updatedCart })
      .eq("user_id", user_id);

    if (updateError) throw updateError;

    // Revalidate the path to update the UI
    revalidatePath(`/cart`);

    return {
      success: true,
      message: "Item removed from cart",
      removedId: deviceId,
    };
  } catch (error) {
    console.error("Error removing item from cart:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to remove item from cart",
    };
  }
}
