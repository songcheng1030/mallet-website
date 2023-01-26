import React from "react";
import { AdvancedRealTimeChart } from "react-ts-tradingview-widgets";

interface Props {
  // symbol: string;
}

const TradingView = React.memo((props: Props) => {
  return (
    <div className="mb-3 w-full bg-gray-darkest">
      <AdvancedRealTimeChart 
        theme="dark"
        symbol="ETHUSDT"
        autosize
      ></AdvancedRealTimeChart>
    </div>
  )
});

export default TradingView;
