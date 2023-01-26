import { useState, useEffect, useMemo } from 'react';
import { Table, Row, Col, Select, Space, Input, DatePicker, Form, Button, Switch } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import { TablePaginationConfig } from 'antd/lib/table/interface';

import { CopyableLabel } from '../../components/common/CopyableLabel';
import { IBlockchain, IDex, IPool, PoolFilter, IAutoBot, tradingTxt, ETradingThread, IBotTradingRequest, EBotType, ERunningStatus } from '../../types';
import { getAllBlockchain } from '../../store/network/network.action';
import { getAllCoin } from '../../store/network/network.action';
import { getAllDex } from '../../store/network/network.action';
import { searchPools, searchRunningPools, stopAutoBot, startAutoBot } from '../../store/pool/pool.actions';
import { loadMyWallet } from '../../store/wallet/wallet.actions';
import { getAllNode } from '../../store/network/network.action';
import { selectPools, selectTotal, selectRunningPools } from '../../store/pool/pool.selectors';
import { selectElapsedTime } from "../../store/auth/auth.selectors";
import { selectBlockchains } from '../../store/network/network.selectors';
import { selectDexs } from '../../store/network/network.selectors';
import { selectMyWallets } from "../../store/wallet/wallet.selectors";
import { formattedNumber, shortenAddress } from '../../shared';
import { AutoBot } from './modal/AutoBot';
import { AutoBotDetails } from './modal/AutoBotDetails';
import IconImg from '../../images/Mallet-Icon.png';
import Balance from './Balance';
import { selectNodes } from '../../store/network/network.selectors';

const { Option } = Select;
const { RangePicker } = DatePicker;

interface FilterForm {
  chain: string;
  dex: string;
  size: string;
  token: string;
  date: string[]
}

export const ScannerPage = () => {
  const dispatch = useDispatch();
  const pools = useSelector(selectPools);
  const runningPools = useSelector(selectRunningPools);
  const total = useSelector(selectTotal);
  const elapsedTime = useSelector(selectElapsedTime);
  const blockchains = useSelector(selectBlockchains);
  const dexes = useSelector(selectDexs);
  const nodeData = useSelector(selectNodes);
  const walletData = useSelector(selectMyWallets);
  const [form] = Form.useForm();

  const [chain, setChain] = useState<string>("");
  const [dex, setDex] = useState<string>("");
  const [size, setSize] = useState<string>('0');
  const [token, setToken] = useState<string>("");
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);

  const [page, setPage] = useState<number>(1);
  const [pageLength, setPageLength] = useState<number>(10);
  const [sortField, setSortField] = useState<any>("created");
  const [sortOrder, setSortOrder] = useState<any>(-1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isNew, setIsNew] = useState<boolean>(false);
  const [selectedPool, setSelectedPool] = useState<IPool | null>(null);
  const [selectedWallet, setSelectedWallet] = useState<string>(walletData[0] ? walletData[0]._id : '');
  const [refresh, setRefresh] = useState<boolean>(true);

  useEffect(() => {
    dispatch(getAllBlockchain());
    dispatch(getAllDex());
    dispatch(getAllCoin());
    dispatch(getAllNode());
    dispatch(loadMyWallet());
  }, [dispatch]);

  useEffect(() => {
    async function searchIdle () {
      let filter: PoolFilter = {
        isRunning: false,
        size: Number(size),
        page,
        pageLength,
        sort: {
          field: sortField,
          order: sortOrder
        },
        chain,
        dex,
        token
      };
  
      if (startDate && endDate) {
        filter = {
          ...filter,
          startDate,
          endDate
        };
      }

      await dispatch(searchPools(filter));
      setIsLoading(false);
    }

    async function searchRunning () {
      let filter: PoolFilter = {
        isRunning: true,
        size: Number(size),
        sort: {
          field: sortField,
          order: sortOrder
        },
        chain,
        dex,
        token
      };
  
      if (startDate && endDate) {
        filter = {
          ...filter,
          startDate,
          endDate
        };
      }

      dispatch(searchRunningPools(filter));
      setIsLoading(false);
    }

    if (refresh && elapsedTime % 4 === 0) {
      searchIdle();
      searchRunning();
    }
  }, [elapsedTime, chain, dex, dispatch, page, pageLength, size, sortField, sortOrder, startDate, endDate, token, refresh]);

  useEffect(() => {
    if (pools.length < 1) return;
    const poolIdx = localStorage.getItem("poolReadIndex");
    if (poolIdx) {
      if (+poolIdx < (pools[0].uniqueNum || 0)) {
        showDesctopNoti(`${pools[0].token2.symbol} token is dropped`, 'Pool Size: $' + String(pools[0].size));
        localStorage.setItem("poolReadIndex", (pools[0].uniqueNum || 0).toString());
      }
    } else {
      localStorage.setItem("poolReadIndex", (pools[0].uniqueNum || 0).toString());
    }
  }, [pools]);

  const filteredRunningPools = useMemo(() => {
    const computed = runningPools || [];
    let newArr: IPool[] = [];
    computed.forEach(el => {
      if (el.autoBot?.state.status === ERunningStatus.RUNNING) {
        newArr.unshift(el);
      } else {
        newArr.push(el);
      }
    });
    return newArr;
  }, [runningPools]);

  const currentWallet = useMemo(() => {
    return walletData.find(el => el._id === selectedWallet);
  }, [selectedWallet, walletData]);

  const handleTableChange = (
    pagination: TablePaginationConfig,
    filters: any,
    sorter: any,
  ) => {
    setPage(pagination.current ? pagination.current : 1);
    setPageLength(pagination.pageSize ? pagination.pageSize : 10);
    setSortField(sorter.columnKey);
    setSortOrder(sorter.order === 'ascend' ? 1 : -1);
  }

  const shortcutTxt = (txt: string) => {
    if (txt.length > 10) return txt.slice(0, 10) + '...';
    else return txt;
  }

  const onFinish = async (values: FilterForm) => {
    values.chain ? setChain(values.chain) : setChain("");
    values.dex ? setDex(values.dex) : setDex("");
    values.size ? setSize(values.size) : setSize('0');
    values.token ? setToken(values.token) : setToken("");
    values.date ? setStartDate(moment(values.date[0]).format('YYYY-MM-DD') + ' 00:00:00') : setStartDate(null);
    values.date ? setEndDate(moment(values.date[1]).format('YYYY-MM-DD') + ' 23:59:59') : setEndDate(null);
    setIsLoading(true);
  }

  const showDesctopNoti = (title: string, content: string) => {
    new Notification(title, {
      body: content,
      icon: IconImg
    });
  }

  const handleBotAction = (bot?: IAutoBot) => {
    if (!bot) return;

    if (!bot.state.active) {
      const payload: IBotTradingRequest = {
        botId: bot._id,
        type: EBotType.AUTO_BOT,
        active: true
      };
      dispatch(startAutoBot(payload));
    } else {
      const payload: IBotTradingRequest = {
        botId: bot._id,
        type: EBotType.AUTO_BOT,
        active: false
      };
      dispatch(stopAutoBot(payload));
    }
  }

  const getRpcUrl = (nodeId?: string) => {
    if (!nodeId) return '';
    const node = nodeData.find(el => el._id === nodeId);
    if(node) {
      return node.rpcProviderURL
    } else {
      return '';
    }
  }

  const handleWalletChange = (walletId: string) => {
    setSelectedWallet(walletId);
  }

  const handleRefreshChange = (e: boolean) => {
    setRefresh(e);
  }

  const columns = [
    {
      title: '#',
      dataIndex: 'uniqueNum',
      key: 'index',
      render: (index: number) => (
        <>{index ? index : 0}</>
      )
    },
    {
      title: 'Name',
      key: 'tokenSymbol',
      render: (pool: IPool) => (
        <a
          href={`${pool.blockchain.explorer}/address/${pool.token2.address}`}
          target="_blank"
          rel="noreferrer"
        >
          {pool.token2.symbol}
        </a>
      )
    },
    {
      title: 'Pool Size',
      key: 'size',
      render: (pool: IPool) => (
        <span className='mr-2'>${formattedNumber(pool.size, 2)}</span>
      ),
      sorter: true,
      sortDirections: ['ascend' as 'ascend', 'descend' as 'descend', 'ascend' as 'ascend'],
      showSorterTooltip: false,
    },
    {
      title: 'Chain',
      dataIndex: 'blockchain',
      key: 'blockchain',
      render: (blockchain: IBlockchain) => (
        <div>{shortcutTxt(blockchain.name)}</div>
      ),
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
      title: 'BaseCoin',
      key: 'address1',
      width: 150,
      render: (pool: IPool) => (
        <div>
          <div className='flex'>
            <a
              href={`${pool.blockchain.explorer}/address/${pool.token1.address}`}
              target="_blank"
              rel="noreferrer"
            >
              {shortenAddress(pool.token1.address)}
            </a>
            <CopyableLabel value={pool.token1.address} label="" />
          </div>
          <div className='flex text-xs text-blue'>
            <div>{pool.token1.symbol}&nbsp;</div>
            {currentWallet && <Balance
              rpcUrl={getRpcUrl(String(pool.blockchain.node))}
              tokenAddress={pool.token1.address}
              walletAddress={currentWallet.publicKey}
            />}
          </div>
        </div>
      )
    },
    {
      title: 'Token',
      key: 'address2',
      width: 150,
      render: (pool: IPool) => (
        <div className='flex'>
          <a
            href={`${pool.blockchain.explorer}/address/${pool.token2.address}`}
            target="_blank"
            rel="noreferrer"
          >
            {shortenAddress(pool.token2.address)}
          </a>
          <CopyableLabel value={pool.token2.address} label="" />
        </div>
      )
    },
    {
      title: 'Transaction Hash',
      key: 'transactionHash',
      width: 150,
      render: (pool: IPool) => (
        <Space>
          <a
            href={`${pool.blockchain.explorer}/tx/${pool.transactionHash}`}
            target="_blank"
            rel="noreferrer"
          >
            {shortenAddress(pool.transactionHash)}
          </a>
          <CopyableLabel value={pool.transactionHash} label="" />
        </Space>
      )
    },
    {
      title: 'Created At',
      dataIndex: 'created',
      key: 'created',
      width: 200,
      render: (created: Date) => (
        <div> {moment(created).format('M/D/YY @ LTS').toString()} </div>
      ),
      sorter: true,
      sortDirections: ['ascend' as 'ascend', 'descend' as 'descend', 'ascend' as 'ascend'],
      showSorterTooltip: false,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 250,
      render: (pool: IPool) => (
        <Space>
          {!pool.autoBot && (
            <Button 
              onClick={() => {
                setSelectedPool(pool);
                setIsNew(true);
              }}
              className="mr-2"
              shape='round'
            >
              Create a bot
            </Button>
          )}
            {pool.autoBot && (
              <div className='w-40 flex items-center'>
                {!pool.autoBot.state.active && pool.autoBot.state.thread !== ETradingThread.AUTO_FINISHED &&
                  <>
                    <Button type='primary' onClick={()=>handleBotAction(pool.autoBot)} className="mr-2" shape='round'>
                      Start
                    </Button>
                  </>
                }
                {pool.autoBot.state.active && <Button type='primary' danger onClick={()=>handleBotAction(pool.autoBot)} className="mr-2" shape='round'>
                  Stop
                </Button>}
                {pool.autoBot._id && <AutoBotDetails botId={pool.autoBot._id} />}
                <span className='text-blue ml-2'>{tradingTxt[pool.autoBot.state.thread ? pool.autoBot.state.thread : ""]}</span>
              </div>
            )}
        </Space>
      ),
    }
  ];
  
  return (
    <div className="bg-gray-dark rounded-md p-3">
      <div className="p-3">
        <div className='pt-6 px-5 bg-gray-darkest rounded'>
          <Form
            name="filterForm"
            form={form}
            labelAlign="left"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
            onFinish={onFinish}
            autoComplete="off"
          >
            <Row gutter={20}>
              <Col xs={24} lg={12} xl={8} xxl={6}>
                <Form.Item
                  label="Address"
                  name="token"
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} lg={12} xl={8} xxl={6}>
                <Form.Item
                  label="Chain"
                  name="chain"
                  initialValue=""
                >
                  <Select>
                    <Option value="">All</Option>
                    {blockchains.map((el, idx) => (
                      <Option value={el._id} key={idx}>
                        {el.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} lg={12} xl={8} xxl={6}>
                <Form.Item
                  label="DEX"
                  name="dex"
                  initialValue=""
                >
                  <Select>
                    <Option value="">All</Option>
                    {dexes.map((el, idx) => (
                      <Option value={el._id} key={idx}>
                        {el.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} lg={12} xl={8} xxl={6}>
                <Form.Item
                  label="Pool"
                  name="size"
                  initialValue='0'
                >
                  <Input prefix="$" />
                </Form.Item>
              </Col>
              <Col xs={24} lg={12} xl={8} xxl={6}>
                <Form.Item
                  label="Date"
                  name="date"
                >
                  <RangePicker className='w-full' />
                </Form.Item>
              </Col>
              <Col xs={24} lg={12} xl={8} xxl={6}>
                <Form.Item
                  label="Wallet"
                  name="wallet"
                  initialValue={selectedWallet}
                >
                  <Select onChange={handleWalletChange}>
                    {walletData.map((el, idx) => (
                      <Option value={el._id} key={idx}>
                        {el.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} lg={12} xl={8} xxl={6}>
                <Form.Item
                  label="Refresh"
                >
                  <Switch checked={refresh} onChange={handleRefreshChange} />
                </Form.Item>
              </Col>
              <Col className='ml-auto'>
                <Button type='primary' className='w-40 mb-3' onClick={form.submit}>
                  Filter
                </Button>
              </Col>
            </Row>
          </Form>
        </div>

        {filteredRunningPools.length > 0 &&
          <div className='mb-3'>
            <div className='w-full my-2 text-base text-blue'>
              Auto Bots
            </div>
            <Table
              loading={isLoading}
              columns={columns} 
              dataSource={filteredRunningPools}
              rowKey="_id"
              scroll={{ x: 1200, y: 400 }}
              pagination={false}
            />
          </div>
        }

        <div className='mb-3'>
          <div className='w-full my-2 text-base text-blue'>
            Pools
          </div>
          <Table
            loading={isLoading}
            columns={columns} 
            dataSource={pools}
            rowKey="_id"
            onChange={handleTableChange}
            pagination={{total: total}}
            scroll={{ x: 1200 }}
          />
        </div>
      </div>

      {selectedPool && <AutoBot pool={selectedPool} visible={isNew} setVisible={setIsNew} />}
    </div>
  )
}
