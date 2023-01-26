import { useState, useEffect } from "react";
import Web3 from 'web3';
import { formattedNumber } from "../../../shared";

interface Props {
  rpc: string;
  address: string;
  symbol: string;
}

export const Balance = (props: Props) => {
  const {rpc, address, symbol} = props;

  const [balance, setBalance] = useState<number>(0);

  useEffect(() => {
    if (rpc.length > 0) {
      const web3Client = new Web3(rpc);
      web3Client.eth.getBalance(address).then((res) => {
        setBalance(Number(res) / 1e18);
      })
    }
  }, [rpc, address]);

  return (
    <div>
      <span className="text-blue">{formattedNumber(balance)}</span>
      <span className="ml-2">{symbol}</span>
    </div>
  )
}
