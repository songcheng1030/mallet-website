import { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Row, Col, Divider, Spin, InputNumber, Button } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import Web3 from 'web3';
import BigNumber from 'bignumber.js';

import { selectDexs, selectBlockchains, selectCoins } from '../../../store/network/network.selectors';
import { selectMyWallets } from '../../../store/wallet/wallet.selectors';
import { ELiquidatorBotStatus, ILiquidatorBot } from '../../../types';
import { addLiquidatorBot, updateLiquidatorBot } from '../../../store/liquidatorBot/liquidatorBot.actions';
import { selectElapsedTime } from "../../../store/auth/auth.selectors";
import { CopyableLabel } from '../../../components/common/CopyableLabel';
import { shortenAddress, formattedNumber, showNotification } from '../../../shared';

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

interface Props {
  visible: boolean,
  selectedBot: ILiquidatorBot | null,
  setVisible: (visible: boolean) => void
};

export const AddDexLiquidatorBot = (props: Props) => {
  const { visible, selectedBot, setVisible } = props;
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const { Option } = Select;
  const chainData = useSelector(selectBlockchains);
  const dexData = useSelector(selectDexs);
  const walletData = useSelector(selectMyWallets);
  const coinData = useSelector(selectCoins);
  const elapsedTime = useSelector(selectElapsedTime);

  const [initTime, setInitTime] = useState<number>(0);
  const [flag, setFlag] = useState<boolean>(false);
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);

  useEffect(() => {
    if (!flag) {
      setInitTime(elapsedTime);
    }
    setFlag(true);

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
  
        setTokenInfo(ti);
      }
    }
    
    if ((elapsedTime - initTime) % 2 === 0) {
      getTokenInfo();
    }
  }, [elapsedTime, flag, initTime, chainData, coinData, dexData, form, tokenInfo, walletData]);

  useEffect(() => {
    if (!selectedBot) {
      return;
    }

    const formData: any = {
      blockchain: selectedBot.blockchain._id,
      dex: selectedBot.dex?._id,
      wallet: selectedBot.wallet?._id,
      coin: selectedBot.coin?._id,
      token:selectedBot.token.address,
      // upperPrice: selectedBot.upperPrice,
      lowerPrice: selectedBot.lowerPrice,
      // averagePrice: selectedBot.averagePrice,
      presetAmount: selectedBot.presetAmount,
      bigSellPercentage: selectedBot.bigSellPercentage,
      smallSellPercentage: selectedBot.smallSellPercentage,
      tokenAmount: selectedBot.tokenAmount,
    };

    form.setFieldsValue(formData);
  }, [form, selectedBot]);

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

  const handleCancel = () => {
    form.resetFields();
    setVisible(false);
  };

  const onFinish = (values: any) => {
    if (selectedBot && selectedBot.state === ELiquidatorBotStatus.RUNNING) {
      setVisible(false);
      return;
    }

    if (!tokenInfo?.tokenAmount) {
      showNotification("Please top up tokens", "info", 'topRight');
      return;
    }
    
    const blockchain = chainData.find(chain => chain._id === values.blockchain)
    let payload: any = {
      blockchain: values.blockchain,
      node: blockchain?.node?._id,
      dex: values.dex,
      coin: values.coin,
      wallet: values.wallet,
      // upperPrice: Number(values.upperPrice),
      lowerPrice: Number(values.lowerPrice),
      // averagePrice: Number(values.averagePrice),
      presetAmount: Number(values.presetAmount),
      bigSellPercentage: Number(values.bigSellPercentage),
      smallSellPercentage: Number(values.smallSellPercentage),
      tokenAmount: Number(values.tokenAmount),
      tokenSold: 0,
    };

    if (tokenInfo && payload.tokenAmount > tokenInfo.tokenAmount) {
      showNotification("Token amount can't be higher than balance.", "error", 'topRight');
      return;
    }

    if (payload.upperPrice <= payload.averagePrice) {
      showNotification("Upper price should be always higher than the average price", "error", 'topRight');
      return;
    }

    if (payload.averagePrice <= payload.lowerPrice) {
      showNotification("Average price should be always higher than the lower price.", "error", 'topRight');
      return;
    }

    if (!selectedBot?._id) {
      payload = {
        ...payload,
        token: values.token
      }
    }

    if (selectedBot?._id) {
      dispatch(updateLiquidatorBot(selectedBot._id, payload));
    } else {
      dispatch(addLiquidatorBot(payload));
    }
    
    form.resetFields();
    setVisible(false);
  };

  return (
    <Modal
      title="DEX Liquidator"
      visible={visible}
      width={1000}
      centered
      maskClosable={false}
      onOk={form.submit}
      okText={selectedBot?.state === ELiquidatorBotStatus.RUNNING ? 'Ok' : 'Save'}
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
          <Col span={12}>
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

          <Col span={11}>
            <Row gutter={6}>
              {tokenInfo && <Col span={24}>
                {/* <Form.Item
                  label="Upper price"
                  name="upperPrice"
                  rules={[
                    { required: true, message: 'Please enter the upper price!' },
                    {
                      validator: async (_, upperPrice) => {
                        if (upperPrice < 0) {
                          return Promise.reject(new Error('Invalid value'))
                        }
                      }
                    }
                  ]}
                >
                  <Input 
                    className='' 
                    type="number"
                    min={0}
                    suffix={tokenInfo ? tokenInfo.coinSymbol : ''}
                    disabled={selectedBot && selectedBot.state === ELiquidatorBotStatus.RUNNING ? true : false}
                    placeholder="0"
                  />
                </Form.Item> */}
                <Form.Item
                  label="Lower limit"
                  name="lowerPrice"
                  rules={[
                    { required: true, message: 'Please enter the lower price!' },
                    {
                      validator: async (_, lowerPrice) => {
                        if (lowerPrice < 0) {
                          return Promise.reject(new Error('Invalid value'))
                        }
                      }
                    }
                  ]}
                >
                  <Input 
                    className='w-full' 
                    type="number"
                    suffix={tokenInfo ? tokenInfo.coinSymbol : ''}
                    disabled={selectedBot && selectedBot.state === ELiquidatorBotStatus.RUNNING ? true : false} 
                    placeholder="0"
                  />
                </Form.Item>

                {/* <Form.Item
                  label="Average price"
                  name="averagePrice"
                  rules={[
                    { required: true, message: 'Please enter the average price!' },
                    {
                      validator: async (_, averagePrice) => {
                        if (averagePrice < 0) {
                          return Promise.reject(new Error('Invalid value'))
                        }
                      }
                    }
                  ]}
                >
                  <Input 
                    className='w-full'
                    type="number"
                    suffix={tokenInfo ? tokenInfo.coinSymbol : ''}
                    disabled={selectedBot && selectedBot.state === ELiquidatorBotStatus.RUNNING ? true : false} 
                    placeholder="0"
                  />
                </Form.Item> */}

                <Form.Item
                  label="Preset amount"
                  name="presetAmount"
                  rules={[
                    { required: true, message: 'Please enter the preset amount!' },
                    {
                      validator: async (_, presetAmount) => {
                        if (presetAmount < 0) {
                          return Promise.reject(new Error('Invalid value'))
                        }
                      }
                    }
                  ]}
                >
                  <Input 
                    className='w-full'
                    type="number"
                    suffix={tokenInfo ? tokenInfo.symbol : ''}
                    disabled={selectedBot && selectedBot.state === ELiquidatorBotStatus.RUNNING ? true : false} 
                    placeholder="0"
                  />
                </Form.Item>

                <Form.Item
                  label="Big sell"
                  name="bigSellPercentage"
                  rules={[
                    { required: true, message: 'Big sell percentage!' },
                    {
                      validator: async (_, bigSellPercentage) => {
                        if (bigSellPercentage < 0) {
                          return Promise.reject(new Error('Invalid value'))
                        }
                      }
                    }
                  ]}
                >
                  <Input 
                    className='w-full'
                    type="number"
                    suffix="%"
                    disabled={selectedBot && selectedBot.state === ELiquidatorBotStatus.RUNNING ? true : false} 
                    placeholder="0"
                  />
                </Form.Item>

                <Form.Item
                  label="Small sell"
                  name="smallSellPercentage"
                  rules={[
                    { required: true, message: 'Small sell percentage!' },
                    {
                      validator: async (_, smallSellPercentage) => {
                        if (smallSellPercentage < 0) {
                          return Promise.reject(new Error('Invalid value'))
                        }
                      }
                    }
                  ]}
                >
                  <Input 
                    className='w-full'
                    type="number"
                    suffix="%"
                    disabled={selectedBot && selectedBot.state === ELiquidatorBotStatus.RUNNING ? true : false} 
                    placeholder="0"
                  />
                </Form.Item>

                <Form.Item
                  label={(<div>
                      <span className='text-red'>* </span>
                      <span>Token Amount</span>
                    </div>)}
                >
                  <Form.Item
                    name="tokenAmount" 
                    rules={[
                      { required: true, message: 'Please enter token amount!' },
                      {
                        validator: async (_, tokenAmount) => {
                          if (tokenAmount > tokenInfo.tokenAmount || tokenAmount < 0) {
                            return Promise.reject(new Error('Invalid value'))
                          }
                        }
                      }
                    ]}
                    noStyle
                  >
                    <Input
                      className='w-56'
                      type="number"
                      max={tokenInfo.tokenAmount}
                      min={0}
                      disabled={selectedBot && selectedBot.state === ELiquidatorBotStatus.RUNNING ? true : false} 
                      placeholder="0"
                    />
                  </Form.Item>
                  <Button 
                    onClick={()=>form.setFieldsValue({tokenAmount: tokenInfo.tokenAmount})}
                    disabled={selectedBot && selectedBot.state === ELiquidatorBotStatus.RUNNING ? true : false}
                  >Max</Button>
                </Form.Item>
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
