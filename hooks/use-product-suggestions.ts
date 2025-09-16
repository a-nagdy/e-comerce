"use client";

import { debounce } from 'lodash';
import { useCallback, useEffect, useState } from 'react';

interface ProductSuggestion {
    catalog_id: string;
    name: string;
    brand: string;
    model: string;
    category_name: string;
    confidence_score: number;
    match_reasons: string[];
    bestPrice: number | null;
    vendorCount: number;
    bestVendor: string | null;
}

interface SuggestionsResponse {
    suggestions: ProductSuggestion[];
    query: string;
    hasMatches: boolean;
}

interface UseProductSuggestionsOptions {
    categoryId?: string;
    minLength?: number;
    debounceMs?: number;
    enabled?: boolean;
}

export function useProductSuggestions(options: UseProductSuggestionsOptions = {}) {
    const {
        categoryId,
        minLength = 3,
        debounceMs = 300,
        enabled = true
    } = options;

    const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [query, setQuery] = useState("");

    // Debounced search function
    const debouncedSearch = useCallback(
        debounce(async (searchQuery: string) => {
            if (!enabled || !searchQuery || searchQuery.length < minLength) {
                setSuggestions([]);
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                setError(null);

                const params = new URLSearchParams({
                    q: searchQuery,
                    limit: '5'
                });

                if (categoryId) {
                    params.append('categoryId', categoryId);
                }

                const response = await fetch(`/api/products/suggestions?${params}`);

                if (!response.ok) {
                    throw new Error('Failed to fetch suggestions');
                }

                const data: SuggestionsResponse = await response.json();
                setSuggestions(data.suggestions || []);
            } catch (err) {
                console.error('Error fetching suggestions:', err);
                setError(err instanceof Error ? err.message : 'Failed to fetch suggestions');
                setSuggestions([]);
            } finally {
                setIsLoading(false);
            }
        }, debounceMs),
        [categoryId, minLength, debounceMs, enabled]
    );

    // Search function to be called by components
    const search = useCallback((searchQuery: string) => {
        setQuery(searchQuery);
        if (searchQuery.length < minLength) {
            setSuggestions([]);
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        debouncedSearch(searchQuery);
    }, [debouncedSearch, minLength]);

    // Clear suggestions
    const clear = useCallback(() => {
        setSuggestions([]);
        setQuery("");
        setError(null);
        setIsLoading(false);
    }, []);

    // Record feedback when user accepts/rejects a suggestion
    const recordFeedback = useCallback(async (
        inputText: string,
        suggestedCatalogId: string,
        userChoice: boolean,
        actualCatalogId?: string,
        confidenceScore?: number
    ) => {
        try {
            await fetch('/api/products/suggestions/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    inputText,
                    suggestedCatalogId,
                    userChoice,
                    actualCatalogId,
                    confidenceScore,
                    categoryId
                })
            });
        } catch (err) {
            console.error('Error recording feedback:', err);
        }
    }, [categoryId]);

    // Auto-link product
    const autoLinkProduct = useCallback(async (
        productName: string,
        productData: any,
        options: {
            forceNewCatalog?: boolean;
            catalogId?: string;
        } = {}
    ) => {
        try {
            setError(null);

            const response = await fetch('/api/products/auto-link', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productName,
                    categoryId,
                    productData,
                    ...options
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create product');
            }

            const result = await response.json();

            // Record feedback if auto-linked
            if (result.action === 'linked' && suggestions.length > 0) {
                const matchedSuggestion = suggestions.find(s => s.catalog_id === result.catalogId);
                if (matchedSuggestion) {
                    await recordFeedback(
                        productName,
                        result.catalogId,
                        true,
                        result.catalogId,
                        matchedSuggestion.confidence_score
                    );
                }
            }

            return result;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create product');
            throw err;
        }
    }, [categoryId, suggestions, recordFeedback]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            debouncedSearch.cancel();
        };
    }, [debouncedSearch]);

    return {
        suggestions,
        isLoading,
        error,
        query,
        search,
        clear,
        recordFeedback,
        autoLinkProduct,
        hasMatches: suggestions.length > 0
    };
}
