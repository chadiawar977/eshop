import React from "react";
import { supabase } from "../utils/supabase";

export async function ClearCart(user_id: any) {
  try {
    const { error } = await supabase
      .from("users")
      .update({ cart: [] })
      .eq("user_id", user_id);
    if (error) throw error;
    return { success: true, message: "Cart Cleared" };
  } catch (error) {
    console.error("Error clearing cart:", error);
    return { success: false, message: "Failed to clear cart" };
  }
}
