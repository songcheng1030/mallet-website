import { useState, useEffect, useMemo } from "react";
import { Tabs } from "antd";

import { LiquidatorReport } from "./liquidator";
import { reportService } from "../../services";
import { CexReport } from "./cex";
import { ILiquidatorTransaction } from '../../types';

const { TabPane } = Tabs;

export const ReportPage = () => {
  const [currentTab, setCurrentTab] = useState<string>("dex");
  const [data, setData] = useState<ILiquidatorTransaction[]>([]);

  useEffect(() => {
    reportService.getLiquidatorReport().then(res => {
      console.log("res", res)
      setData(res);
    })
    .catch(err => {
      console.log("error", err);
    });
  }, []);

  const filteredData = useMemo(() => {
    let computed = data;
    computed = computed.filter(el => (currentTab === 'dex' && el.isDex === true) || (currentTab === 'cex' && el.isDex === false));
    return computed;
  }, [data, currentTab]);

  const onChangeTab = (tab: string) => {
    setCurrentTab(tab);
  }

  return (
    <div className="bg-gray-dark rounded-md p-3">
      <div className="p-3">
        <Tabs onChange={onChangeTab} activeKey={currentTab}>
          <TabPane tab="DEX" tabKey="dex" key={"dex"}>
            <LiquidatorReport data={filteredData} />
          </TabPane>
          <TabPane tab="CEX" tabKey="cex" key="cex">
            <CexReport data={filteredData}/>
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
}
