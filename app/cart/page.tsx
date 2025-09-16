"use client"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { guestCart, getUserCart, type CartItem } from "@/lib/cart"
import type { User } from "@supabase/supabase-js"

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [promoCode, setPromoCode] = useState("")
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const loadCart = async () => {
      setIsLoading(true)

      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        // Load authenticated user's cart
        const userCartItems = await getUserCart(user.id)
        setCartItems(userCartItems)
      } else {
        // Load guest cart and convert to display format
        const guestItems = guestCart.getItems()
        // For now, we'll need to fetch product details for guest items
        // This is a simplified version - in production you'd batch fetch product details
        const guestCartItems: CartItem[] = guestItems.map((item, index) => ({
          id: `guest-${index}`,
          productId: item.productId,
          name: "Product Name", // Would be fetched from database
          price: 29.99, // Would be fetched from database
          quantity: item.quantity,
          image: "/placeholder.svg",
          vendor: "Sample Vendor",
          variant: item.variant,
          inStock: true,
        }))
        setCartItems(guestCartItems)
      }

      setIsLoading(false)
    }

    loadCart()

    // Listen for cart updates
    const handleCartUpdate = () => loadCart()
    window.addEventListener("cartUpdated", handleCartUpdate)

    return () => window.removeEventListener("cartUpdated", handleCartUpdate)
  }, [supabase.auth])

  const updateQuantity = async (productId: string, newQuantity: number, variant?: string) => {
    if (newQuantity === 0) {
      removeItem(productId, variant)
      return
    }

    if (user) {
      // Update authenticated user's cart in database
      try {
        const { error } = await supabase
          .from("cart_items")
          .update({ quantity: newQuantity })
          .eq("user_id", user.id)
          .eq("product_id", productId)

        if (error) throw error

        // Reload cart
        const userCartItems = await getUserCart(user.id)
        setCartItems(userCartItems)
      } catch (error) {
        console.error("Error updating cart:", error)
      }
    } else {
      // Update guest cart
      guestCart.updateQuantity(productId, newQuantity, variant)
    }
  }

  const removeItem = async (productId: string, variant?: string) => {
    if (user) {
      // Remove from authenticated user's cart
      try {
        const { error } = await supabase.from("cart_items").delete().eq("user_id", user.id).eq("product_id", productId)

        if (error) throw error

        // Reload cart
        const userCartItems = await getUserCart(user.id)
        setCartItems(userCartItems)
      } catch (error) {
        console.error("Error removing from cart:", error)
      }
    } else {
      // Remove from guest cart
      guestCart.removeItem(productId, variant)
    }
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = subtotal > 50 ? 0 : 9.99
  const tax = subtotal * 0.08
  const total = subtotal + shipping + tax

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p>Loading cart...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-6">
            <ShoppingBag className="h-24 w-24 mx-auto text-muted-foreground" />
            <div>
              <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
              <p className="text-muted-foreground">Add some products to get started</p>
            </div>
            <Button asChild>
              <Link href="/">Continue Shopping</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="container py-8">
          <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden">
                        <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                      </div>

                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <Link href={`/products/${item.productId}`} className="font-medium hover:text-primary">
                              {item.name}
                            </Link>
                            <p className="text-sm text-muted-foreground">by {item.vendor}</p>
                            {item.variant && (
                              <Badge variant="outline" className="text-xs mt-1">
                                {item.variant}
                              </Badge>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem(item.productId, item.variant)}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 bg-transparent"
                              onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variant)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center text-sm">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 bg-transparent"
                              onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variant)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                            <p className="text-sm text-muted-foreground">${item.price.toFixed(2)} each</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Subtotal ({cartItems.length} items)</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Promo Code</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter promo code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                    />
                    <Button variant="outline">Apply</Button>
                  </div>
                </CardContent>
              </Card>

              <Button size="lg" className="w-full" asChild>
                <Link href="/checkout">
                  Proceed to Checkout
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>

              <Button variant="outline" size="lg" className="w-full bg-transparent" asChild>
                <Link href="/">Continue Shopping</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
