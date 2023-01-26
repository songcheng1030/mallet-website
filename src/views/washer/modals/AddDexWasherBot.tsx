import { useState, useEffect, useCallback } from 'react';
import { Modal, Form, Input, Select, Row, Col, Divider, Spin, DatePicker, TimePicker, Button, Space } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import Web3 from 'web3';
import BigNumber from 'bignumber.js';
import moment from 'moment-timezone';

import { selectDexs, selectBlockchains, selectCoins } from 'store/network/network.selectors';
import { selectMyWallets } from 'store/wallet/wallet.selectors';
import { selectCompanyWallets } from "store/companyWallet/companyWallet.selectors";
import { EWasherBotStatus, EWasherBotActionResult, IWasherBot } from 'types';
import { addWasherBot, updateWasherBot } from 'store/washerBot/washerBot.actions';
import { updateCompanyWallet, loadCompanyWallets } from 'store/companyWallet/companyWallet.actions';
import { selectElapsedTime } from "store/auth/auth.selectors";
import { selectWasherBots } from "store/washerBot/washerBot.selectors";
import { CopyableLabel } from 'components/common/CopyableLabel';
import { shortenAddress, formattedNumber, showNotification } from 'shared';
import { botService, coinMarketService } from 'services';

const factoryABI = require("shared/uniswapV2Factory.json");
const erc20ABI = require("shared/erc20.json");
const pairABI = require("shared/uniswapV2Pair.json")

interface TokenInfo {
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

interface SubWalletInfo {
  baseCoin: number;
  tokenAmount: number;
  networkCoin: number;
}

interface Props {
  visible: boolean,
  selectedBotId?: string,
  setVisible: (visible: boolean) => void
};

export const AddDexWasherBot = (props: Props) => {
  const { visible, selectedBotId, setVisible } = props;
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const { Option } = Select;
  const chainData = useSelector(selectBlockchains);
  const dexData = useSelector(selectDexs);
  const walletData = useSelector(selectMyWallets);
  const companyWalletData = useSelector(selectCompanyWallets);
  const coinData = useSelector(selectCoins);
  const elapsedTime = useSelector(selectElapsedTime);
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [isWithdraw, setIsWithdraw] = useState<boolean>(false);
  const [isAvailable, setIsAvailable] = useState<boolean>(false);
  const [selectedBot, setSelectedBot] = useState<IWasherBot | null>(null);
  const [subWalletInfo, setSubWalletInfo] = useState<SubWalletInfo[]>([]);
  const [curVolume, setCurVolume] = useState<number>(0);
  const [coinmarketcapId, setCoinmarketcapId] = useState<string>("");

  const washerBots = useSelector(selectWasherBots);

  useEffect(() => {
    const bot = washerBots.find(el => el._id === selectedBotId);
    if (bot) {
      setSelectedBot(bot);
    }
  }, [selectedBotId, washerBots]);

  useEffect(() => {
    dispatch(loadCompanyWallets());
  }, [dispatch]);

  useEffect(() => {
    const getTokenInfo = async () => {
      const blockchain = chainData.find(ch => ch._id === form.getFieldValue("blockchain"));
      const wallet = walletData.find(wa => wa._id === form.getFieldValue("wallet"));
      const dex = dexData.find(dx => dx._id === form.getFieldValue("dex"));
      const coin = coinData.find(ci => ci._id === form.getFieldValue("coin"));
      const tokenAddress = form.getFieldValue("token");
      if (blockchain && tokenAddress && tokenAddress !== '' && blockchain.node?.rpcProviderURL && dex && coin) {
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
          ...tokenInfo,
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

        if (selectedBot && selectedBot.subWallets) {
          let subWalletInfos = [];
          for (let i=0; i<selectedBot.subWallets.length; i++) {
            const tokenBalance = await tokenErc20Contract.methods.balanceOf(selectedBot.subWallets[i].publicKey).call();
            const coinBalance = await coinErc20Contract.methods.balanceOf(selectedBot.subWallets[i].publicKey).call();
            const networkCoin = await web3Client.eth.getBalance(selectedBot.subWallets[i].publicKey);
            const temp: SubWalletInfo = {
              baseCoin: coinBalance / (10 ** coinDecimals),
              tokenAmount: tokenBalance / (10 ** tokenDecimals),
              networkCoin: Number(networkCoin) / (10 ** 18)
            };
            subWalletInfos.push(temp);
          }
          setSubWalletInfo(subWalletInfos);
        }
  
        setTokenInfo(ti);
      }
    }
    
    if (elapsedTime % 3 === 0) {
      getTokenInfo();
    }
  }, [elapsedTime, chainData, coinData, dexData, form, tokenInfo, walletData]);

  useEffect(() => {
    if (!selectedBot?._id) {
      return;
    }

    const formData: any = {
      blockchain: selectedBot.blockchain._id,
      dex: selectedBot.dex?._id,
      wallet: selectedBot.wallet?._id,
      coin: selectedBot.coin?._id,
      token:selectedBot.token.address,
      startDate: {
        startTime: moment(selectedBot.start),
      },
      endDate: {
        endTime: moment(selectedBot.end),
      },
      targetVolume: selectedBot.targetVolume,
      cntWallet: selectedBot.cntWallet,
      depositMainCoin: selectedBot.depositMainCoin,
      depositBaseCoin: selectedBot.depositBaseCoin,
      minTradingAmount: selectedBot.minTradingAmount
    };

    form.setFieldsValue(formData);
  }, [
    form, 
    selectedBot?._id,
    selectedBot?.wallet?._id,
    selectedBot?.blockchain._id,
    selectedBot?.dex?._id,
    selectedBot?.coin?._id,
    selectedBot?.token.address,
    selectedBot?.start,
    selectedBot?.end,
    selectedBot?.targetVolume,
    selectedBot?.cntWallet,
    selectedBot?.depositMainCoin,
    selectedBot?.depositBaseCoin
  ]);

  useEffect(() => {
    if(isAvailable) {
      if (!selectedBot?.isProcessing && selectedBot?.cntWallet === 0) {
        showNotification("Withdrawn successfully!", 'success')
        setIsWithdraw(false);
        setVisible(false);
      }
    }
  }, [
    isAvailable,
    selectedBot?.isProcessing,
    selectedBot?.cntWallet
  ]);

  useEffect(() => {
    if (tokenInfo?.symbol) {
      const blockchain = chainData.find(chain => chain._id === form.getFieldValue("blockchain"));
      if (!blockchain?.coinmarketcapNetworkId) return;
      const tokenAddress = form.getFieldValue("token");

      coinMarketService.getCoinmarketcapId(tokenInfo?.symbol, blockchain.coinmarketcapNetworkId, tokenAddress)
      .then(res => {
        console.log("-------", res)
        setCoinmarketcapId(res);
        coinMarketService.getLatestVolume(res)
        .then(res1 => {
          console.log("-------", res1)
          setCurVolume(res1);
        });
      })
    }
  }, [tokenInfo?.symbol]);

  const coins = () => {
    let computed = coinData;
    computed = computed.filter(coin => form.getFieldValue('blockchain') === undefined || coin.blockchain?._id === form.getFieldValue('blockchain'));
    return computed;
  };

  const dexes = () => {
    let computed = dexData;
    computed = computed.filter(dex => form.getFieldValue('blockchain') === undefined || dex.blockchain?._id === form.getFieldValue('blockchain'));
    return computed;
  };

  const unUsedWallets = useCallback(() => {
    return companyWalletData.filter(el => el.cntInUse < 1);
  }, [companyWalletData]);

  const handleMinBaseCoin = () => {
    if (coinmarketcapId === "") {
      return;
    }

    coinMarketService.getCoinPrice(coinmarketcapId)
    .then(res => {
      const baseCoinPrice = +res;
      const targetVolume = form.getFieldValue('targetVolume') || 0;
      let minValue = (+targetVolume - curVolume)/(60*baseCoinPrice) || 0;
      if (minValue < 0) {
        minValue = 0;
      }

      minValue = (Math.ceil(minValue * 100))/100;
      form.setFieldsValue({
        depositBaseCoin: minValue
      });
    })
    .catch(err => console.log(err))
  }

  const handleCancel = () => {
    form.resetFields();
    setVisible(false);
  };

  const onFinish = async (values: any) => {
    if (selectedBot && selectedBot.state.status === EWasherBotStatus.RUNNING) {
      setVisible(false);
      return;
    }

    let companyWallets = unUsedWallets().sort((a, b) => a.cntInUse - b.cntInUse).slice(0, values.cntWallet);
    const blockchain = chainData.find(chain => chain._id === values.blockchain);
    let payload: any = {
      blockchain: values.blockchain,
      node: blockchain?.node?._id,
      dex: values.dex,
      coin: values.coin,
      wallet: values.wallet,
      start: values.startDate.startTime.format('YYYY-MM-DD HH:mm:ss').toString(),
      end: values.endDate.endTime.format('YYYY-MM-DD HH:mm:ss').toString(),
      targetVolume: Number(values.targetVolume),
      cntWallet: values.cntWallet,
      depositMainCoin: Number(values.depositMainCoin),
      depositBaseCoin: Number(values.depositBaseCoin),
      minTradingAmount: Number(values.minTradingAmount),
      slippageLimit: Number(values.slippageLimit),
      dailyLossLimit: Number(values.dailyLossLimit),
      subWallets: selectedBot?.subWallets?.length ? selectedBot.subWallets : companyWallets.map(el => el._id),
      state: {
        status: EWasherBotStatus.DRAFT,
        result: EWasherBotActionResult.DRAFT
      },
      coinmarketcapId: coinmarketcapId
    };

    if (!selectedBot?._id) {
      payload = {
        ...payload,
        token: values.token,
      }
    }

    if (!payload.subWallets.length) {
      form.setFieldsValue({
        cntWallet: null
      });
      form.submit();
      return;
    }

    if (selectedBot?._id) {
      dispatch(updateWasherBot(selectedBot._id, payload));
    } else {
      dispatch(addWasherBot(payload));
    }

    if (!selectedBot?.subWallets?.length) {
      for(let i=0; i<companyWallets.length; i++) {
        companyWallets[i].cntInUse = 1;
        await dispatch(updateCompanyWallet(companyWallets[i]));
      }
    }
    
    form.resetFields();
    setVisible(false);
  };

  const handleWithdraw = async () => {
    if (!selectedBot?._id) return;
    setIsWithdraw(true);
    botService.withdrawWasherBotWallet(selectedBot._id);
    setTimeout(() => {
      setIsAvailable(true);
    }, 6000);
  }

  return (
    <Modal
      title="DEX Washer"
      visible={visible}
      width={1000}
      centered
      maskClosable={false}
      onOk={form.submit}
      onCancel={handleCancel}
      footer={[
        <Button
          type='primary'
          loading={isWithdraw}
          onClick={handleWithdraw}
          danger
          disabled={!selectedBot || isWithdraw || selectedBot?.state.status === EWasherBotStatus.RUNNING || selectedBot?.isProcessing || !selectedBot.subWallets?.length ? true : false}
        >
          Withdraw
        </Button>,
        <Button key="back" onClick={handleCancel} disabled={isWithdraw}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" onClick={form.submit} disabled={isWithdraw}>
          {selectedBot?.state.status === EWasherBotStatus.RUNNING ? 'Ok' : 'Save'}
        </Button>,
      ]}
    >
      <Form
        form={form}
        labelCol={{ span: 10 }}
        wrapperCol={{ span: 14 }}
        labelAlign='left'
        onFinish={onFinish}
      >
        <Row gutter={20}>
          <Col span={10}>
            <Form.Item
              label="Chain"
              name="blockchain"
              rules={[{ required: true, message: 'Please select a chain!' }]}
            >
              <Select className="w-28" disabled={selectedBot?._id ? true : false}>
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
              <Select className="w-28" disabled={selectedBot?._id ? true : false}>
                {dexes().map((dex, idx) => (
                  <Option key={idx} value={dex._id ? dex._id : 'unknown'}>{dex.name}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label="Base Coin"
              name="coin"
              rules={[{ required: true, message: 'Please select a base coin!' }]}
            >
              <Select className="w-28" disabled={selectedBot?._id ? true : false}>
                {coins().map((coin, idx) => (
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
                <Col span={10} className="text-blue-light flex justify-end">
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
              name="wallet"
              rules={[{ required: true, message: 'Please select wallet!' }]}
            >
              <Select className="w-28" disabled={selectedBot?._id ? true : false}>
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
          </Col>

          <Col span={1}>
            <Divider type="vertical" className='h-full border-gray-dark'> </Divider>
          </Col>

          <Col span={13}>
            <Row gutter={6}>
              {tokenInfo && <Col span={24}>
                <Form.Item
                  label={(
                    <>
                      <span className='text-red'>*&nbsp;</span>
                      <span>Start</span>
                    </>
                  )}
                >
                  <Input.Group compact>
                    <Form.Item
                      name={["startDate", "startTime"]}
                      rules={[{ required: true, message: 'Please select start date!' }]}
                      noStyle
                    >
                      <DatePicker
                        style={{ width: '50%' }}
                        disabled={(selectedBot && selectedBot.state.status === EWasherBotStatus.RUNNING) ? true : false}
                      />
                    </Form.Item>
                    <Form.Item
                      name={["startDate", "startTime"]}
                      rules={[{ required: true, message: 'Please select start time!' }]}
                      noStyle
                    >
                      <TimePicker 
                        disabled={(selectedBot && selectedBot.state.status === EWasherBotStatus.RUNNING) ? true : false}
                        style={{ width: '50%' }}
                      />
                    </Form.Item>
                  </Input.Group>
                </Form.Item>
                
                <Form.Item
                  label={(
                    <>
                      <span className='text-red'>*&nbsp;</span>
                      <span>End</span>
                    </>
                  )}
                >
                  <Input.Group compact>
                    <Form.Item
                      name={["endDate", "endTime"]}
                      rules={[{ required: true, message: 'Please select end date!' }]}
                      noStyle
                    >
                      <DatePicker
                        style={{ width: '50%' }}
                        disabled={(selectedBot && selectedBot.state.status === EWasherBotStatus.RUNNING) ? true : false}
                      />
                    </Form.Item>
                    <Form.Item
                      name={["endDate", "endTime"]}
                      rules={[{ required: true, message: 'Please select end time!' }]}
                      noStyle
                    >
                      <TimePicker
                        style={{ width: '50%' }}
                        disabled={(selectedBot && selectedBot.state.status === EWasherBotStatus.RUNNING) ? true : false}
                      />
                    </Form.Item>
                  </Input.Group>
                </Form.Item>

                <Form.Item
                  label={(
                    <>
                      <span className='text-red'>*&nbsp;</span>
                      <span>Target Volume(24H)</span>
                    </>
                  )}
                >
                  <Space>
                    <Form.Item
                      name="targetVolume"
                      noStyle
                      rules={[
                        { required: true, message: 'Please enter the target volume!' },
                        {
                          validator: async (_, targetVolume) => {
                            if (targetVolume < 0) {
                              return Promise.reject(new Error('Invalid value'))
                            }
                          }
                        }
                      ]}
                    >
                      <Input 
                        placeholder='0'
                        type="number"
                        prefix="$"
                        disabled={selectedBot && selectedBot.state.status === EWasherBotStatus.RUNNING ? true : false}
                      />
                    </Form.Item>
                    {tokenInfo && <Input className='w-28' value={formattedNumber(curVolume, 2)} disabled />}
                  </Space>
                </Form.Item>

                <Form.Item
                  label={`Deposit ${tokenInfo.mainSymbol}`}
                  name="depositMainCoin"
                  rules={[
                    { required: true, message: 'Please enter the amount!' },
                    {
                      validator: async (_, depositMainCoin) => {
                        if (depositMainCoin < 0) {
                          return Promise.reject(new Error('Invalid value'))
                        }
                      }
                    }
                  ]}
                >
                  <Input
                    placeholder='0'
                    suffix={tokenInfo.mainSymbol}
                    type="number" 
                    max={tokenInfo.networkCoin}
                    disabled={selectedBot && selectedBot.state.status === EWasherBotStatus.RUNNING ? true : false}
                  />
                </Form.Item>

                <Form.Item
                  label={(
                    <>
                      <span className='text-red'>*&nbsp;</span>
                      {`Deposit ${tokenInfo.coinSymbol}`}
                    </>
                  )}
                >
                  <Space>
                    <Form.Item
                      name="depositBaseCoin"
                      noStyle
                      rules={[
                        { required: true, message: 'Please enter the amount!' },
                        {
                          validator: async (_, depositBaseCoin) => {
                            if (depositBaseCoin < 0) {
                              return Promise.reject(new Error('Invalid value'))
                            }
                          }
                        }
                      ]}
                    >
                      <Input
                        type="number" 
                        placeholder='0'
                        suffix={tokenInfo.coinSymbol}
                        max={tokenInfo.baseCoin}
                        disabled={selectedBot && selectedBot.state.status === EWasherBotStatus.RUNNING ? true : false}
                      />
                    </Form.Item>
                    <Button
                      onClick={handleMinBaseCoin}
                      disabled={selectedBot && selectedBot.state.status === EWasherBotStatus.RUNNING ? true : false}
                    >
                      Min
                    </Button>
                  </Space>
                </Form.Item>

                <Form.Item
                  label="Min Trading Amount"
                  name="minTradingAmount"
                  rules={[
                    { required: true, message: 'Please enter minimun trading amount!' },
                    {
                      validator: async (_, minTradingAmount) => {
                        if (minTradingAmount < 0) {
                          return Promise.reject(new Error('Invalid value'))
                        }
                      }
                    }
                  ]}
                >
                  <Input 
                    type="number"
                    placeholder='0'
                    prefix="$"
                    disabled={selectedBot && selectedBot.state.status === EWasherBotStatus.RUNNING ? true : false}
                  />
                </Form.Item>

                <Form.Item
                  label="Slippage Limit"
                  name="slippageLimit"
                  rules={[
                    { required: true, message: 'Please enter the amount!' },
                    {
                      validator: async (_, slippageLimit) => {
                        if (slippageLimit < 0) {
                          return Promise.reject(new Error('Invalid value'))
                        }
                      }
                    }
                  ]}
                  initialValue={10}
                >
                  <Input 
                    type="number"
                    placeholder='0'
                    suffix="%"
                    max={100}
                    min={0}
                    disabled={selectedBot && selectedBot.state.status === EWasherBotStatus.RUNNING ? true : false}
                  />
                </Form.Item>

                <Form.Item
                  label="Daily Loss Limit"
                  name="dailyLossLimit"
                  rules={[
                    { required: true, message: 'Please input loss limit per day!' },
                    {
                      validator: async (_, dailyLossLimit) => {
                        if (dailyLossLimit < 0) {
                          return Promise.reject(new Error('Invalid value'))
                        }
                      }
                    }
                  ]}
                  initialValue={10}
                >
                  <Input 
                    type="number"
                    suffix="%"
                    max={100}
                    min={0}
                    placeholder='0'
                    disabled={selectedBot && selectedBot.state.status === EWasherBotStatus.RUNNING ? true : false}
                  />
                </Form.Item>

                <Form.Item
                  name="cntWallet"
                  label="Number of Wallets"
                  rules={[{ required: true, message: 'Please select number of wallet!' }]}
                  initialValue={1}
                >
                  <Select disabled={selectedBot?.subWallets?.length ? true : false}>
                    {unUsedWallets().map((_, idx) => (
                      <Option value={idx+1} key={idx}>{idx+1}</Option>
                    ))}
                  </Select>
                </Form.Item>

                {selectedBot?.subWallets?.length ? <div className="w-full pt-2 text-sm mb-5">
                  <div className='flex border-solid border border-gray-dark w-full py-1'>
                    <div className='w-1/4 text-center'>
                      <span className=''>Address</span>
                    </div>
                    <div className='w-1/4 text-center'>
                      {tokenInfo?.mainSymbol ? tokenInfo.mainSymbol : 'Network Coin'}
                    </div>
                    <div className='w-1/4 text-center'>
                      {tokenInfo?.coinSymbol ? tokenInfo.coinSymbol : 'Base Coin'}
                    </div>
                    <div className='w-1/4 text-center'>
                      Token Amount
                    </div>
                  </div>
                  <div className='max-h-36 overflow-y-auto'>
                    {selectedBot?.subWallets?.map((wallet, idx) => (
                      <div className='flex border-solid border border-gray-dark py-1' key={idx}>
                        <div className='w-1/4 flex justify-center'>
                          <a href={`${tokenInfo.explorer}/address/${wallet.publicKey}`} target="_blank" rel="noreferrer">
                            {shortenAddress(wallet.publicKey)}
                          </a>
                          <CopyableLabel label="" value={wallet.publicKey} />
                        </div>
                        <div className='w-1/4 flex justify-center'>
                          <span>{subWalletInfo[idx] ? formattedNumber(subWalletInfo[idx].networkCoin) : 0}</span>
                        </div>
                        <div className='w-1/4 flex justify-center'>
                          <span>{subWalletInfo[idx] ? formattedNumber(subWalletInfo[idx].baseCoin) : 0}</span>
                        </div>
                        <div className='w-1/4 flex justify-center'>
                          <span>{subWalletInfo[idx] ? formattedNumber(subWalletInfo[idx].tokenAmount) : 0}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div> : <></>}
              </Col>}

              {!tokenInfo && <Col span={24}>
                <div className='flex justify-center items-center'>
                  <Spin />
                </div>
              </Col>}
            </Row>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};
