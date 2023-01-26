import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button, Table, Space, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined, PlayCircleOutlined, StopOutlined } from '@ant-design/icons';
import { TablePaginationConfig } from 'antd/lib/table/interface';

import { selectVolumeBots, selectTotal } from "../../store/volumeBot/volumeBot.selectors";
import { getAllBlockchain } from '../../store/network/network.action';
import { getAllNode } from '../../store/network/network.action';
import { getAllDex } from '../../store/network/network.action';
import { getAllCoin } from '../../store/network/network.action';
import { loadMyWallet } from '../../store/wallet/wallet.actions';
import { searchVolumeBots, deleteVolumeBot, stopVolumeBot, startVolumeBot } from '../../store/volumeBot/volumeBot.actions'
import { AddVolumeBot } from './modals/AddVolumeBot';
import { EVolumeBotStatus, IBlockchain, ICoin, IDex, INode, IVolumeBot, IBotTradingRequest, runningColorTxt, VolumeBotFilter } from '../../types';
import { CopyableLabel } from '../../components/common/CopyableLabel';
import { shortenAddress } from '../../shared';
import { selectElapsedTime } from "../../store/auth/auth.selectors";

export const VolumeToolPage = () => {
  const [visible, setVisible] = useState<boolean>(false);
  const [selectedBot, setSelectedBot] = useState<string | null>(null);
  const [filter, setFilter] = useState<VolumeBotFilter>({
    page: 1,
    pageLength: 10
  });

  const dispatch = useDispatch();
  const data = useSelector(selectVolumeBots);
  const total = useSelector(selectTotal);
  const elapsedTime = useSelector(selectElapsedTime);

  useEffect(() => {
    dispatch(getAllBlockchain());
    dispatch(getAllNode());
    dispatch(getAllDex());
    dispatch(getAllCoin());
    dispatch(loadMyWallet());
  }, [dispatch]);

  useEffect(() => {
    if (elapsedTime % 3 === 0) {
      dispatch(searchVolumeBots(filter));
    }
  }, [elapsedTime, dispatch, filter]);

  const onDeleteBot = (id: string) => {
    dispatch(deleteVolumeBot(id));
  }

  const onEditBot = (bot: IVolumeBot) => {
    setSelectedBot(bot._id);
    setVisible(true);
  }

  const onActionBot = (bot: IVolumeBot) => {
    if (bot.state === EVolumeBotStatus.RUNNING) {
      const payload: IBotTradingRequest = {
        botId: bot._id,
        active: false
      };
      dispatch(stopVolumeBot(payload));
    } else {
      const payload: IBotTradingRequest = {
        botId: bot._id,
        active: true
      };
      dispatch(startVolumeBot(payload));
    }
  }

  const handleTableChange = (
    pagination: TablePaginationConfig,
    filters: any,
    sorter: any,
  ) => {
    setFilter({
      ...filter,
      page: pagination.current ? pagination.current : 1,
      pageLength: pagination.pageSize ? pagination.pageSize : 10
    });
  }

  const columns = [
    {
      title: '#',
      dataIndex: 'uniqueNum',
      key: 'index',
      width: 50,
      render: (index: number) => (<>{index ? index : 0}</>)
    },
    {
      title: 'Chain',
      dataIndex: 'blockchain',
      key: 'blockchain',
      render: (chain: IBlockchain) => (
        <div>{chain.name}</div>
      )
    },
    {
      title: 'Node',
      dataIndex: 'node',
      key: 'node',
      render: (node: INode) => (
        <div>{node.name}</div>
      )
    },
    {
      title: 'DEX',
      dataIndex: 'dex',
      key: 'dex',
      render: (dex: IDex) => (
        <div>{dex.name}</div>
      )
    },
    {
      title: 'Base Coin',
      dataIndex: 'coin',
      key: 'coin',
      render: (coin: ICoin) => (
        <div>{coin.name}</div>
      )
    },
    {
      title: 'Token',
      key: 'token',
      render: (bot: IVolumeBot) => (
        <Space>
          <a
            href={`${bot.blockchain.explorer}/address/${bot.token.address}`}
            target="_blank"
            rel="noreferrer"
          >
            {shortenAddress(bot.token.address)}
          </a>
          <CopyableLabel value={bot.token.address} label="" />
          <div className='ml-3 text-blue'>{bot.token.symbol}</div>
        </Space>
      )
    },
    {
      title: 'Status',
      width: 150,
      key: 'state',
      render: (bot: IVolumeBot) => (
        <Space>
          <div className={`mr-2 w-3 h-3 rounded ${runningColorTxt[bot.state]}`} />
          <div> {bot.state} </div>
        </Space>
      )
    },
    {
      title: 'Actions',
      key: 'action',
      width: 200,
      render: (bot: IVolumeBot) => (
        <Space size="middle">
          <Button
            loading={bot.state === EVolumeBotStatus.WAITING}
            shape="round"
            type='primary'
            icon={bot.state === EVolumeBotStatus.RUNNING ? <StopOutlined /> : <PlayCircleOutlined />}
            size={'small'}
            onClick={() => onActionBot(bot)}
            danger={bot.state === EVolumeBotStatus.RUNNING ? true : false}
            disabled={bot.state === EVolumeBotStatus.WAITING}
          >
          </Button>

          <Button 
            shape="round" 
            icon={<EditOutlined />} 
            size={'small'} 
            onClick={() => onEditBot(bot)}
            disabled={bot.state === EVolumeBotStatus.WAITING}
          >
          </Button>

          <Popconfirm
            placement="top"
            disabled={(bot.state === EVolumeBotStatus.RUNNING || bot.state === EVolumeBotStatus.WAITING) ? true : false}
            title="Are you sure you want to discard this bot?"
            onConfirm={() => onDeleteBot(bot._id)}
            okText="Yes"
            cancelText="No"
            key="delete"
          >
            <Button 
              disabled={(bot.state === EVolumeBotStatus.RUNNING || bot.state === EVolumeBotStatus.WAITING) ? true : false} 
              shape="round" 
              icon={<DeleteOutlined />} 
              size={'small'}
            >
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="bg-gray-dark rounded-md p-5">
      <div className="h-12 flex justify-center items-center">
        <div className="flex justify-between items-center w-full">
          <div className='w-full text-base text-blue'></div>
          <Button type="primary" onClick={() => { setSelectedBot(null); setVisible(true) }}>
            Add New
          </Button>
        </div>
      </div>
      <div className="bg-gray-dark">
        <Table
          columns={columns}
          dataSource={data}
          rowKey="_id"
          onChange={handleTableChange}
          pagination={{total: total}}
        />
      </div>
      {visible && <AddVolumeBot visible={visible} setVisible={setVisible} botId={selectedBot} />}
    </div>
  );
}
