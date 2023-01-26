import { useState, useMemo } from 'react';
import { Table, Space, Button, Popconfirm, Tabs } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined, StopOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { TablePaginationConfig } from 'antd/lib/table/interface';

import { DetailBot } from './detail';
import { EditBot } from './edit';
import { ERunningStatus, IBlockchain, IBot, IBotBuy, IBotSell, IBotState, IDex, INode, IWallet, IToken, runningColorTxt, IBotTradingRequest, tradingTxt, EBotType } from '../../types';
import { CopyableLabel } from '../../components/common/CopyableLabel';
import { shortenAddress } from '../../shared';
import { deleteBot, startBot, stopBot } from "../../store/bot/bot.actions";

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
  data: IBot[];
  total: number;
  setPage: (page: number) => void;
  setSelectedTab: (tab: ERunningStatus | '') => void
};

export const ListView = (props: ContentProps) => {
  const dispatch = useDispatch();
  const [visible, setVisible] = useState<boolean>(false);
  const [selectedBot, setSelectedBot] = useState<IBot | null>(null);
  const [isDetail, setIsDetail] = useState<boolean>(false);
  
  const { data, total, setSelectedTab, setPage } = props;

  const callback = (key: string) => {
    setSelectedTab(key as ERunningStatus | '');
    setPage(1);
  }

  const handleEdit = (bot: IBot) => {
    setSelectedBot(bot);
    setVisible(true);
  }

  const handleDetails = (bot: IBot) => {
    setSelectedBot(bot);
    setIsDetail(true);
  }

  const handleDelete = (botId: string) => {
    dispatch(deleteBot(botId));
  }

  const handleStartStop = (bot: IBot) => {
    const payload: IBotTradingRequest = {
      botId: bot._id,
      type: bot.type,
      active: !bot.state.active
    };

    if (bot.state.active) {
      dispatch(stopBot(payload));
    } else {
      dispatch(startBot(payload));
    }
  }

  const onChangeBotNumber = useMemo(() => {
    if (!selectedBot?.uniqueNum) return '0000';
    const str = '0000' + selectedBot.uniqueNum;
    return str.slice(str.length - 4);
  }, [selectedBot?.uniqueNum]);

  const handleTableChange = (
    pagination: TablePaginationConfig,
    filters: any,
    sorter: any,
  ) => {
    setPage(pagination.current ? pagination.current : 1);
  }

  const columns = [
    {
      title: 'No',
      dataIndex: 'uniqueNum',
      key: 'index',
      render: (index: number) => (<>{index ? index : 0}</>)
    },
    {
      title: 'Blockchain',
      dataIndex: 'blockchain',
      key: 'blockchain',
      render: (blockchain: IBlockchain) => (
        <Space size="middle">
          <div> {blockchain.name} </div>
        </Space>
      )
    },
    {
      title: 'Node',
      dataIndex: 'node',
      key: 'node',
      render: (node: INode) => (
        <Space size="middle">
          <div> {node.name} </div>
        </Space>
      )
    },
    {
      title: 'DEX',
      dataIndex: 'dex',
      key: 'dex',
      render: (dex: IDex) => (
        <Space size="middle">
          <div> {dex.name} </div>
        </Space>
      )
    },
    {
      title: 'Token address',
      dataIndex: 'token',
      key: 'token',
      render: (token: IToken) => (
        <Space size="middle">
          <div>{shortenAddress(token.address)}</div>
          <CopyableLabel value={token.address} label="" />
        </Space>
      )
    },
    {
      title: 'Wallet',
      dataIndex: 'wallet',
      key: 'wallet',
      render: (wallet: IWallet) => (
        <Space size="middle">
          <div>{wallet.name}</div>
          {/* <div>{shortenAddress(wallet.publicKey)}</div>
          <CopyableLabel value={wallet.publicKey} label="" /> */}
        </Space>
      )
    },
    {
      title: 'Buy',
      dataIndex: 'buy',
      key: 'buy',
      render: (buy: IBotBuy) => (
        <Space size="middle">
          <div> {buy ? buy.type : ''} </div>
        </Space>
      )
    },
    {
      title: 'Sell',
      dataIndex: 'sell',
      key: 'sell',
      render: (sell: IBotSell) => (
        <Space size="middle">
          <div> {sell ? sell.type : ''} </div>
        </Space>
      )
    },
    {
      title: 'Bot status',
      dataIndex: 'state',
      key: 'state',
      render: (state: IBotState) => (
        <Space>
          <div className={`mr-2 w-3 h-3 rounded ${runningColorTxt[state.status]}`} />
          <div> {state.status} </div>
        </Space>
      )
    },
    {
      title: 'Action',
      key: 'botDetail',
      width: 300,
      render: (bot: IBot) => (
        <>
          <Space size="middle">
            {bot.state.status !== ERunningStatus.ARCHIVED && <Button 
              shape="round" 
              type='primary' 
              icon={bot.state.active ? <StopOutlined /> : <PlayCircleOutlined />} 
              size={'small'} 
              onClick={()=>handleStartStop(bot)}
              danger={bot.state.active}
              key="start_stop"
              loading={bot.state.status === ERunningStatus.WAITING ? true : false}
            >
            </Button>}
            <Button 
              shape="round" 
              icon={<EditOutlined />} 
              size={'small'}
              onClick={()=>handleEdit(bot)}
              disabled={bot.state.active}
              key="edit"
            >
            </Button>
            <Button 
              shape="round" 
              icon={<EyeOutlined />} 
              size={'small'}
              onClick={()=>handleDetails(bot)}
              key="detail"
            >
            </Button>
            <Popconfirm 
              placement="top" 
              title="Are you sure you want to delete this bot?" 
              onConfirm={() => handleDelete(bot._id)} 
              okText="Yes" 
              cancelText="No"
              key="delete"
            >
              <Button size='small' shape='round' icon={<DeleteOutlined />} disabled={bot.state.active}>
              </Button>
            </Popconfirm>
          </Space>
          <div className='mt-2 w-full' style={bot.state.active ? {} : {display: 'none'}}>
            {`${tradingTxt[bot.state.thread] ? tradingTxt[bot.state.thread] : bot.state.thread} : ${bot.state.result}`}
          </div>
        </>
      )
    },
  ];

  return (
    <>
      <Tabs onChange={callback} >
        {tabs.map((item) => (
          <TabPane 
            tab={item.name} 
            key={item.filterKey}
          >
            {/* {data && data.length > 0 &&  */}
              <Table 
                columns={columns} 
                dataSource={data || []} 
                rowKey="_id" 
                onChange={handleTableChange}
                pagination={{total: total}}
                scroll={{x: 1400}}
              />
              {/* } */}
          </TabPane>
        ))}
      </Tabs>
      {visible && selectedBot && <EditBot bot={selectedBot} visible={visible} setVisible={setVisible} isEdit={true} onlyBuy={selectedBot.type===EBotType.BUY} />}
      {isDetail && selectedBot && <DetailBot visible={isDetail} setVisible={setIsDetail} botId={selectedBot._id} botName={`BOT ${onChangeBotNumber}`} />}
    </>
  );
}
