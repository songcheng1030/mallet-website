import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button, Table, Space, Popconfirm, Select, Row, Col, Modal, Input, Tooltip } from 'antd';
import { EditOutlined, EyeOutlined, DeleteOutlined, PlayCircleOutlined, StopOutlined, WarningOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { TablePaginationConfig } from 'antd/lib/table/interface';

import { selectWasherBots, selectTotal } from "../../store/washerBot/washerBot.selectors";
import { searchWasherBots, deleteWasherBot, startWasherBot, stopWasherBot } from '../../store/washerBot/washerBot.actions';
import { AddDexWasherBot } from './modals/AddDexWasherBot';
import { AddCexWasherBot } from './modals/AddCexWasherBot';
import { IBotTradingRequest, IWasherBot, EBotType, EWasherBotStatus, EExchangeType, WasherFilter, IToken, EWasherBotActionResult } from '../../types';
import { CopyableLabel } from '../../components/common/CopyableLabel';
import { shortenAddress, formattedNumber } from '../../shared';
import { selectElapsedTime } from "../../store/auth/auth.selectors";
import { selectBlockchains } from '../../store/network/network.selectors';
import { updateCompanyWallet } from 'store/companyWallet/companyWallet.actions';
import { WasherDetails } from './WasherDetails';

const { Option } = Select;
const { Search } = Input;

export const Washers = () => {
  const [visible, setVisible] = useState<boolean>(false);
  const [filter, setFilter] = useState<WasherFilter>({
    exchangeType: '',
    chain: '',
    tokenAddress: '',
    page: 1,
    pageLength: 10
  });
  const [createModeDlg, setCreateModeDlg] = useState<boolean>(false);
  const [createMode, setCreateMode] = useState<EExchangeType>(EExchangeType.DEX);
  const [selectedBot, setSelectedBot]= useState<IWasherBot | null>(null);

  const dispatch = useDispatch();
  const data = useSelector(selectWasherBots);
  const elapsedTime = useSelector(selectElapsedTime);
  const chainData = useSelector(selectBlockchains);
  const total = useSelector(selectTotal);

  useEffect(() => {
    if (elapsedTime % 3 === 0) {
      dispatch(searchWasherBots(filter));
    }
  }, [elapsedTime, filter, dispatch]);

  const onDeleteBot = (bot: IWasherBot) => {
    if (!bot._id) return;
    dispatch(deleteWasherBot(bot._id));

    bot.subWallets?.forEach(el => {
      el.cntInUse = 0;
      dispatch(updateCompanyWallet(el));
    })
  }

  const onEditBot = (bot: IWasherBot) => {
    setCreateMode(bot.exchangeType);
    setSelectedBot(bot);
    setVisible(true);
  }

  const onActionBot = (bot: IWasherBot) => {
    if (!bot._id) return;
    if (bot.state.status === EWasherBotStatus.RUNNING) {
      const payload: IBotTradingRequest = {
        botId: bot._id,
        type: bot.exchangeType === EExchangeType.DEX ? EBotType.DEX_WASHER : EBotType.CEX_WASHER,
        cex: bot.cex,
        active: false
      };
      dispatch(stopWasherBot(payload));
    } else {
      const payload: IBotTradingRequest = {
        botId: bot._id,
        type: bot.exchangeType === EExchangeType.DEX ? EBotType.DEX_WASHER : EBotType.CEX_WASHER,
        cex: bot.cex,
        active: true
      };
      dispatch(startWasherBot(payload));
    }
  }

  const handleTableChange = (
    pagination: TablePaginationConfig,
    // filters: any,
    // sorter: any,
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
    {
      title: 'Token Address',
      key: 'token',
      render: (bot: IWasherBot) => (
        <Space>
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
      title: "Token Symbol",
      dataIndex: "token",
      key: 'tokenSymbol',
      render: (token: IToken) => (
        <div className='ml-3 text-blue'>{token.symbol}</div>
      )
    },
    {
      title: 'DEX / CEX',
      key: 'dexAndCex',
      render: (bot: IWasherBot) => (
        <div>{bot.exchangeType === EExchangeType.DEX ? bot.dex?.name : bot.cex}</div>
      )
    },
    {
      title: 'Target Volume',
      dataIndex: 'targetVolume',
      key: 'targetVolume',
      render: (volume: number) => (
        <Space>
          <div>{formattedNumber(volume)}</div>
        </Space>
      )
    },
    {
      title: 'Status',
      key: 'state',
      render: (bot: IWasherBot) => (
        <Space>
          <span className=''>
            {bot.state.status === EWasherBotStatus.FAILED ? (<span className='text-red'> <WarningOutlined /> </span>) : bot.state.status}
          </span>
          <span className='text-yellow'>
            {bot.state.result === EWasherBotActionResult.DRAFT ? '' :
            bot.state.result === EWasherBotActionResult.API_ERROR ? ': CoinMarketCap API Error' :
            bot.state.result === EWasherBotActionResult.DAILY_LOSS_LIMIT ? ': Daily loss limitation' :
            bot.state.result === EWasherBotActionResult.MAX_SLIPPAGE_LIMIT ? ': Max slippage limitation' :
            bot.state.result === EWasherBotActionResult.MIN_BASECOIN_LIMIT ? ': Minimum base coin limitation' :
            bot.state.result === EWasherBotActionResult.MIN_NATIVECOIN_LIMIT ? ': Minimum native coin limitation' :
            bot.state.result === EWasherBotActionResult.TRANSACTION_FAILED ? 'Transaction failed' :
            bot.state.result === EWasherBotActionResult.INSUFFICIENT_BALANCE ? 'Insufficient balance' : 'Unknown error'}
          </span>
          {bot.state.message && <Tooltip title={bot.state.message}>
            <QuestionCircleOutlined />
            </Tooltip>
          }
        </Space>
      )
    },
    {
      title: 'Actions',
      key: 'action',
      width: 250,
      render: (bot: IWasherBot) => (
        <Space size="middle">
          <Button
            loading={bot.state.status === EWasherBotStatus.WAITING ? true : false}
            shape="round" 
            type='primary' 
            icon={bot.state.status === EWasherBotStatus.RUNNING ? <StopOutlined /> : <PlayCircleOutlined />} 
            size={'small'} 
            onClick={()=>onActionBot(bot)}
            danger={bot.state.status === EWasherBotStatus.RUNNING ? true : false}
            disabled={bot.exchangeType === EExchangeType.DEX && (bot.isProcessing || !bot.subWallets?.length)}
          ></Button>

          <Button
            shape="round"
            icon={bot.state.status === EWasherBotStatus.RUNNING ? <EyeOutlined /> : <EditOutlined />}
            size={'small'}
            onClick={() => onEditBot(bot)}
            // disabled={bot.isProcessing}
          ></Button>

          <Popconfirm
            placement="top"
            disabled={bot.state.status === EWasherBotStatus.RUNNING || bot.isProcessing ? true : false}
            title="Are you sure you want to discard this bot?"
            onConfirm={() => onDeleteBot(bot)}
            okText="Yes"
            cancelText="No"
            key="delete"
          >
            <Button 
              disabled={bot.state.status === EWasherBotStatus.RUNNING || bot.isProcessing ? true : false} 
              shape="round" 
              icon={<DeleteOutlined />} 
              size={'small'}
            ></Button>
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
              <Select value={filter.exchangeType} className='w-full' onChange={(value) => setFilter({...filter, exchangeType: value})}>
                <Option value="">All</Option>
                <Option value={EExchangeType.DEX}>DEX</Option>
                <Option value={EExchangeType.CEX}>CEX</Option>
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
              <WasherDetails washerId={record._id} />
            ),
            rowExpandable: record => true
          }}
          scroll={{x: 1400}}
        />
      </div>
      {createMode === EExchangeType.DEX && visible && <AddDexWasherBot visible={visible} setVisible={setVisible} selectedBotId={selectedBot?._id} />}
      {createMode === EExchangeType.CEX && visible && <AddCexWasherBot visible={visible} setVisible={setVisible} selectedBot={selectedBot} />}

      {createModeDlg && <Modal
        visible={createModeDlg}
        title="Washer"
        onCancel={()=>setCreateModeDlg(false)}
        footer={null}
      >
        <p className='my-5 text-center text-lg text-blue'>Please select an exchange type</p>
        <div className='w-full flex justify-center my-2 pt-3'>
          <Button 
            className='mr-5 w-20 rounded-md'
            key="buy" 
            onClick={() => { setCreateMode(EExchangeType.DEX); setVisible(true); setCreateModeDlg(false); }}
          >
            DEX
          </Button>
          <Button
            className='w-20 rounded-md'
            key="cex"
            onClick={() => { setCreateMode(EExchangeType.CEX); setVisible(true); setCreateModeDlg(false); }}
          >
            CEX
          </Button>
        </div>
      </Modal>}
    </div>
  );
}
