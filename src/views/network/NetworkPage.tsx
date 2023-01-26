import { useEffect } from "react";
import { Tabs } from "antd";
import { useDispatch } from 'react-redux';

import { Blockchain, Node, Dex, Coin } from "./components";
import { getAllBlockchain } from '../../store/network/network.action';
import { getAllNode } from '../../store/network/network.action';
import { getAllDex } from '../../store/network/network.action';
import { getAllCoin } from '../../store/network/network.action';

export const NetworkPage = () => {
  const dispatch = useDispatch();
  const { TabPane } = Tabs;

  useEffect(() => {
    dispatch(getAllBlockchain());
    dispatch(getAllNode());
    dispatch(getAllDex());
    dispatch(getAllCoin());
  }, [dispatch]);

  return (
    <div className="p-3 rounded-md" style={{background: 'rgba(68, 70, 79, 0.5)'}}>
      <Tabs className="p-3">
        <TabPane tab="Chains" key="1">
          <Blockchain />
        </TabPane>
        <TabPane tab="Nodes" key="2">
          <Node />
        </TabPane>
        <TabPane tab="Coins" key="3">
          <Coin />
        </TabPane>
        <TabPane tab="DEXs" key="4">
          <Dex />
        </TabPane>
      </Tabs>
    </div>
  )
}
