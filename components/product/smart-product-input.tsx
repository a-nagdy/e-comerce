"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProductSuggestions } from "@/hooks/use-product-suggestions";
import { Check, Package, Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface ProductSuggestion {
  catalog_id: string;
  name: string;
  brand: string;
  category_name: string;
  confidence_score: number;
  match_reasons: string[];
  bestPrice: number | null;
  vendorCount: number;
}

interface SmartProductInputProps {
  categoryId?: string;
  value: string;
  onChange: (value: string) => void;
  onSuggestionSelect?: (suggestion: ProductSuggestion) => void;
  placeholder?: string;
  className?: string;
  label?: string;
  disabled?: boolean;
}

export function SmartProductInput({
  categoryId,
  value,
  onChange,
  onSuggestionSelect,
  placeholder = "Enter product name...",
  className = "",
  label = "Product Name",
  disabled = false,
}: SmartProductInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const { suggestions, isLoading, search, clear, recordFeedback } =
    useProductSuggestions({
      categoryId,
      enabled: !disabled,
    });

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    search(newValue);
    setShowSuggestions(true);
    setSelectedIndex(-1);
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: ProductSuggestion) => {
    onChange(suggestion.name);
    setShowSuggestions(false);
    setSelectedIndex(-1);

    // Record positive feedback
    recordFeedback(
      value,
      suggestion.catalog_id,
      true,
      suggestion.catalog_id,
      suggestion.confidence_score
    );

    onSuggestionSelect?.(suggestion);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSuggestionSelect(suggestions[selectedIndex]);
        } else {
          setShowSuggestions(false);
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Confidence score color
  const getConfidenceColor = (score: number) => {
    if (score >= 0.9) return "text-green-600";
    if (score >= 0.8) return "text-blue-600";
    if (score >= 0.7) return "text-yellow-600";
    return "text-gray-600";
  };

  const getConfidenceText = (score: number) => {
    if (score >= 0.9) return "Excellent match";
    if (score >= 0.8) return "Good match";
    if (score >= 0.7) return "Possible match";
    return "Low confidence";
  };

  return (
    <div className="relative">
      <Label htmlFor="product-name">{label}</Label>
      <div className="relative">
        <Input
          ref={inputRef}
          id="product-name"
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          placeholder={placeholder}
          className={`pr-10 ${className}`}
          disabled={disabled}
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {isLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
          ) : (
            <Search className="h-4 w-4 text-gray-400" />
          )}
        </div>
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <Card
          className="absolute z-50 w-full mt-1 max-h-96 overflow-y-auto border shadow-lg"
          ref={suggestionsRef}
        >
          <CardContent className="p-0">
            <div className="p-3 border-b bg-gray-50">
              <p className="text-sm text-gray-600">
                Found {suggestions.length} similar product
                {suggestions.length > 1 ? "s" : ""}
              </p>
            </div>
            {suggestions.map((suggestion, index) => (
              <div
                key={suggestion.catalog_id}
                className={`p-3 border-b last:border-b-0 cursor-pointer transition-colors ${
                  index === selectedIndex
                    ? "bg-blue-50 border-blue-200"
                    : "hover:bg-gray-50"
                }`}
                onClick={() => handleSuggestionSelect(suggestion)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Package className="h-4 w-4 text-gray-400" />
                      <h4 className="font-medium text-sm">{suggestion.name}</h4>
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      {suggestion.brand && (
                        <Badge variant="outline" className="text-xs">
                          {suggestion.brand}
                        </Badge>
                      )}
                      {suggestion.category_name && (
                        <Badge variant="secondary" className="text-xs">
                          {suggestion.category_name}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-xs text-gray-600">
                      {suggestion.bestPrice && (
                        <span>From ${suggestion.bestPrice}</span>
                      )}
                      <span>
                        {suggestion.vendorCount} seller
                        {suggestion.vendorCount > 1 ? "s" : ""}
                      </span>
                      <span
                        className={getConfidenceColor(
                          suggestion.confidence_score
                        )}
                      >
                        {Math.round(suggestion.confidence_score * 100)}% -{" "}
                        {getConfidenceText(suggestion.confidence_score)}
                      </span>
                    </div>

                    {suggestion.match_reasons.length > 0 && (
                      <div className="flex gap-1 mt-2">
                        {suggestion.match_reasons.map((reason, i) => (
                          <Badge
                            key={i}
                            variant="outline"
                            className="text-xs text-green-600"
                          >
                            <Check className="h-3 w-3 mr-1" />
                            {reason}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            <div className="p-3 border-t bg-gray-50">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => {
                  setShowSuggestions(false);
                  // Record that user rejected all suggestions
                  if (suggestions.length > 0) {
                    recordFeedback(value, suggestions[0].catalog_id, false);
                  }
                }}
              >
                <X className="h-4 w-4 mr-2" />
                None of these match - Create new product
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
