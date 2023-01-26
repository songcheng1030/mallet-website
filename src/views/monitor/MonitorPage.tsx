import { useState, useEffect } from 'react';
import { Button, Table, Tabs, Space, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined, PauseCircleOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';

import TradingVeiw from './TradingView';
import TradingForm from './TradingForm';
import { getAllBlockchain } from '../../store/network/network.action';
import { getAllNode } from '../../store/network/network.action';
import { getAllDex } from '../../store/network/network.action';
import { getAllCoin } from '../../store/network/network.action';
import { loadMyWallet } from '../../store/wallet/wallet.actions';
import { getBots, stopBot, deleteBot, getStatuses } from '../../store/manualBot/manualBot.actions';
import { selectManualBots } from '../../store/manualBot/manualBot.selectors';
import { IBlockchain, IDex, IBotState, IBot, EBotType, IBotTradingRequest } from '../../types';
import { CopyableLabel } from '../../components/common/CopyableLabel';
import { shortenAddress } from '../../shared';
// import { tokenTxData, tokenTxColumns, buyerColumns, buyerData, sellerColumns, sellerData } from './tableData';
import { DetailBot } from '../bot/detail';
import { selectElapsedTime } from "../../store/auth/auth.selectors";

const { TabPane } = Tabs;

export const MonitorPage = () => {
  const dispatch = useDispatch();
  const manualBots = useSelector(selectManualBots);
  const elapsedTime = useSelector(selectElapsedTime);

  const [isDetail, setIsDetail] = useState<boolean>(false);
  const [detailBot, setDetailBot] = useState<IBot | null>(null);
  const [selectedBot, setSelectedBot] = useState<IBot | undefined>(undefined);
  const [initTime, setInitTime] = useState<number>(0);
  const [flag, setFlag] = useState<boolean>(false);

  useEffect(() => {
    dispatch(getAllBlockchain());
    dispatch(getAllNode());
    dispatch(getAllDex());
    dispatch(getAllCoin());
    dispatch(loadMyWallet());
    dispatch(getBots());
  }, [dispatch]);

  useEffect(() => {
    if (!flag) {
      setInitTime(elapsedTime);
    }
    setFlag(true);
    
    if ((elapsedTime - initTime) % 2 === 0) {
      dispatch(getStatuses());
    }
  }, [elapsedTime, dispatch, flag, initTime]);

  const handleDetails = (bot: IBot) => {
    setDetailBot(bot);
    setIsDetail(true);
  }

  const handleDelete = (botId: string) => {
    dispatch(deleteBot(botId));
  }

  const handleStop = (bot: IBot) => {
    const payload: IBotTradingRequest = {
      botId: bot._id,
      type: bot.type,
      active: false
    };
    dispatch(stopBot(payload));
  }

  const manualColumns = [
    {
      title: 'No',
      key: 'index',
      width: 60,
      render: (text: any, record: any, index: number) => (<>{index + 1}</>)
    },
    {
      title: 'Chain',
      dataIndex: 'blockchain',
      key: 'blockchain',
      render: (blockchain: IBlockchain) => (
        <Space size="middle">
          <div> {blockchain.name} </div>
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
      key: 'token',
      width: 160,
      render: (bot: IBot) => (
        <Space size="middle">
          <a 
            href={`${bot.blockchain.explorer}/address/${bot.token.address}`}
            target="_blank"
            rel="noreferrer"
          >
            {shortenAddress(bot.token.address)}
          </a>
          <CopyableLabel value={bot.token.address} label="" />
        </Space>
      )
    },
    {
      title: 'Type',
      key: 'type',
      render: (bot: IBot) => (
        <div>
          <span>{bot.type}</span>
          <span> - </span>
          <span>{bot.type === EBotType.BUY ? bot.buy?.type : bot.sell?.type}</span>
        </div>
      )
    },
    {
      title: 'Amount',
      key: 'amount',
      render: (bot: IBot) => (
        <Space size="middle">
          <div> {bot.type === EBotType.BUY ? bot.buy?.amount : bot.sell?.items[0]?.amount} {bot.type === EBotType.BUY ? bot.coin.symbol : '%'} </div>
        </Space>
      )
    },
    {
      title: 'Gas Price [GWEI]',
      key: 'gasPrice',
      render: (bot: IBot) => (
        <Space size="middle">
          <div> {bot.type === EBotType.BUY ? bot.buy?.gasPrice : bot.sell?.gasPrice} </div>
        </Space>
      )
    },
    {
      title: 'Status',
      dataIndex: 'state',
      key: 'state',
      render: (state: IBotState) => (
        <Space size="middle">
          <div> {state.status} </div>
        </Space>
      )
    },
    {
      title: 'Action',
      key: 'botDetail',
      width: 250,
      render: (bot: IBot) => (
        <Space size="middle">
          <Button 
            type='primary'
            shape="round" 
            icon={<EditOutlined />} 
            size={'small'}
            onClick={()=>handleDetails(bot)}
          >
            Details
          </Button>
          {!bot.state.active && <Popconfirm 
            placement="top" 
            title="Are you sure you want to delete this bot?" 
            onConfirm={() => handleDelete(bot._id)} 
            okText="Yes" 
            cancelText="No"
            key="delete"
          >
            <Button type="primary" size='small' shape='round' icon={<DeleteOutlined />} danger>
              Delete
            </Button>
          </Popconfirm>}
          {bot.state.active && 
            <Button 
              type="primary" 
              size='small' 
              shape='round' 
              icon={<PauseCircleOutlined />} 
              onClick={() => handleStop(bot)}
              danger
            >
              Stop
            </Button>
          }
        </Space>
      )
    },
  ];

  const rowSelection = {
    onChange: (selectedRowKeys: React.Key[], selectedRows: IBot[]) => {
      setSelectedBot(selectedRows[0])
    },
    getCheckboxProps: (record: IBot) => ({
      disabled: false,
      name: record._id,
    }),
  };

  return (
    <div className="bg-gray-dark rounded-md p-3">
      <div className="p-3 bg-gray-dark">
        <div className='flex'>
          <div style={{height: 550}} className='w-full'>
            <TradingVeiw />
          </div>
          <TradingForm bot={selectedBot} />
        </div>

        <Tabs>
          <TabPane
            tab="Manual Trading"
            key={0}
          >
            <Table 
              rowSelection={{
                type: 'radio',
                ...rowSelection,
              }} 
              columns={manualColumns} 
              dataSource={manualBots} 
              rowKey="_id" 
              pagination={false}
              scroll={{ x: 1100, y: 400 }}
            />
          </TabPane>
          {/* <TabPane
            tab="Token tx"
            key={1}
          >
            <Table 
              columns={tokenTxColumns} 
              dataSource={tokenTxData} 
              rowKey="_id"
              pagination={false}
              scroll={{ x: 1100, y: 400 }}
            />
          </TabPane>
          <TabPane
            tab="Buyers"
            key={2}
          >
            <Table 
              columns={buyerColumns} 
              dataSource={buyerData} 
              rowKey="_id"
              pagination={false}
              scroll={{ x: 1100, y: 400 }}
            />
          </TabPane>
          <TabPane
            tab="Sellers"
            key={3}
          >
            <Table 
              columns={sellerColumns} 
              dataSource={sellerData} 
              rowKey="_id"
              pagination={false}
              scroll={{ x: 1100, y: 400 }}
            />
          </TabPane> */}
        </Tabs>
      </div>
      {isDetail && detailBot && <DetailBot visible={isDetail} setVisible={setIsDetail} botId={detailBot._id} />}
    </div>
  )
}
