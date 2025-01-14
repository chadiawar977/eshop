import React from "react";
import { supabase } from "../utils/supabase";
import { ClearCart } from "./ClearCart";
import { revalidatePath } from "next/cache";
import { useNumber } from "@/app/context/CartContext";
export async function Purchase(user_id: any) {
  try {
    // Fetch the current user's cart and purchased items
    const { data: userData, error: fetchError } = await supabase
      .from("users")
      .select("cart, purchased")
      .eq("user_id", user_id)
      .single();

    if (fetchError) throw fetchError;

    // Combine cart items with existing purchased items
    const updatedPurchased = [
      ...(userData.purchased || []),
      ...(userData.cart || []),
    ];

    // Update the user's purchased items in the database
    const { error: updateError } = await supabase
      .from("users")
      .update({ purchased: updatedPurchased })
      .eq("user_id", user_id);

    if (updateError) throw updateError;

    // Clear the user's cart
    const clearCartResult = await ClearCart(user_id);

    if (!clearCartResult.success) {
      throw new Error(clearCartResult.message);
    }
    return { success: true, message: "Purchase completed and cart cleared" };
  } catch (error) {
    console.error("Error in Purchase function:", error);
    return { success: false, message: "Failed to complete purchase" };
  }
}
