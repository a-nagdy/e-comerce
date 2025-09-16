"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  backgroundImage: string;
  backgroundColor: string;
  textColor: string;
  overlayOpacity: number;
  sortOrder: number;
  isActive: boolean;
}

interface HeroSliderProps {
  slides: HeroSlide[];
  showSearch?: boolean;
  containerClass?: string;
}

export function HeroSlider({
  slides,
  showSearch = true,
  containerClass = "container",
}: HeroSliderProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const activeSlides = slides
    .filter((slide) => slide.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  useEffect(() => {
    if (activeSlides.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
    }, 5000); // Auto-advance every 5 seconds

    return () => clearInterval(interval);
  }, [activeSlides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + activeSlides.length) % activeSlides.length
    );
  };

  if (activeSlides.length === 0) {
    // Fallback to default hero section
    return (
      <section className="bg-gradient-to-r from-primary/10 via-primary/5 to-background py-20">
        <div className={`${containerClass} text-center`}>
          <h1 className="text-4xl md:text-6xl font-bold text-balance mb-6">
            Discover Amazing Products from Trusted Vendors
          </h1>
          <p className="text-xl text-muted-foreground text-balance mb-8 max-w-2xl mx-auto">
            Shop from thousands of products across multiple categories with fast
            shipping and secure checkout.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/categories">Start Shopping</Link>
            </Button>
          </div>
        </div>
      </section>
    );
  }

  const slide = activeSlides[currentSlide];

  return (
    <section className="relative overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: slide.backgroundImage
            ? `url(${slide.backgroundImage})`
            : "none",
          backgroundColor: slide.backgroundImage
            ? "transparent"
            : slide.backgroundColor,
        }}
      />

      {/* Overlay */}
      {slide.backgroundImage && (
        <div
          className="absolute inset-0 bg-black"
          style={{ opacity: slide.overlayOpacity }}
        />
      )}

      {/* Content */}
      <div className={`${containerClass} relative z-10 py-20 text-center`}>
        <h1
          className="text-4xl md:text-6xl font-bold text-balance mb-6"
          style={{ color: slide.textColor }}
        >
          {slide.title}
        </h1>
        <p
          className="text-xl text-balance mb-8 max-w-2xl mx-auto opacity-90"
          style={{ color: slide.textColor }}
        >
          {slide.subtitle}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" asChild>
            <Link href={slide.ctaLink}>{slide.ctaText}</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/vendors">Become a Vendor</Link>
          </Button>
        </div>

        {/* Search Bar */}
        {showSearch && (
          <div className="mt-8 max-w-md mx-auto">
            <div className="flex gap-2">
              <input
                type="search"
                placeholder="Search products..."
                className="flex-1 px-4 py-3 rounded-lg border border-white/20 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/30"
              />
              <Button variant="secondary">Search</Button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      {activeSlides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
          >
            <ChevronLeft className="h-6 w-6 text-white" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
          >
            <ChevronRight className="h-6 w-6 text-white" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {activeSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentSlide ? "bg-white" : "bg-white/50"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
