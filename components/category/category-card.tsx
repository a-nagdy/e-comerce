import { Card } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"

interface CategoryCardProps {
  category: {
    id: string
    name: string
    slug: string
    imageUrl?: string
    productCount?: number
  }
}

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link href={`/categories/${category.slug}`}>
      <Card className="group overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
        <div className="relative aspect-square overflow-hidden">
          <Image
            src={category.imageUrl || `/placeholder.svg?height=200&width=200&query=${category.name}`}
            alt={category.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
          <div className="absolute inset-0 flex flex-col justify-end p-4">
            <h3 className="text-white font-semibold text-lg">{category.name}</h3>
            {category.productCount && <p className="text-white/80 text-sm">{category.productCount} products</p>}
          </div>
        </div>
      </Card>
    </Link>
  )
}
