"use client";

import {
    formatCurrency,
    formatCurrencyCompact,
    SUPPORTED_CURRENCIES,
    type CurrencyConfig
} from '@/lib/currency';
import { useEffect, useState } from 'react';

interface UseCurrencyOptions {
    defaultCurrency?: string;
    storageKey?: string;
}

export function useCurrency(options: UseCurrencyOptions = {}) {
    const { defaultCurrency = 'USD', storageKey = 'marketplace-currency' } = options;

    const [currentCurrency, setCurrentCurrency] = useState<string>(defaultCurrency);
    const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({});
    const [isLoading, setIsLoading] = useState(false);

    // Load currency from localStorage on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedCurrency = localStorage.getItem(storageKey);
            if (savedCurrency && savedCurrency in SUPPORTED_CURRENCIES) {
                setCurrentCurrency(savedCurrency);
            }
        }
    }, [storageKey]);

    // Save currency to localStorage when changed
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(storageKey, currentCurrency);
        }
    }, [currentCurrency, storageKey]);

    const changeCurrency = (newCurrency: string) => {
        if (newCurrency in SUPPORTED_CURRENCIES) {
            setCurrentCurrency(newCurrency);
        }
    };

    const format = (amount: number | string, options?: {
        currency?: string;
        compact?: boolean;
        showSymbol?: boolean;
    }) => {
        const currency = options?.currency || currentCurrency;

        if (options?.compact) {
            return formatCurrencyCompact(amount, currency);
        }

        return formatCurrency(amount, currency, {
            showSymbol: options?.showSymbol,
        });
    };

    const convert = (amount: number, fromCurrency: string, toCurrency?: string) => {
        const targetCurrency = toCurrency || currentCurrency;

        if (fromCurrency === targetCurrency) {
            return amount;
        }

        // If we have exchange rates, use them
        if (exchangeRates[fromCurrency] && exchangeRates[targetCurrency]) {
            const usdAmount = amount / exchangeRates[fromCurrency];
            return usdAmount * exchangeRates[targetCurrency];
        }

        // Fallback: return original amount if no conversion data
        return amount;
    };

    const getCurrentConfig = (): CurrencyConfig => {
        return SUPPORTED_CURRENCIES[currentCurrency] || SUPPORTED_CURRENCIES.USD;
    };

    const getAllCurrencies = (): CurrencyConfig[] => {
        return Object.values(SUPPORTED_CURRENCIES);
    };

    // Optional: Fetch exchange rates (you can integrate with a free API)
    const fetchExchangeRates = async () => {
        setIsLoading(true);
        try {
            // Example with a free API (you'll need to sign up for a key)
            // const response = await fetch(`https://api.exchangerate-api.com/v4/latest/USD`);
            // const data = await response.json();
            // setExchangeRates(data.rates);

            // For now, set some mock rates
            setExchangeRates({
                USD: 1,
                EUR: 0.85,
                GBP: 0.73,
                EGP: 31.25,
                JPY: 110,
            });
        } catch (error) {
            console.error('Failed to fetch exchange rates:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        currentCurrency,
        changeCurrency,
        format,
        convert,
        getCurrentConfig,
        getAllCurrencies,
        exchangeRates,
        fetchExchangeRates,
        isLoading,
    };
}
