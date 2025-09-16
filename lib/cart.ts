import { createClient } from "@/lib/supabase/client"

export interface CartItem {
  id: string
  productId: string
  name: string
  price: number
  quantity: number
  image: string
  vendor: string
  variant?: string
  inStock: boolean
}

export interface GuestCartItem {
  productId: string
  quantity: number
  variant?: string
}

export const guestCart = {
  getItems(): GuestCartItem[] {
    if (typeof window === "undefined") return []
    const items = localStorage.getItem("guest_cart")
    return items ? JSON.parse(items) : []
  },

  addItem(productId: string, quantity = 1, variant?: string) {
    const items = this.getItems()
    const existingIndex = items.findIndex((item) => item.productId === productId && item.variant === variant)

    if (existingIndex >= 0) {
      items[existingIndex].quantity += quantity
    } else {
      items.push({ productId, quantity, variant })
    }

    localStorage.setItem("guest_cart", JSON.stringify(items))
    window.dispatchEvent(new CustomEvent("cartUpdated"))
  },

  updateQuantity(productId: string, quantity: number, variant?: string) {
    const items = this.getItems()
    const index = items.findIndex((item) => item.productId === productId && item.variant === variant)

    if (index >= 0) {
      if (quantity <= 0) {
        items.splice(index, 1)
      } else {
        items[index].quantity = quantity
      }
      localStorage.setItem("guest_cart", JSON.stringify(items))
      window.dispatchEvent(new CustomEvent("cartUpdated"))
    }
  },

  removeItem(productId: string, variant?: string) {
    const items = this.getItems().filter((item) => !(item.productId === productId && item.variant === variant))
    localStorage.setItem("guest_cart", JSON.stringify(items))
    window.dispatchEvent(new CustomEvent("cartUpdated"))
  },

  clear() {
    localStorage.removeItem("guest_cart")
    window.dispatchEvent(new CustomEvent("cartUpdated"))
  },

  getCount(): number {
    return this.getItems().reduce((sum, item) => sum + item.quantity, 0)
  },
}

// Client-side cart functions
export async function addToUserCart(userId: string, productId: string, quantity = 1, variantId?: string) {
  const supabase = createClient()

  // First, check if item already exists
  const { data: existingItem } = await supabase
    .from("cart_items")
    .select("id, quantity")
    .eq("user_id", userId)
    .eq("product_id", productId)
    .eq("variant_id", variantId || null)
    .single()

  if (existingItem) {
    // Update existing item
    const { error } = await supabase
      .from("cart_items")
      .update({
        quantity: existingItem.quantity + quantity,
        updated_at: new Date().toISOString()
      })
      .eq("id", existingItem.id)

    if (error) {
      console.error("Error updating cart:", error)
      throw error
    }
  } else {
    // Insert new item
    const { error } = await supabase.from("cart_items").insert({
      user_id: userId,
      product_id: productId,
      variant_id: variantId || null,
      quantity,
    })

    if (error) {
      console.error("Error adding to cart:", error)
      throw error
    }
  }
}

export async function mergeGuestCartWithUser(userId: string) {
  const guestItems = guestCart.getItems()
  if (guestItems.length === 0) return

  for (const item of guestItems) {
    try {
      await addToUserCart(userId, item.productId, item.quantity, item.variant)
    } catch (error) {
      console.error("Error merging cart item:", error)
    }
  }

  // Clear guest cart after successful merge
  guestCart.clear()
}

export async function getCartCount(userId?: string): Promise<number> {
  if (!userId) {
    return guestCart.getCount()
  }

  const supabase = createClient()
  const { data, error } = await supabase.from("cart_items").select("quantity").eq("user_id", userId)

  if (error) {
    console.error("Error fetching cart count:", error)
    return 0
  }

  return data?.reduce((sum, item) => sum + item.quantity, 0) || 0
}

// Server-side cart functions (to be used in server components/API routes)
// export async function getUserCart(userId: string) {
//   // This function should be moved to a separate server-side cart utility
//   // or used only in server components/API routes
//   throw new Error("getUserCart should be used in server components only. Use getCartCount for client-side operations.")
// }
