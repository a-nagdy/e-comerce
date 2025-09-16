"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCurrency } from "@/hooks/use-currency";
import { DollarSign } from "lucide-react";

interface CurrencySelectorProps {
  className?: string;
  showIcon?: boolean;
  compact?: boolean;
}

export function CurrencySelector({
  className,
  showIcon = true,
  compact = false,
}: CurrencySelectorProps) {
  const { currentCurrency, changeCurrency, getAllCurrencies } = useCurrency();
  const currencies = getAllCurrencies();

  return (
    <Select value={currentCurrency} onValueChange={changeCurrency}>
      <SelectTrigger className={className}>
        {showIcon && <DollarSign className="h-4 w-4 mr-2" />}
        <SelectValue placeholder="Select currency" />
      </SelectTrigger>
      <SelectContent>
        {currencies.map((currency) => (
          <SelectItem key={currency.code} value={currency.code}>
            <div className="flex items-center gap-2">
              <span className="font-medium">{currency.symbol}</span>
              <span>{currency.code}</span>
              {!compact && (
                <span className="text-sm text-muted-foreground">
                  {currency.name}
                </span>
              )}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
