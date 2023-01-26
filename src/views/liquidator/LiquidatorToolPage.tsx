import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { getAllBlockchain } from '../../store/network/network.action';
import { getAllNode } from '../../store/network/network.action';
import { getAllDex } from '../../store/network/network.action';
import { getAllCoin } from '../../store/network/network.action';
import { loadMyWallet } from '../../store/wallet/wallet.actions';
import { loadMyCexAccounts } from '../../store/cexAccount/cexAccount.actions';
import { Liquidators } from './Liquidators';

export const LiquidatorToolPage = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getAllBlockchain());
    dispatch(getAllNode());
    dispatch(getAllDex());
    dispatch(getAllCoin());
    dispatch(loadMyWallet());
    dispatch(loadMyCexAccounts());
  }, [dispatch]);

  return (
    <div className="bg-gray-dark rounded-md p-3">
      <Liquidators />
    </div>
  );
}
