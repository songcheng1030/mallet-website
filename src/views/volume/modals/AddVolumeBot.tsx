import { useState, useEffect, useMemo } from 'react';
import { Modal, Button, Form, Input, Select, Row, Col, Card, Space, Table, Tabs, Spin } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import Web3 from 'web3';
import BigNumber from 'bignumber.js';

import { selectDexs, selectBlockchains, selectCoins } from '../../../store/network/network.selectors';
import { selectVolumeBots } from "../../../store/volumeBot/volumeBot.selectors";
import { selectMyWallets } from '../../../store/wallet/wallet.selectors';
import { EVolumeBotStatus, IAddLiquiditySchedule, ISellingSchedule, IVolumeBot } from '../../../types';
import { AddLiquidity } from './AddLiquidity';
import { AddSelling } from './AddSelling';
import { addVolumeBot, updateVolumeBot } from '../../../store/volumeBot/volumeBot.actions';
import { selectElapsedTime } from "../../../store/auth/auth.selectors";
import { CopyableLabel } from '../../../components/common/CopyableLabel';
import { shortenAddress, formattedNumber } from '../../../shared';

const factoryABI = require("shared/uniswapV2Factory.json");
const erc20ABI = require("shared/erc20.json");
const pairABI = require("shared/uniswapV2Pair.json")
const { TabPane } = Tabs;

export interface TokenInfo {
  symbol: string;
  coinSymbol: string;
  mainSymbol: string;
  explorer: string;
  totalSupply: number;
  price: number;
  liquidity: number;
  mktCap: number;
  pairAddress: string;
  pooledToken: number;
  pooledCoin: number;
  networkCoin: number;
  baseCoin: number;
  tokenAmount: number
}

interface Props {
  visible: boolean,
  botId: string | null,
  setVisible: (visible: boolean) => void
};

export const AddVolumeBot = (props: Props) => {
  const { visible, botId, setVisible } = props;
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const { Option } = Select;
  const chainData = useSelector(selectBlockchains);
  const dexData = useSelector(selectDexs);
  const walletData = useSelector(selectMyWallets);
  const coinData = useSelector(selectCoins);
  const elapsedTime = useSelector(selectElapsedTime);
  const bots = useSelector(selectVolumeBots);

  const [selectedBot, setSelectedBot] = useState<IVolumeBot | null>(null);
  const [liquidities, setLiquidities] = useState<IAddLiquiditySchedule[]>([]);
  const [sellings, setSellings] = useState<ISellingSchedule[]>([]);
  const [isLiquiditModal, setIsLiquidityModal] = useState<boolean>(false);
  const [selectedLiquidity, setSelectedLiquidity] = useState<(IAddLiquiditySchedule & {index: number}) | null>(null);
  const [isSellingModal, setIsSellingModal] = useState<boolean>(false);
  const [selectedSelling, setSelectedSelling] = useState<(ISellingSchedule & {index: number}) | null>(null);
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);

  useEffect(() => {
    if (visible) {
      const selected = bots.find(el => el._id === botId);
      if (selected && selected._id !== selectedBot?._id) {
        const formData: any = {
          blockchain: selected.blockchain._id,
          dex: selected.dex._id,
          mainWallet: selected.mainWallet._id,
          coin: selected.coin._id,
          token:selected.token.address,
        };
        form.setFieldsValue(formData);
        setLiquidities(selected.addLiquiditySchedule);
        setSellings(selected.sellingSchedule);
        setSelectedBot(selected);
      }
    }
  }, [botId, bots, visible, form, selectedBot]);

  useEffect(() => {
    const getTokenInfo = async () => {
      const blockchain = chainData.find(ch => ch._id === form.getFieldValue("blockchain"));
      const wallet = walletData.find(wa => wa._id === form.getFieldValue("mainWallet"));
      const dex = dexData.find(dx => dx._id === form.getFieldValue("dex"));
      const coin = coinData.find(ci => ci._id === form.getFieldValue("coin"));
      const tokenAddress = form.getFieldValue("token");
      if (blockchain && tokenAddress && tokenAddress !== '' && blockchain.node?.rpcProviderURL && dex && coin) {
        try {
          let rpc = blockchain.node?.rpcProviderURL;
          const web3Client = new Web3(rpc);
          const coinErc20Contract = new web3Client.eth.Contract(erc20ABI, coin.address);
          const coinDecimals = await coinErc20Contract.methods.decimals().call();
          const tokenErc20Contract = new web3Client.eth.Contract(erc20ABI, tokenAddress);
          const totalSupply = await tokenErc20Contract.methods.totalSupply().call();  // -------
          const symbol = await tokenErc20Contract.methods.symbol().call(); //--------
          const tokenDecimals = await tokenErc20Contract.methods.decimals().call();
          const factoryContract = new web3Client.eth.Contract(factoryABI, dex.factoryAddress);
          const pairAddress = await factoryContract.methods.getPair(coin.address, tokenAddress).call();
          const pairContract = new web3Client.eth.Contract(pairABI, pairAddress);
          const reserves = await pairContract.methods.getReserves().call();
          const pooledCoin = new BigNumber(Number(coin.address) < Number(tokenAddress) ? reserves._reserve0 : reserves._reserve1).shiftedBy(-coinDecimals).toNumber();
          const pooledToken = new BigNumber(Number(coin.address) < Number(tokenAddress) ? reserves._reserve1 : reserves._reserve0).shiftedBy(-tokenDecimals).toNumber();
          let ti: any = {
            // ...tokenInfo,
            symbol,
            totalSupply,
            pairAddress,
            pooledToken,
            pooledCoin,
            coinSymbol: coin.symbol,
            mainSymbol: blockchain.coinSymbol,
            explorer: blockchain.explorer
          };
    
          if (coin.price) {
            const price = new BigNumber(pooledCoin).dividedBy(pooledToken).multipliedBy(coin.price).toNumber();
            const mktCap = new BigNumber(price).multipliedBy(totalSupply).shiftedBy(-tokenDecimals).toNumber();
            const liquidity = new BigNumber(pooledToken).multipliedBy(price).toNumber();
            ti = {
              ...ti,
              price,
              mktCap,
              liquidity
            };
          }
          
          if (wallet) {
            const tokenBalance = await tokenErc20Contract.methods.balanceOf(wallet.publicKey).call();
            const coinBalance = await coinErc20Contract.methods.balanceOf(wallet.publicKey).call();
            const networkCoin = await web3Client.eth.getBalance(wallet.publicKey);
            ti = {
              ...ti,
              baseCoin: coinBalance / (10 ** coinDecimals),
              tokenAmount: tokenBalance / (10 ** tokenDecimals),
              networkCoin: Number(networkCoin) / (10 ** 18)
            }
          }
    
          setTokenInfo(ti);
        } catch (err) {
          console.log("error", err);
          return;
        }
      }
    }
    
    if (elapsedTime % 4 === 0) {
      getTokenInfo();
    }
  }, [elapsedTime, chainData, coinData, dexData, form, walletData]);

  const coins = useMemo(() => {
    let computed = coinData;
    computed = computed.filter(coin => form.getFieldValue('blockchain') === undefined || coin.blockchain?._id === form.getFieldValue('blockchain'));
    return computed;
  }, [coinData, form]);

  const dexes = useMemo(() => {
    let computed = dexData;
    computed = computed.filter(dex => form.getFieldValue('blockchain') === undefined || dex.blockchain?._id === form.getFieldValue('blockchain'));
    return computed;
  }, [dexData, form]);

  const handleCancel = () => {
    form.resetFields();
    setVisible(false);
  };

  const onFinish = (values: any) => {
    if (selectedBot && selectedBot.state === EVolumeBotStatus.RUNNING) {
      setVisible(false);
      return;
    }
    
    const blockchain = chainData.find(chain => chain._id === values.blockchain)
    let payload: any = {
      blockchain: values.blockchain,
      node: blockchain?.node?._id,
      dex: values.dex,
      coin: values.coin,
      mainWallet: values.mainWallet,
      addLiquiditySchedule: liquidities,
      sellingSchedule: sellings,
    };

    if (!selectedBot?._id) {
      payload = {
        ...payload,
        token: values.token
      }
    }

    if (selectedBot?._id) {
      dispatch(updateVolumeBot(selectedBot._id, payload));
    } else {
      dispatch(addVolumeBot(payload));
    }
    
    form.resetFields();
    setVisible(false);
  };

  const addLiquiditySchedule = (schedule: IAddLiquiditySchedule) => {
    let temp = liquidities.slice();
    temp.push(schedule);
    setLiquidities(temp);
  }

  const addSellingSchedule = (schedule: ISellingSchedule) => {
    let temp = sellings.slice();
    temp.push(schedule);
    setSellings(temp);
  }

  const onDeleteSelling = (index: number) => {
    const temp = sellings.filter((_, idx) => idx !== index);
    setSellings(temp);
  }

  const onUpdateSelling = (sell: ISellingSchedule & {index: number}) => {
    const temp = sellings.map((selling, idx) => {
      if (idx === sell.index) {
        return {
          ...selling,
          tokenAmount: sell.tokenAmount,
          time: sell.time
        }
      } else {
        return selling;
      }
    });
    setSellings(temp);
  }

  const onDeleteLiquidity = (index: number) => {
    const temp = liquidities.filter((_, idx) => idx !== index);
    setLiquidities(temp);
  }

  const onUpdateLiquidity = (lq: IAddLiquiditySchedule & {index: number}) => {
    const temp = liquidities.map((liquidity, idx) => {
      if (idx === lq.index) {
        return {
          ...liquidity,
          tokenAmount: lq.tokenAmount,
          time: lq.time
        }
      } else {
        return liquidity;
      }
    });
    setLiquidities(temp);
  }

  const liquidityColumn = [
    {
      title: '#',
      key: 'index',
      width: 50,
      render: (text: any, record: any, index: number) => (<>{index + 1}</>)
    },
    {
      title: 'Date',
      dataIndex: 'time',
      key: 'time',
      width: 170
    },
    {
      title: 'Base Coin',
      dataIndex: 'baseCoin',
      key: 'baseCoin',
      render: (baseCoin: number) => (
        <div>{formattedNumber(baseCoin)}</div>
      )
    },
    {
      title: 'Token Amount',
      dataIndex: 'tokenAmount',
      key: 'tokenAmount',
      render: (token: number) => (
        <div>{formattedNumber(token)}</div>
      )
    },
    {
      title: `Price [${tokenInfo ? tokenInfo?.coinSymbol : ''}]`,
      dataIndex: 'tokenPrice',
      key: 'tokenPrice',
      render: (tokenPrice: number) => (
        <div>{formattedNumber(tokenPrice, tokenPrice < 1 ? 8 : 4)}</div>
      )
    },
    {
      title: 'TxHash',
      dataIndex: 'txHash',
      key: 'txHash',
      width: 170,
      render: (tx: string) => (
        <Space>
          {tokenInfo ?
            <a href={`${tokenInfo.explorer}/tx/${tx}`} target="_blank" rel="noreferrer"> {shortenAddress(tx)} </a> : shortenAddress(tx)
          }
          {tx && <CopyableLabel value={tx} label=""/>}
        </Space>
      )
    },
    {
      title: 'Status',
      key: 'status',
      render: (liquidity: IAddLiquiditySchedule) => (
        <div 
          className={liquidity.status === EVolumeBotStatus.SUCCESS ? 'text-green' : 
            liquidity.status === EVolumeBotStatus.FAILED ? 'text-red' : 
            liquidity.status === EVolumeBotStatus.RUNNING ? 'text-yellow' : ''}
        >
          {liquidity.status}
        </div>
      )
    },
    {
      title: 'Actions',
      key: 'action',
      width: 160,
      render: (liquidity: IAddLiquiditySchedule, record: any, index: number) => (
        <Space size="middle">
          {(liquidity.status === EVolumeBotStatus.NONE) && <Button 
            shape="round" 
            size={'small'} 
            onClick={()=>{
              setSelectedLiquidity({...liquidity, index: index}); 
              setIsLiquidityModal(true);
            }}
          >
            Edit
          </Button>}
          {liquidity.status === EVolumeBotStatus.NONE && <Button onClick={()=>onDeleteLiquidity(index)} shape="round" size={'small'} danger>
            Delete
          </Button>}
        </Space>
      ),
    },
  ];

  const sellingColumn = [
    {
      title: '#',
      key: 'index',
      width: 50,
      render: (text: any, record: any, index: number) => (<>{index + 1}</>)
    },
    {
      title: 'Date',
      dataIndex: 'time',
      key: 'time',
      width: 170
    },
    {
      title: 'Token Amount',
      dataIndex: 'tokenAmount',
      key: 'tokenAmount',
      render: (token: number) => (
        <div>{formattedNumber(token)}</div>
      )
    },
    {
      title: 'Coin Earned',
      dataIndex: 'earnedCoin',
      key: 'earnedCoin',
      render: (earnedCoin: number) => (
        <div>{formattedNumber(earnedCoin)}</div>
      )
    },
    {
      title: `Price [${tokenInfo ? tokenInfo?.coinSymbol : ''}]`,
      dataIndex: 'tokenPrice',
      key: 'tokenPrice',
      render: (price: number) => (
        <div>{formattedNumber(price, price < 1 ? 8 : 4)}</div>
      )
    },
    {
      title: 'TxHash',
      dataIndex: 'txHash',
      key: 'txHash',
      width: 170,
      render: (tx: string) => (
        <Space>
          {tokenInfo ?
            <a href={`${tokenInfo.explorer}/tx/${tx}`} target="_blank" rel="noreferrer"> {shortenAddress(tx)} </a> : shortenAddress(tx)
          }
          {tx && <CopyableLabel value={tx} label=""/>}
        </Space>
      )
    },
    {
      title: 'Status',
      width: 150,
      key: 'status',
      render: (selling: ISellingSchedule) => (
        <div 
          className={selling.status === EVolumeBotStatus.SUCCESS ? 'text-green' : 
            selling.status === EVolumeBotStatus.FAILED ? 'text-red' : 
            selling.status === EVolumeBotStatus.RUNNING ? 'text-yellow' : ''}
        >
          {selling.status}
        </div>
      )
    },
    {
      title: 'Actions',
      key: 'action',
      width: 160,
      render: (selling: ISellingSchedule, record: any, index: number) => (
        <Space size="middle">
          {selling.status === EVolumeBotStatus.NONE && <Button 
            shape="round" 
            size={'small'} 
            onClick={()=>{
              setSelectedSelling({...selling, index: index}); 
              setIsSellingModal(true);
            }}
          >
            Edit
          </Button>}
          {selling.status === EVolumeBotStatus.NONE && <Button onClick={()=>onDeleteSelling(index)} shape="round" size={'small'} danger>
            Delete
          </Button>}
        </Space>
      ),
    },
  ];

  return (
    <Modal
      title="Scheduler"
      visible={visible}
      width={1600}
      centered
      maskClosable={false}
      onOk={form.submit}
      okText={selectedBot?.state === EVolumeBotStatus.RUNNING ? 'Ok' : 'Save'}
      onCancel={handleCancel}
    >
      <Form
        form={form}
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        labelAlign='left'
        onFinish={onFinish}
      >
        <Row gutter={20}>
          <Col span={6}>
            <Card className="w-full h-full border border-solid border-blue-dark">
              <Form.Item
                label="Chain"
                name="blockchain"
                rules={[{ required: true, message: 'Please select a chain!' }]}
              >
                <Select className="w-28" disabled={(selectedBot && selectedBot.state === EVolumeBotStatus.RUNNING) ? true : false}>
                  {chainData.map((blockchain, idx) => (
                    <Option key={idx} value={blockchain._id}>{blockchain.name}  <span style={{ color: "#e8962e" }}>[{blockchain.coinSymbol}]</span>  ({blockchain.chainId})</Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                label="DEX"
                name="dex"
                rules={[{ required: true, message: 'Please select a dex!' }]}
              >
                <Select className="w-28" disabled={(selectedBot && selectedBot.state === EVolumeBotStatus.RUNNING) ? true : false}>
                  {dexes.map((dex, idx) => (
                    <Option key={idx} value={dex._id ? dex._id : 'unknown'}>{dex.name}</Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                label="Base Coin"
                name="coin"
                rules={[{ required: true, message: 'Please select a base coin!' }]}
              >
                <Select className="w-28" disabled={(selectedBot && selectedBot.state === EVolumeBotStatus.RUNNING) ? true : false}>
                  {coins.map((coin, idx) => (
                    <Option key={idx} value={coin._id ? coin._id : 'unknown'}>{coin.name}</Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                label="Token"
                name="token"
                rules={[{ required: true, message: 'Please enter token address!' }]}
              >
                <Input disabled={selectedBot?._id ? true : false} />
              </Form.Item>

              <div className="w-full p-3 text-sm border-solid border border-gray-dark mb-5">
                <Row gutter={24}>
                  <Col span={14}>Symbol: </Col>
                  <Col span={10} className="text-blue-light text-right">{tokenInfo ? tokenInfo.symbol : '---'}</Col>
                </Row>
                <Row gutter={24}>
                  <Col span={14}>Price: </Col>
                  <Col span={10} className="text-blue-light text-right">{tokenInfo ? `$ ${formattedNumber(tokenInfo.price, tokenInfo.price < 1 ? 8 : 4)}` : '---'}</Col>
                </Row>
                <Row gutter={24}>
                  <Col span={14}>Liquidity: </Col>
                  <Col span={10} className="text-blue-light text-right">{tokenInfo ? `$ ${formattedNumber(tokenInfo.liquidity)}` : '---'}</Col>
                </Row>
                <Row gutter={24}>
                  <Col span={14}>MKT Cap: </Col>
                  <Col span={10} className="text-blue-light text-right">{tokenInfo ? `$ ${formattedNumber(tokenInfo.mktCap)}` : '---'}</Col>
                </Row>
                <Row gutter={24}>
                  <Col span={14}>Pair Address: </Col>
                  <Col span={10} className="text-blue-light text-right">
                    {tokenInfo ? (
                      <div className='flex'>
                        <a href={`${tokenInfo.explorer}/address/${tokenInfo.pairAddress}`} target="_blank" rel="noreferrer">
                          {shortenAddress(tokenInfo.pairAddress)}
                        </a>
                        <CopyableLabel label="" value={tokenInfo.pairAddress} />
                      </div>
                    ) : '---'}
                  </Col>
                </Row>
                <Row gutter={24}>
                  <Col span={14}>Pooled {tokenInfo ? tokenInfo?.symbol : 'Token'}: </Col>
                  <Col span={10} className="text-blue-light text-right">{tokenInfo ? formattedNumber(tokenInfo.pooledToken) : '---'}</Col>
                </Row>
                <Row gutter={24}>
                  <Col span={14}>Pooled {tokenInfo ? tokenInfo.coinSymbol : 'Coin'}: </Col>
                  <Col span={10} className="text-blue-light text-right">{tokenInfo ? formattedNumber(tokenInfo.pooledCoin) : '---'}</Col>
                </Row>
              </div>

              <Form.Item
                label="Wallet"
                name="mainWallet"
                rules={[{ required: true, message: 'Please select wallet!' }]}
              >
                <Select className="w-28" disabled={(selectedBot && selectedBot.state === EVolumeBotStatus.RUNNING) ? true : false}>
                  {walletData.map((wallet, idx) => (
                    <Option key={idx} value={wallet._id}> {wallet.name} </Option>
                  ))}
                </Select>
              </Form.Item>

              <div className="w-full p-3 text-sm border-solid border border-gray-dark mb-5">
                <Row gutter={24}>
                  <Col span={14}>{tokenInfo ? tokenInfo.mainSymbol : 'Network Coin'}: </Col>
                  <Col span={10} className="text-blue-light text-right">{tokenInfo ? formattedNumber(tokenInfo.networkCoin) : '---'}</Col>
                </Row>
                <Row gutter={24}>
                  <Col span={14}>{tokenInfo ? tokenInfo.coinSymbol : 'Base Coin'}: </Col>
                  <Col span={10} className="text-blue-light text-right">{tokenInfo ? formattedNumber(tokenInfo.baseCoin) : '---'}</Col>
                </Row>
                <Row gutter={24}>
                  <Col span={14}>{tokenInfo ? tokenInfo?.symbol : 'Token'}: </Col>
                  <Col span={10} className="text-blue-light text-right">{tokenInfo ? formattedNumber(tokenInfo.tokenAmount) : '---'}</Col>
                </Row>
              </div>
            </Card>
          </Col>
          <Col span={18}>
            <Card className="w-full h-full border border-solid border-blue-dark">
              {tokenInfo &&<Tabs>
                <TabPane tab="Liquidity Schedule" key="1">
                  <>
                    <div className='flex justify-end items-center pb-1'>
                      <Button 
                        onClick={()=>{setSelectedLiquidity(null); setIsLiquidityModal(true);}} 
                        className=''
                        disabled={!tokenInfo || (selectedBot && selectedBot.state === EVolumeBotStatus.RUNNING) ? true : false}
                      >
                        Add
                      </Button>
                    </div>
                    <Table 
                      bordered
                      columns={liquidityColumn}
                      dataSource={liquidities}
                      rowKey="_id"
                      pagination={false}
                      scroll={{x: 900, y: 350}}
                    />
                  </>
                </TabPane>
                <TabPane tab="Selling Schedule" key="2">
                  <>
                    <div className='flex justify-end items-center pb-1'>
                      <Button 
                        onClick={()=>{setSelectedSelling(null); setIsSellingModal(true);}} 
                        className=''
                        disabled={!tokenInfo || (selectedBot && selectedBot.state === EVolumeBotStatus.RUNNING) ? true : false}
                      >
                        Add
                      </Button>
                    </div>
                    <Table 
                      bordered
                      columns={sellingColumn}
                      dataSource={sellings}
                      rowKey="_id"
                      pagination={false}
                      scroll={{x: 900, y: 350}}
                    />
                  </>
                </TabPane>
              </Tabs>}
              {!tokenInfo && 
                <div className='flex justify-center items-center'>
                  <Spin />
                </div>
              }
            </Card>
          </Col>
        </Row>
      </Form>

      {isLiquiditModal && tokenInfo &&
        <AddLiquidity 
          visible={isLiquiditModal} 
          selectedLiquidity={selectedLiquidity} 
          tokenBalance={tokenInfo.tokenAmount}
          tokenPrice={new BigNumber(tokenInfo.pooledCoin).dividedBy(tokenInfo.pooledToken).toNumber()}
          setVisible={setIsLiquidityModal} 
          addLiquiditySchedule={addLiquiditySchedule}
          onUpdateLiquidity={onUpdateLiquidity}
        />}
      {isSellingModal && tokenInfo &&
        <AddSelling 
          visible={isSellingModal}
          selectedSelling={selectedSelling}
          tokenBalance={tokenInfo.tokenAmount}
          setVisible={setIsSellingModal} 
          addSellingSchedule={addSellingSchedule}
          onUpdateSelling={onUpdateSelling}
        />}
    </Modal>
  );
};
