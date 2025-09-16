import { createServerClient } from "@/lib/supabase/server"
import type { CartItem } from "./cart"

// Define the expected database response type
type CartItemDB = {
    id: string
    quantity: number
    product_id: string
    products: {
        id: string
        name: string
        price: number
        images: string[] | null
        vendors: {
            business_name: string
        } | null
    } | null
}

export async function getUserCart(userId: string): Promise<CartItem[]> {
    const supabase = await createServerClient()

    const { data: cartItems, error } = await supabase
        .from("cart_items")
        .select(`
      id,
      quantity,
      product_id,
      products (
        id,
        name,
        price,
        images,
        vendors (
          business_name
        )
      )
    `)
        .eq("user_id", userId)

    if (error) {
        console.error("Error fetching cart:", error)
        return []
    }

    if (!cartItems) {
        return []
    }

    return cartItems.map((item: any) => ({
        id: item.id,
        productId: item.product_id,
        name: item.products?.name || "",
        price: item.products?.price || 0,
        quantity: item.quantity,
        image: item.products?.images?.[0] || "/placeholder.svg",
        vendor: item.products?.vendors?.business_name || "",
        inStock: true,
    }))
}

// Additional server-side cart functions
export async function addToUserCartServer(userId: string, productId: string, quantity = 1, variantId?: string) {
    const supabase = await createServerClient()

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

export async function updateCartItemQuantityServer(userId: string, productId: string, quantity: number, variantId?: string) {
    const supabase = await createServerClient()

    if (quantity <= 0) {
        // Remove item if quantity is 0 or less
        const { error } = await supabase
            .from("cart_items")
            .delete()
            .eq("user_id", userId)
            .eq("product_id", productId)
            .eq("variant_id", variantId || null)

        if (error) {
            console.error("Error removing cart item:", error)
            throw error
        }
    } else {
        // Update quantity
        const { error } = await supabase
            .from("cart_items")
            .update({ quantity, updated_at: new Date().toISOString() })
            .eq("user_id", userId)
            .eq("product_id", productId)
            .eq("variant_id", variantId || null)

        if (error) {
            console.error("Error updating cart item:", error)
            throw error
        }
    }
}

export async function removeCartItemServer(userId: string, productId: string, variantId?: string) {
    const supabase = await createServerClient()

    const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("user_id", userId)
        .eq("product_id", productId)
        .eq("variant_id", variantId || null)

    if (error) {
        console.error("Error removing cart item:", error)
        throw error
    }
}

export async function clearUserCartServer(userId: string) {
    const supabase = await createServerClient()

    const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("user_id", userId)

    if (error) {
        console.error("Error clearing cart:", error)
        throw error
    }
}

export async function getCartCountServer(userId: string): Promise<number> {
    const supabase = await createServerClient()

    const { data, error } = await supabase
        .from("cart_items")
        .select("quantity")
        .eq("user_id", userId)

    if (error) {
        console.error("Error fetching cart count:", error)
        return 0
    }

    return data?.reduce((sum, item) => sum + item.quantity, 0) || 0
}
