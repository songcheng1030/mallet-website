import React, { useEffect, useState } from "react";
import generic from "cryptocurrency-icons/svg/color/generic.svg";

export type IconVariant = "color" | "black" | "white;";

type IconProps = {
  symbol: string;
  variant?: IconVariant;
  className?: string;
};
export function TokenIcon({ symbol, variant = "color", className }: IconProps) {
  const [iconModule, setIconModule] = useState<any>(null);

  useEffect(() => {
    const formattedSymbol = symbol.toLowerCase();
    import(`cryptocurrency-icons/svg/${variant}/${formattedSymbol}.svg`)
      .then((module) => {
        setIconModule(module.default);
      })
      .catch((error) => {
        setIconModule(null);
      });
  }, [symbol, variant]);

  return (
    <img
      src={iconModule || generic}
      alt={symbol}
      key={symbol}
      className={`inline-block h-4 w-4 align-text-bottom mr-2 ${className} rounded-full`}
    />
  );
}
