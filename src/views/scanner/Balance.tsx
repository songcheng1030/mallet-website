import { useState } from 'react';
import { useEffect } from 'react';
import Web3 from 'web3';
import { formattedNumber } from '../../shared';
const erc20ABI = require("shared/erc20.json");

interface Props {
  rpcUrl: string, 
  tokenAddress: string, 
  walletAddress: string
}
const Balance = (props: Props) => {
  const {rpcUrl, tokenAddress, walletAddress} = props;
  const [balance, setBalance] = useState(0)
  const getTokenBalance = async (rpcUrl: string, tokenAddress: string, walletAddress: string) => {
    const web3Client = new Web3(rpcUrl);
    const tokenErc20Contract = new web3Client.eth.Contract(erc20ABI, tokenAddress)
    const balance = await tokenErc20Contract.methods.balanceOf(walletAddress).call();
    const decimals = await tokenErc20Contract.methods.decimals().call();
    return balance / (10 ** decimals);
  }
  
  useEffect(() => {
    if (rpcUrl === '') {
      setBalance(0)
    } else {
      getTokenBalance(rpcUrl, tokenAddress, walletAddress).then((res) => {
        setBalance(res);
      })
    }
  }, [rpcUrl, tokenAddress, walletAddress])
  return (
    <div className='text-green-dark'>
      ({formattedNumber(balance)})
    </div>
  )
}
export default Balance;