import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button, Table, Space, Popconfirm, Select, Row, Col, Modal, Input, Progress } from 'antd';
import { EditOutlined, EyeOutlined, DeleteOutlined, PlayCircleOutlined, StopOutlined } from '@ant-design/icons';
import { TablePaginationConfig } from 'antd/lib/table/interface';

import { selectLiquidatorBots, selectTotal } from "../../store/liquidatorBot/liquidatorBot.selectors";
import { searchLiquidatorBots, deleteLiquidatorBot, startLiquidatorBot, stopLiquidatorBot } from '../../store/liquidatorBot/liquidatorBot.actions';
import { AddDexLiquidatorBot } from './modals/AddDexLiquidatorBot';
import { AddCexLiquidatorBot } from './modals/AddCexLiquidatorBot';
import { IBotTradingRequest, ILiquidatorBot, EBotType, ELiquidatorBotStatus, ELiquidatorBotType, LiquidatorFilter } from '../../types';
import { CopyableLabel } from '../../components/common/CopyableLabel';
import { formattedNumber, shortenAddress } from '../../shared';
import { LiquidatorDetails } from './LiquidatorDetails';
import { selectElapsedTime } from "../../store/auth/auth.selectors";
import { selectBlockchains } from '../../store/network/network.selectors';

const { Option } = Select;
const { Search } = Input;

export const Liquidators = () => {
  const [visible, setVisible] = useState<boolean>(false);
  const [filter, setFilter] = useState<LiquidatorFilter>({
    type: '',
    chain: '',
    tokenAddress: '',
    page: 1,
    pageLength: 10
  });
  const [createModeDlg, setCreateModeDlg] = useState<boolean>(false);
  const [createMode, setCreateMode] = useState<ELiquidatorBotType>(ELiquidatorBotType.DEX);
  const [selectedBot, setSelectedBot]= useState<ILiquidatorBot | null>(null);

  const [initTime, setInitTime] = useState<number>(0);
  const [flag, setFlag] = useState<boolean>(false);

  const dispatch = useDispatch();
  const data = useSelector(selectLiquidatorBots);
  const elapsedTime = useSelector(selectElapsedTime);
  const chainData = useSelector(selectBlockchains);
  const total = useSelector(selectTotal);

  useEffect(() => {
    if (!flag) {
      setInitTime(elapsedTime);
    }
    setFlag(true);
    
    if ((elapsedTime - initTime) % 3 === 0) {
      dispatch(searchLiquidatorBots(filter));
    }
  }, [elapsedTime, flag, initTime, dispatch, filter]);

  const onDeleteBot = (id: string) => {
    dispatch(deleteLiquidatorBot(id));
  }

  const onEditBot = (bot: ILiquidatorBot) => {
    setCreateMode(bot.type);
    setSelectedBot(bot);
    setVisible(true);
  }

  const onActionBot = (bot: ILiquidatorBot) => {
    if (bot.state === ELiquidatorBotStatus.RUNNING) {
      const payload: IBotTradingRequest = {
        botId: bot._id,
        type: bot.type === ELiquidatorBotType.DEX ? EBotType.DEX_LIQUIDATOR : EBotType.CEX_LIQUIDATOR,
        cex: bot.cex,
        active: false
      };
      dispatch(stopLiquidatorBot(payload));
    } else {
      const payload: IBotTradingRequest = {
        botId: bot._id,
        type: bot.type === ELiquidatorBotType.DEX ? EBotType.DEX_LIQUIDATOR : EBotType.CEX_LIQUIDATOR,
        cex: bot.cex,
        active: true
      };
      dispatch(startLiquidatorBot(payload));
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
      render: (index: number) => (<>{index}</>)
    },
    // {
    //   title: 'Chain',
    //   dataIndex: 'blockchain',
    //   key: 'blockchain',
    //   render: (chain: IBlockchain) => (
    //     <div>{chain.name}</div>
    //   )
    // },
    {
      title: 'Token Name',
      key: 'token',
      render: (bot: ILiquidatorBot) => (
        <Space>
          <a
            href={`${bot.blockchain.explorer}/address/${bot.token.address}`}
            target="_blank"
            rel="noreferrer"
          >
            {bot.token.name}
          </a>
        </Space>
      )
    },
    {
      title: "Amount",
      dataIndex: "tokenUsdSold",
      key: 'tokenUsdSold',
      render: (data: number) => (
        <>${formattedNumber(data, 2)}</>
      )
    },
    {
      title: 'DEX / CEX',
      key: 'dexAndCex',
      render: (bot: ILiquidatorBot) => (
        <div>{bot.type === ELiquidatorBotType.DEX ? bot.dex?.name : bot.cex}</div>
      )
    },
    {
      title: 'Token Address',
      key: 'token',
      render: (bot: ILiquidatorBot) => (
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
    // {
    //   title: 'Type',
    //   dataIndex: 'type',
    //   key: 'type',
    //   render: (type: ELiquidatorBotType) => (
    //     <>
    //       {type === ELiquidatorBotType.DEX && <div className='text-green'>{type}</div>}
    //       {type === ELiquidatorBotType.CEX && <div className='text-blue'>{type}</div>}
    //     </>
    //   )
    // },
    // {
    //   title: 'Pair',
    //   key: 'coin',
    //   render: (bot: ILiquidatorBot) => (
    //     <div>{bot.type === ELiquidatorBotType.DEX ? bot.coin?.symbol : "USD"}</div>
    //   )
    // },
    {
      title: 'Status',
      width: 120,
      key: 'state',
      render: (bot: ILiquidatorBot) => (
        <div
          className={bot.state === ELiquidatorBotStatus.SUCCESS ? 'text-green' :
            bot.state === ELiquidatorBotStatus.FAILED ? 'text-red' :
              bot.state === ELiquidatorBotStatus.RUNNING ? 'text-yellow' : 'text-red'}
        >
          {bot.state}
        </div>
      )
    },
    {
      title: 'Progress',
      width: 200,
      key: 'progress',
      render: (bot: ILiquidatorBot) => (
        <div>
          {bot.tokenSold !== null && bot.tokenSold !== undefined && bot.tokenAmount !== undefined && 
            <Progress percent={bot.tokenAmount === 0 ? 0 : Math.floor(bot.tokenSold*100/bot.tokenAmount)} size="small" status="active" />}
        </div>
      )
    },
    {
      title: 'Actions',
      key: 'action',
      width: 200,
      render: (bot: ILiquidatorBot) => (
        <Space size="middle">
          <Button
            loading={bot.state === ELiquidatorBotStatus.WAITING ? true : false}
            shape="round" 
            type='primary' 
            icon={bot.state === ELiquidatorBotStatus.RUNNING ? <StopOutlined /> : <PlayCircleOutlined />} 
            size={'small'} 
            onClick={()=>onActionBot(bot)}
            danger={bot.state === ELiquidatorBotStatus.RUNNING ? true : false}
          ></Button>

          <Button
            shape="round"
            icon={bot.state === ELiquidatorBotStatus.RUNNING ? <EyeOutlined /> : <EditOutlined />}
            size={'small'}
            onClick={() => onEditBot(bot)}
          ></Button>

          <Popconfirm
            placement="top"
            disabled={bot.state === ELiquidatorBotStatus.RUNNING ? true : false}
            title="Are you sure you want to discard this bot?"
            onConfirm={() => onDeleteBot(bot._id)}
            okText="Yes"
            cancelText="No"
            key="delete"
          >
            <Button disabled={bot.state === ELiquidatorBotStatus.RUNNING ? true : false} shape="round" icon={<DeleteOutlined />} size={'small'}></Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className='px-3 relative'>
      <div className="pl-2 py-2 mt-3 flex justify-between items-center w-full">
        <Row gutter={16} className="flex-1 bg-gray-darkest px-3 py-2">
          <Col span={7}>
            <div className='flex items-center'>
              <div className='mr-3'>Type:</div>
              <Select value={filter.type} className='w-full' onChange={(value) => setFilter({...filter, type: value})}>
                <Option value="">All</Option>
                <Option value={ELiquidatorBotType.DEX}>DEX</Option>
                <Option value={ELiquidatorBotType.CEX}>CEX</Option>
              </Select>
            </div>
          </Col>
          <Col span={7}>
            <div className='flex items-center'>
              <div className='mr-3'>Chain:</div>
                <Select className='w-full' defaultValue={filter.chain} onChange={(value: string)=>setFilter({...filter, chain: value})}>
                  <Option value="">All</Option>
                  {chainData.map((el, idx) => (
                    <Option value={el._id} key={idx}>
                      {el.name}
                    </Option>
                  ))}
              </Select>
            </div>
          </Col>

          <Col span={10}>
            <div className='flex items-center'>
              <div className='mr-3 whitespace-nowrap'>Token Address:</div>
              <Search 
                onSearch={(value)=>setFilter({...filter, tokenAddress: value})}
              />
            </div>
          </Col>
        </Row>
        <div className="flex ml-3">
          <Button type="primary" className='h-11' onClick={() => { setSelectedBot(null); setCreateModeDlg(true) }}>
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
          expandable={{
            expandedRowRender: record => (
              <LiquidatorDetails liquidator={record} />
            ),
            rowExpandable: record => true
          }}
          scroll={{x: 1400}}
        />
      </div>
      {createMode === ELiquidatorBotType.DEX && visible && <AddDexLiquidatorBot visible={visible} setVisible={setVisible} selectedBot={selectedBot} />}
      {createMode === ELiquidatorBotType.CEX && visible && <AddCexLiquidatorBot visible={visible} setVisible={setVisible} selectedBot={selectedBot} />}

      {createModeDlg && <Modal
        visible={createModeDlg}
        title="Liquidator"
        onCancel={()=>setCreateModeDlg(false)}
        footer={null}
      >
        <p className='my-5 text-center text-lg text-blue'>Please select an exchange type</p>
        <div className='w-full flex justify-center my-2 pt-3'>
          <Button 
            className='mr-5 w-20 rounded-md'
            key="buy" 
            onClick={() => { setCreateMode(ELiquidatorBotType.DEX); setVisible(true); setCreateModeDlg(false); }}
          >
            DEX
          </Button>
          <Button
            className='w-20 rounded-md'
            key="cex"
            onClick={() => { setCreateMode(ELiquidatorBotType.CEX); setVisible(true); setCreateModeDlg(false); }}
          >
            CEX
          </Button>
        </div>
      </Modal>}
    </div>
  );
}
