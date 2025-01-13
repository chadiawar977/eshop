"use server";

import { revalidatePath } from "next/cache";
import { supabase } from "@/utils/supabase";
export async function AddToCart(deviceId: number, user_id: string, path: any) {
  try {
    // Fetch the current cart
    const { data: userData, error: cartError } = await supabase
      .from("users")
      .select("cart")
      .eq("user_id", user_id)
      .single();

    if (cartError) throw cartError;

    // Update the cart
    const updatedCart = userData.cart
      ? [...userData.cart, deviceId]
      : [deviceId];

    // Update the user's cart in the database
    const { error: updateError } = await supabase
      .from("users")
      .update({ cart: updatedCart })
      .eq("user_id", user_id);

    if (updateError) throw updateError;

    // Revalidate the path to update the UI
    revalidatePath(`/${path}`);

    return { success: true, message: "Item added to cart" };
  } catch (error) {
    console.error("Error adding item to cart:", error);
    return { success: false, message: "Failed to add item to cart" };
  }
}
