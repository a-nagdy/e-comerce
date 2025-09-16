/**
 * Currency utilities for the e-commerce platform
 * Uses native Intl.NumberFormat for formatting (no external dependencies)
 */

export interface CurrencyConfig {
    code: string;
    symbol: string;
    name: string;
    locale: string;
    precision: number;
}

export const SUPPORTED_CURRENCIES: Record<string, CurrencyConfig> = {
    USD: {
        code: 'USD',
        symbol: '$',
        name: 'US Dollar',
        locale: 'en-US',
        precision: 2,
    },
    EUR: {
        code: 'EUR',
        symbol: '€',
        name: 'Euro',
        locale: 'de-DE',
        precision: 2,
    },
    GBP: {
        code: 'GBP',
        symbol: '£',
        name: 'British Pound',
        locale: 'en-GB',
        precision: 2,
    },
    EGP: {
        code: 'EGP',
        symbol: 'ج.م.',
        name: 'Egyptian Pound',
        locale: 'ar-EG',
        precision: 2,
    },
    JPY: {
        code: 'JPY',
        symbol: '¥',
        name: 'Japanese Yen',
        locale: 'ja-JP',
        precision: 0,
    },
};

/**
 * Format currency amount using native Intl.NumberFormat
 */
export function formatCurrency(
    amount: number | string,
    currencyCode: string = 'USD',
    options?: {
        locale?: string;
        showSymbol?: boolean;
        precision?: number;
    }
): string {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

    if (isNaN(numAmount)) {
        return '0.00';
    }

    const currency = SUPPORTED_CURRENCIES[currencyCode] || SUPPORTED_CURRENCIES.USD;
    const locale = options?.locale || currency.locale;
    const precision = options?.precision ?? currency.precision;

    if (options?.showSymbol === false) {
        return new Intl.NumberFormat(locale, {
            style: 'decimal',
            minimumFractionDigits: precision,
            maximumFractionDigits: precision,
        }).format(numAmount);
    }

    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: precision,
        maximumFractionDigits: precision,
    }).format(numAmount);
}

/**
 * Parse currency string to number
 */
export function parseCurrency(currencyString: string): number {
    // Remove all non-numeric characters except decimal points and minus signs
    const cleanString = currencyString.replace(/[^\d.-]/g, '');
    const parsed = parseFloat(cleanString);
    return isNaN(parsed) ? 0 : parsed;
}

/**
 * Add two currency amounts safely
 */
export function addCurrency(amount1: number, amount2: number): number {
    return Math.round((amount1 + amount2) * 100) / 100;
}

/**
 * Multiply currency by a factor safely
 */
export function multiplyCurrency(amount: number, factor: number): number {
    return Math.round(amount * factor * 100) / 100;
}

/**
 * Calculate percentage of an amount
 */
export function calculatePercentage(amount: number, percentage: number): number {
    return Math.round(amount * (percentage / 100) * 100) / 100;
}

/**
 * Format currency for display in tables/cards
 */
export function formatCurrencyCompact(
    amount: number | string,
    currencyCode: string = 'USD'
): string {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

    if (isNaN(numAmount)) {
        return '0';
    }

    const currency = SUPPORTED_CURRENCIES[currencyCode] || SUPPORTED_CURRENCIES.USD;

    // For large numbers, use compact notation
    if (Math.abs(numAmount) >= 1000000) {
        return new Intl.NumberFormat(currency.locale, {
            style: 'currency',
            currency: currencyCode,
            notation: 'compact',
            maximumFractionDigits: 1,
        }).format(numAmount);
    }

    return formatCurrency(numAmount, currencyCode);
}

/**
 * Get currency symbol only
 */
export function getCurrencySymbol(currencyCode: string): string {
    const currency = SUPPORTED_CURRENCIES[currencyCode];
    return currency?.symbol || '$';
}

/**
 * Validate currency code
 */
export function isValidCurrency(currencyCode: string): boolean {
    return currencyCode in SUPPORTED_CURRENCIES;
}

/**
 * Get all supported currencies for dropdowns
 */
export function getSupportedCurrencies(): CurrencyConfig[] {
    return Object.values(SUPPORTED_CURRENCIES);
}
