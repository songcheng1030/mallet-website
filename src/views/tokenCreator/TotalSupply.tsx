import { useEffect, useState } from "react";
import Web3 from "web3";
import { formattedNumber } from "shared";
const erc20ABI = require("shared/erc20.json");

const TotalSupply = (props: any) => {
  const [value, setValue] = useState(0);
  const getTokenTotalSupply = async (rpcUrl: string, tokenAddress: string) => {
    try {
      const web3Client = new Web3(rpcUrl);
      const tokenErc20Contract = new web3Client.eth.Contract(erc20ABI, tokenAddress);
      const decimals = await tokenErc20Contract.methods.decimals().call();
      const totalSupply = await tokenErc20Contract.methods.totalSupply().call();
      return totalSupply / (10 ** decimals);
    } catch(e) {
      console.log(e)
      return 0;
    }
  }
  
  useEffect(() => {
    if (props.rpcUrl === '' || !props.tokenAddress) {
      setValue(0);
    } else {
      getTokenTotalSupply(props.rpcurl, props.tokenAddress).then((res) => {
          setValue(res);
      })
    }
  }, [props])
  return (
    <div className="text-blue">
      {formattedNumber(value)}
    </div>
  )
}

export default TotalSupply;