import { useState } from 'react'
import { Tabs, Pagination } from 'antd';

import { EditBot } from './edit';
import { IBot, ERunningStatus, EBotType } from '../../types';
import Bot from './Bot';

export interface Tab {
  name: string,
  filterKey: ERunningStatus | '',
};

const tabs: Tab[] = [
  {
    name: 'All',
    filterKey: '',
  },
  {
    name: 'Draft',
    filterKey: ERunningStatus.DRAFT,
  },
  {
    name: 'Running',
    filterKey: ERunningStatus.RUNNING,
  },
  {
    name: 'Succeeded',
    filterKey: ERunningStatus.SUCCEEDED,
  },
  {
    name: 'Failed',
    filterKey: ERunningStatus.FAILED,
  },
  {
    name: 'Archived',
    filterKey: ERunningStatus.ARCHIVED,
  },
];

const { TabPane } = Tabs;

interface ContentProps {
  data: IBot[],
  total: number;
  setPage: (page: number) => void;
  setSelectedTab: (tab: ERunningStatus | '') => void
};

export const CardView = (props: ContentProps) => {
  const [visible, setVisible] = useState<boolean>(false);
  const [isDuplicate, setIsDuplicate] = useState<boolean>(false);
  const [selectedBot, setSelectedBot] = useState<IBot | null>(null);
  const { data, total, setPage, setSelectedTab } = props;

  const callback = (key: string) => {
    setSelectedTab(key as ERunningStatus | '');
    setPage(1);
  }

  return (
    <>
      <Tabs onChange={callback} >
        {tabs.map((item) => (
          <TabPane 
            tab={item.name} 
            key={item.filterKey}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {
                data.map((item, idx) => (
                  <Bot 
                    item={item}
                    setSelectedBot={setSelectedBot}
                    setVisible={()=>setVisible(true)}
                    setIsDuplicate={setIsDuplicate}
                    key={idx}
                  />
                ))
              }
            </div>
            <div className='float-right mt-5'>
              <Pagination defaultCurrent={1} total={total} onChange={(page)=>setPage(page)} showSizeChanger={false} />
            </div>
          </TabPane>
        ))}
      </Tabs>
      {visible && selectedBot && <EditBot bot={selectedBot} visible={visible} setVisible={setVisible} isEdit={true} onlyBuy={selectedBot.type===EBotType.BUY} />}
      {isDuplicate && selectedBot && <EditBot bot={selectedBot} visible={isDuplicate} setVisible={setIsDuplicate} isEdit={false} onlyBuy={selectedBot.type===EBotType.BUY} />}
    </>
  );
}
