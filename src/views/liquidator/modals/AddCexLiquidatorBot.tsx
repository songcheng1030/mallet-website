import { useState, useEffect, useMemo } from 'react';
import { Modal, Form, Input, Select, Row, Col, Spin, Divider, Radio, Space, InputNumber, Button, Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import Web3 from 'web3';
import coinbase, { Account } from "coinbase";

import { selectBlockchains } from '../../../store/network/network.selectors';
import { ELiquidatorBotStatus, ILiquidatorBot, ELiquidatorBotType, SellingStrategy, ECEXType } from '../../../types';
import { addLiquidatorBot, updateLiquidatorBot } from '../../../store/liquidatorBot/liquidatorBot.actions';
import { selectElapsedTime } from "../../../store/auth/auth.selectors";
import { selectMyCexAccounts } from "../../../store/cexAccount/cexAccount.selectors";
import { formattedNumber, showNotification } from '../../../shared';
import { walletService, coinMarketService } from 'services';
const erc20ABI = require("shared/erc20.json");

interface TokenInfo {
  symbol: string;
  coinSymbol: string;
  mainSymbol: string;
  explorer: string;
  totalSupply: number;
  // price: number;
  tokenName: string;
}

interface Props {
  visible: boolean,
  selectedBot: ILiquidatorBot | null,
  setVisible: (visible: boolean) => void
};

export const AddCexLiquidatorBot = (props: Props) => {
  const { visible, selectedBot, setVisible } = props;
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const { Option } = Select;
  const chainData = useSelector(selectBlockchains);
  const cexAccountData = useSelector(selectMyCexAccounts);
  const elapsedTime = useSelector(selectElapsedTime);

  const [initTime, setInitTime] = useState<number>(0);
  const [flag, setFlag] = useState<boolean>(false);
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [tokenPrice, setTokenPrice] = useState<number>(0);
  const [accounts, setAccounts] = useState<Account[]>([]);
  // const [strategy, setStrategy] = useState<SellingStrategy>(SellingStrategy.CONST);
  const [constAmount, setConstAmount] = useState<string>('2');
  // const [upperPercent, setUpperPercent] = useState<string>('');
  // const [averagePercent, setAveragePercent] = useState<string>('');
  const [lowerPercent, setLowerPercent] = useState<string>('');
  const [kucoinAccountInfo, setKucoinAccountInfo] = useState<any>();
  
  useEffect(() => {
    if (!flag) {
      setInitTime(elapsedTime);
    }
    setFlag(true);

    const getTokenInfo = async () => {
      const blockchain = chainData.find(ch => ch._id === form.getFieldValue("blockchain"));
      const tokenAddress = form.getFieldValue("token");
      if (blockchain && tokenAddress && tokenAddress !== '' && blockchain.node?.rpcProviderURL) {
        try {
          let rpc = blockchain.node?.rpcProviderURL;
          const web3Client = new Web3(rpc);
          const tokenErc20Contract = new web3Client.eth.Contract(erc20ABI, tokenAddress);
          const symbol = await tokenErc20Contract.methods.symbol().call(); //--------
          const tokenName = await tokenErc20Contract.methods.name().call();
          let ti: any = {
            // ...tokenInfo,
            symbol,
            tokenName,
            mainSymbol: blockchain.coinSymbol,
            explorer: blockchain.explorer,
          };

          if (symbol && tokenName) {
            setTokenInfo(ti);
          }
        } catch (err) {
          return;
        }
      }
    }

    const onWalletRead = () => {
      const cexAccount = cexAccountData.find(el => el._id === form.getFieldValue("cexAccount"));
      if (cexAccount?._id) {
        // const client = new coinbase.Client({
        //   'apiKey': cexAccount.apiKey,
        //   'apiSecret': cexAccount.apiSecret,
        //   'strictSSL': false
        // });

        // client.getAccounts({}, (err, accounts) => {
        //   setAccounts(accounts);
        // });

        walletService.getAccounts(cexAccount._id)
        .then(res => {
          if (form.getFieldValue('cex') === ECEXType.COINBASE && res?.length) {
            setAccounts(res);
          } else if (form.getFieldValue('cex') === ECEXType.KUCOIN && res) {
            setKucoinAccountInfo(res);
          }
        })
        .catch(err => {
          console.log("err", err);
        })

        // if (tokenInfo?.symbol) {
        //   client.getSpotPrice({ 'currencyPair': `${tokenInfo?.symbol}-USD` }, function (err, res) {
        //     if (err) return;
        //     setTokenPrice(Number(res.data.amount));
        //   });
        // }
      }
    }

    if ((elapsedTime - initTime) % 3 === 0) {
      getTokenInfo();
      onWalletRead();
    }
  }, [elapsedTime, flag, initTime, chainData, form, cexAccountData, tokenInfo?.symbol]);

  useEffect(() => {
    if (tokenInfo?.symbol) {
      const blockchain = chainData.find(chain => chain._id === form.getFieldValue("blockchain"));
      if (!blockchain?.coinmarketcapNetworkId) return;
      const tokenAddress = form.getFieldValue("token");
      coinMarketService.getCoinmarketcapId(tokenInfo?.symbol, blockchain.coinmarketcapNetworkId, tokenAddress)
      .then(res => {
        // setCoinmarketcapId(res);
        coinMarketService.getCoinPrice(res)
        .then(res1 => {
          setTokenPrice(+res1);
        });
      })
    }
  }, [tokenInfo?.symbol, chainData]);

  const selectedAccountBalance = useMemo(() => {
    if (!accounts?.length) return 0;
    const acc = accounts.find(el => el.id === form.getFieldValue("account"));
    if (acc) {
      return +acc.balance.amount;
    } else {
      return 0;
    }
  }, [accounts, form]);

  useEffect(() => {
    if (!selectedBot) {
      return;
    }

    const formData: any = {
      blockchain: selectedBot.blockchain._id,
      token: selectedBot.token.address,
      account: selectedBot.accountId,
      cexAccount: selectedBot.cexAccount?._id,
      cex: selectedBot.cex,
      // upperPrice: selectedBot.upperPrice,
      lowerPrice: selectedBot.lowerPrice,
      // averagePrice: selectedBot.averagePrice,
      tokenAmount: selectedBot.tokenAmount,
      // orderAmountLimit: selectedBot.orderAmountLimit
    };
    form.setFieldsValue(formData);
    // selectedBot.strategy && setStrategy(selectedBot.strategy);
    selectedBot.constAmount && setConstAmount(String(selectedBot.constAmount));
  }, [form, selectedBot]);

  useEffect(() => {
    if (!selectedBot) {
      return;
    }

    // const upperP = (selectedBot.upperPrice * 100 / tokenPrice) - 100;
    // setUpperPercent(upperP.toFixed(2));
    // const averageP = (selectedBot.averagePrice * 100 / tokenPrice) - 100;
    // setAveragePercent(averageP.toFixed(2));
    const lowerP = (selectedBot.lowerPrice * 100 / tokenPrice) - 100;
    setLowerPercent(lowerP.toFixed(2));
  }, [selectedBot, tokenPrice]);

  const filteredAccounts = useMemo(() => {
    if (!accounts?.length) return [];
    let computed = accounts;
    if (tokenInfo) {
      computed = computed.filter(el => el.currency === tokenInfo.symbol);
    }

    return computed;
  }, [accounts, tokenInfo]);

  const filteredCexAccountData = () => {
    let computed = cexAccountData;
    computed = computed.filter(el => form.getFieldValue('cex') === undefined || el.cex === form.getFieldValue('cex'));
    return computed;
  };

  const handleCancel = () => {
    form.resetFields();
    setKucoinAccountInfo(null);
    setVisible(false);
  };

  // const onChangeStrategy = (value: SellingStrategy) => {
  //   setStrategy(value);
  // };

  const handlePercentChange = (value: string, type: string) => {
    switch(type) {
      case 'upper':
        // setUpperPercent(value);
        // form.setFieldsValue({upperPrice: (tokenPrice * (Number(value) + 100) / 100).toFixed(4)});
        break;
      case 'average':
        // setAveragePercent(value);
        // form.setFieldsValue({averagePrice: (tokenPrice * (Number(value) + 100) / 100).toFixed(4)});
        break;
      case 'lower':
        setLowerPercent(value);
        form.setFieldsValue({lowerPrice: (tokenPrice * (Number(value) + 100) / 100).toFixed(4)});
        break;
      default:
        break;
    }
  }

  const onFinish = (values: any) => {
    if (selectedBot && selectedBot.state === ELiquidatorBotStatus.RUNNING) {
      setVisible(false);
      return;
    }

    if (values.cex == ECEXType.KUCOIN && !kucoinAccountInfo[tokenInfo?.symbol ? tokenInfo.symbol : -1]) {
      showNotification("Please top up tokens.", "info", 'topRight');
      return;
    }

    if (values.cex == ECEXType.COINBASE && !selectedAccountBalance) {
      showNotification("Please top up tokens.", "info", 'topRight');
      return;
    }

    const blockchain = chainData.find(chain => chain._id === values.blockchain);

    let payload: any = {
      blockchain: values.blockchain,
      node: blockchain?.node?._id,
      type: ELiquidatorBotType.CEX,
      accountId: values.account,
      cexAccount: values.cexAccount,
      cex: values.cex,
      // upperPrice: Number(values.upperPrice),
      lowerPrice: Number(values.lowerPrice),
      // averagePrice: Number(values.averagePrice),
      tokenAmount: Number(values.tokenAmount),
      tokenSold: 0,
      // strategy: strategy,
      constAmount: Number(constAmount),
      state: ELiquidatorBotStatus.NONE,
      // orderAmountLimit: Number(values.orderAmountLimit)
    };

    if (payload.cex == ECEXType.COINBASE && payload.tokenAmount > selectedAccountBalance) {
      showNotification("Token amount can't be higher than balance.", "error", 'topRight');
      return;
    }

    // if (payload.cex == ECEXType.KUCOIN && payload.tokenAmount > kucoinAccountInfo[tokenInfo?.symbol ? tokenInfo.symbol : -1]) {
    //   showNotification("Token amount can't be higher than balance.", "error", 'topRight');
    //   return;
    // }

    // if (payload.upperPrice <= payload.averagePrice) {
    //   showNotification("Upper price should be always higher than the average price.", "error", 'topRight');
    //   return;
    // }

    // if (payload.averagePrice <= payload.lowerPrice) {
    //   showNotification("Average price should be always higher than the lower price.", "error", 'topRight');
    //   return;
    // }

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

    setKucoinAccountInfo(null);
    form.resetFields();
    setVisible(false);
  };

  const setMaxTokenAmount = () => {
    if (form.getFieldValue('cex') === ECEXType.COINBASE) {
      form.setFieldsValue({tokenAmount: selectedAccountBalance});
    } else if (form.getFieldValue('cex') === ECEXType.KUCOIN) {
      form.setFieldsValue({tokenAmount: kucoinAccountInfo[tokenInfo?.symbol ? tokenInfo.symbol : -1] ? kucoinAccountInfo[tokenInfo?.symbol ? tokenInfo.symbol : -1] : 0});
    }
  }

  return (
    <Modal
      title="CEX Liquidator"
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
              label="CEX"
              name="cex"
              rules={[{ required: true, message: 'Please select a CEX!' }]}
            >
              <Select className="w-28" disabled={selectedBot?._id ? true : false}>
                <Option value={ECEXType.COINBASE}>Coinbase</Option>
                <Option value={ECEXType.KUCOIN}>Kucoin</Option>
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
                <Col span={10}>Token Name: </Col>
                <Col span={14} className="text-blue-light text-right">{tokenInfo ? tokenInfo.tokenName : '---'}</Col>
              </Row>
            </div>

            <Form.Item
              label="CEX Account"
              name="cexAccount"
              rules={[{ required: true, message: 'Please select!' }]}
            >
              <Select className="w-28" disabled={selectedBot?._id ? true : false}>
                {filteredCexAccountData().map((account, idx) => (
                  <Option key={idx} value={account._id}>
                    {account.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            {accounts.length > 0 && <Form.Item
              label="Wallet"
              name="account"
              rules={[{ required: true, message: 'Please select account!' }]}
            >
              <Select className="w-28" disabled={selectedBot?._id ? true : false}>
                {filteredAccounts.map((account, idx) => (
                  <Option key={idx} value={account.id}>
                    {account.name} [{formattedNumber(Number(account.balance.amount))}]
                  </Option>
                ))}
              </Select>
            </Form.Item>}

            {tokenInfo && kucoinAccountInfo && form.getFieldValue('cex') === ECEXType.KUCOIN &&
              <div className='w-full text-right'>
                <span>{tokenInfo.symbol} : <span className='text-blue'>{formattedNumber(kucoinAccountInfo[tokenInfo.symbol])}</span></span>
                <span className='ml-3'>USDT: <span className='text-blue'>{formattedNumber(kucoinAccountInfo["USDT"])}</span></span>
              </div>
            }
          </Col>

          <Col span={1}>
            <Divider type="vertical" className='h-full border-gray-dark'> </Divider>
          </Col>

          {tokenInfo && (accounts.length > 0 || kucoinAccountInfo) && <Col span={11}>
            <Row className='mb-6 flex items-center'>
              <Col span={8}>
                <div>Token price</div>
              </Col>
              <Col span={16}>
                <Input 
                  placeholder='0'
                  className='w-full'
                  prefix="$"
                  value={formattedNumber(tokenPrice)}
                  disabled
                />
              </Col>
            </Row>
            {/* <Form.Item
              label="Upper price"
            >
              <Form.Item
                name="upperPrice"
                rules={[
                  { required: true, message: 'Please enter upper price!' },
                  {
                    validator: async (_, upperPrice) => {
                      if (upperPrice < 0) {
                        return Promise.reject(new Error('Invalid value'))
                      }
                    }
                  }
                ]}
                noStyle>
                <Input 
                  placeholder='0'
                  className='w-40'
                  prefix="$"
                  type="number"
                  onChange={(e)=>{setUpperPercent(((Number(e.target.value) * 100 / tokenPrice)-100).toFixed(2))}}
                  disabled={selectedBot && selectedBot.state === ELiquidatorBotStatus.RUNNING ? true : false}
                />
              </Form.Item>
              <Input 
                placeholder='0'
                className='w-28 ml-2'
                suffix="%"
                type="number"
                value={upperPercent}
                onChange={(e)=>handlePercentChange(e.target.value, 'upper')}
                disabled={selectedBot && selectedBot.state === ELiquidatorBotStatus.RUNNING ? true : false}
              />
            </Form.Item>

            <Form.Item
              label="Average price"
            >
              <Form.Item
                name="averagePrice"
                rules={[
                  { required: true, message: 'Please enter average price!' },
                  {
                    validator: async (_, averagePrice) => {
                      if (averagePrice < 0) {
                        return Promise.reject(new Error('Invalid value'))
                      }
                    }
                  }
                ]}
                noStyle
              >
                <Input 
                  placeholder='0'
                  className='w-40'
                  prefix="$"
                  type="number"
                  onChange={(e)=>{setAveragePercent(((Number(e.target.value) * 100 / tokenPrice)-100).toFixed(2))}}
                  disabled={selectedBot && selectedBot.state === ELiquidatorBotStatus.RUNNING ? true : false}
                />
              </Form.Item>
              <Input 
                placeholder='0'
                className='w-28 ml-2'
                suffix="%"
                type="number"
                value={averagePercent}
                onChange={(e)=>handlePercentChange(e.target.value, 'average')}
                disabled={selectedBot && selectedBot.state === ELiquidatorBotStatus.RUNNING ? true : false}
              />
            </Form.Item> */}
            
            <Form.Item
              label="Lower limit"
            >
              <Form.Item
                name="lowerPrice"
                rules={[
                  { required: true, message: 'Please enter lower price!' },
                  {
                    validator: async (_, lowerPrice) => {
                      if (lowerPrice < 0) {
                        return Promise.reject(new Error('Invalid value'))
                      }
                    }
                  }
                ]}
                noStyle
              >
                <Input 
                  placeholder='0'
                  className='w-40'
                  prefix="$"
                  type="number"
                  onChange={(e)=>{setLowerPercent(((Number(e.target.value) * 100 / tokenPrice)-100).toFixed(2))}}
                  disabled={selectedBot && selectedBot.state === ELiquidatorBotStatus.RUNNING ? true : false}
                />
              </Form.Item>
              <Input 
                placeholder='0'
                className='w-28 ml-2'
                suffix="%"
                type="number"
                value={lowerPercent}
                onChange={(e)=>handlePercentChange(e.target.value, 'lower')}
                disabled={selectedBot && selectedBot.state === ELiquidatorBotStatus.RUNNING ? true : false}
              />
            </Form.Item>

            <Form.Item
              label="Token amount"
            >
              <Form.Item 
                name="tokenAmount"
                rules={[
                  { required: true, message: 'Please enter token amount!' },
                  // {
                  //   validator: async (_, tokenAmount) => {
                  //     if (tokenAmount > selectedAccountBalance || tokenAmount < 0) {
                  //       return Promise.reject(new Error('Invalid value'))
                  //     }
                  //   }
                  // }
                ]}
                noStyle
              >
                <Input
                  className='w-40'
                  type="number"
                  max={selectedAccountBalance}
                  min={0}
                  suffix={tokenInfo.symbol}
                  placeholder="0"
                  disabled={selectedBot && selectedBot.state === ELiquidatorBotStatus.RUNNING ? true : false} 
                />
              </Form.Item>
              <Button 
                className='w-28 ml-2' 
                onClick={setMaxTokenAmount}
                disabled={selectedBot && selectedBot.state === ELiquidatorBotStatus.RUNNING ? true : false}
              >
                Max
              </Button>
            </Form.Item>

            {/* <Form.Item
              label="Order Amount Limit"
              name="orderAmountLimit" 
              rules={[{ required: false}]}
            >
              <Input
                className='w-full'
                type="number"
                prefix="$"
                min={0}
                placeholder="0"
                disabled={selectedBot && selectedBot.state === ELiquidatorBotStatus.RUNNING ? true : false} 
              />
            </Form.Item> */}

            <Form.Item
              label="Constant"
            >
              <Input 
                value={constAmount} 
                suffix="%" 
                type="number"
                onChange={(e)=>setConstAmount(e.target.value)} 
                disabled={selectedBot && selectedBot.state === ELiquidatorBotStatus.RUNNING ? true : false}
              />
            </Form.Item>

            {/* <div className='w-full flex flex-column justify-end'>
              <div className='ant-col-8 mt-2'>Strategy</div>
              <div className="ant-col-16 mb-2">
                <Radio.Group 
                  onChange={(e)=>onChangeStrategy(e.target.value)} 
                  value={strategy} 
                  disabled={selectedBot && selectedBot.state === ELiquidatorBotStatus.RUNNING ? true : false}
                >
                  <Space direction="vertical" className='liquidator-strategy'>
                    <div className='flex'>
                      <Radio value={SellingStrategy.CONST} className="my-2">
                        <span>Constant </span> 
                        <Tooltip 
                          placement="top" 
                          title="The selling amount will be constantly equal to the amount that corresponds to the depth from orderbook, which we configure with an input."
                        >
                          <QuestionCircleOutlined />
                        </Tooltip>
                      </Radio>
                      {strategy === SellingStrategy.CONST ? 
                        <Input 
                          value={constAmount} 
                          suffix="%" 
                          type="number"
                          style={{ width: 155, height: 35, marginLeft: 10 }} 
                          onChange={(e)=>setConstAmount(e.target.value)} 
                          disabled={selectedBot && selectedBot.state === ELiquidatorBotStatus.RUNNING ? true : false}
                        /> : null}
                    </div>
                    <Radio value={SellingStrategy.LINEAR} className="mb-2">
                      <span>Linear function </span>
                      <Tooltip 
                        placement="top" 
                        title="The selling amount is decided by the depth of the orderbook, which increases/decreases in a linear mode. i.e. The higher the token price, the selling amount will be corresponding to the lower depth amount, and vice versa."
                      >
                        <QuestionCircleOutlined />
                      </Tooltip>
                    </Radio>
                    <Radio value={SellingStrategy.QUADRATIC} className="mb-2">
                      <span>Quadratic function </span>
                      <Tooltip 
                        placement="top" 
                        title="This is similar to linear mode but as the token price is going down, the selling amount will always be smaller than the linear mode so that the token price will be less affected than the linear mode."
                      >
                        <QuestionCircleOutlined />
                      </Tooltip>
                    </Radio>
                  </Space>
                </Radio.Group>
              </div>
            </div> */}
          </Col>}

          {(!tokenInfo || (accounts.length < 1 && !kucoinAccountInfo)) && <Col span={11}>
            <div className='flex justify-center items-center'>
              <Spin />
            </div>
          </Col>}
        </Row>
      </Form>
    </Modal>
  );
};
