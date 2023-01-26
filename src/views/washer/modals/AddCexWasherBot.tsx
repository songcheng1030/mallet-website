import { useState, useEffect, useMemo } from 'react';
import { Modal, Form, Input, Select, Row, Col, Spin, Divider, DatePicker, TimePicker, Button, Space } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import Web3 from 'web3';
import { Account } from "coinbase";
import moment from 'moment-timezone';

import { selectBlockchains } from '../../../store/network/network.selectors';
import { EWasherBotStatus, IWasherBot, EExchangeType, ECEXType } from '../../../types';
import { addWasherBot, updateWasherBot } from '../../../store/washerBot/washerBot.actions';
import { selectElapsedTime } from "../../../store/auth/auth.selectors";
import { selectMyCexAccounts } from "../../../store/cexAccount/cexAccount.selectors";
import { formattedNumber } from '../../../shared';
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
  selectedBot: IWasherBot | null,
  setVisible: (visible: boolean) => void
};

export const AddCexWasherBot = (props: Props) => {
  const { visible, selectedBot, setVisible } = props;
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const { Option } = Select;
  const chainData = useSelector(selectBlockchains);
  const cexAccountData = useSelector(selectMyCexAccounts);
  const elapsedTime = useSelector(selectElapsedTime);
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [kucoinAccountInfo, setKucoinAccountInfo] = useState<any>();
  const [curVolume, setCurVolume] = useState<number>(0);
  const [coinmarketcapId, setCoinmarketcapId] = useState<string>("");

  useEffect(() => {
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

          setTokenInfo(ti);
        } catch (err) {
          return;
        }
      }
    }

    const onWalletRead = () => {
      const cexAccount = cexAccountData.find(el => el._id === form.getFieldValue("cexAccount"));
      if (cexAccount) {
        walletService.getAccounts(cexAccount._id)
        .then(res => {
          if (form.getFieldValue('cex') === ECEXType.COINBASE) {
            setAccounts(res);
          } else {
            setKucoinAccountInfo(res);
          }
        })
        .catch(err => {
          console.log("err", err);
        })
      }
    }

    if (elapsedTime % 5 === 0) {
      getTokenInfo();
      onWalletRead();
    }
  }, [elapsedTime, chainData, form, cexAccountData, tokenInfo?.symbol]);

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
      startDate: {
        startTime: moment(selectedBot.start),
      },
      endDate: {
        endTime: moment(selectedBot.end),
      },
      targetVolume: selectedBot.targetVolume,
      minTradingAmount: selectedBot.minTradingAmount,
      dailyLossLimit: selectedBot.dailyLossLimit
    };
    form.setFieldsValue(formData);
  }, [form, selectedBot]);

  useEffect(() => {
    if (tokenInfo?.symbol) {
      const blockchain = chainData.find(chain => chain._id === form.getFieldValue("blockchain"));
      if (!blockchain?.coinmarketcapNetworkId) return;
      const tokenAddress = form.getFieldValue("token");
      coinMarketService.getCoinmarketcapId(tokenInfo?.symbol, blockchain.coinmarketcapNetworkId, tokenAddress)
      .then(res => {
        setCoinmarketcapId(res);
        coinMarketService.getLatestVolume(res)
        .then(res1 => {
          setCurVolume(+res1);
        });
      })
    }
  }, [tokenInfo?.symbol]);

  const filteredCexAccountData = () => {
    let computed = cexAccountData;
    computed = computed.filter(el => form.getFieldValue('cex') === undefined || el.cex === form.getFieldValue('cex'));
    return computed;
  };

  const filteredAccounts = useMemo(() => {
    if (!accounts?.length) return [];
    let computed = accounts;
    if (tokenInfo) {
      computed = computed.filter(el => el.currency === tokenInfo.symbol);
    }
    return computed;
  }, [accounts, tokenInfo]);

  const handleCancel = () => {
    form.resetFields();
    setVisible(false);
  };

  const onFinish = (values: any) => {
    if (selectedBot && selectedBot.state.status === EWasherBotStatus.RUNNING) {
      setVisible(false);
      return;
    }

    const blockchain = chainData.find(chain => chain._id === values.blockchain);

    let payload: any = {
      blockchain: values.blockchain,
      node: blockchain?.node?._id,
      exchangeType: EExchangeType.CEX,
      accountId: values.account,
      cexAccount: values.cexAccount,
      cex: values.cex,
      start: values.startDate.startTime.format('YYYY-MM-DD HH:mm:ss').toString(),
      end: values.endDate.endTime.format('YYYY-MM-DD HH:mm:ss').toString(),
      targetVolume: Number(values.targetVolume),
      minTradingAmount: Number(values.minTradingAmount),
      dailyLossLimit: Number(values.dailyLossLimit),
      coinmarketcapId: coinmarketcapId
    };

    if (!selectedBot?._id) {
      payload = {
        ...payload,
        token: values.token
      }
    }

    if (selectedBot?._id) {
      dispatch(updateWasherBot(selectedBot._id, payload));
    } else {
      dispatch(addWasherBot(payload));
    }

    form.resetFields();
    setVisible(false);
  };

  return (
    <Modal
      title="CEX Washer"
      visible={visible}
      width={1000}
      centered
      maskClosable={false}
      onOk={form.submit}
      okText={selectedBot?.state.status === EWasherBotStatus.RUNNING ? 'Ok' : 'Save'}
      onCancel={handleCancel}
    >
      <Form
        form={form}
        labelCol={{ span: 10 }}
        wrapperCol={{ span: 14 }}
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

            {tokenInfo && accounts.length > 0 && form.getFieldValue('cex') === ECEXType.COINBASE && <Form.Item
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
                {tokenInfo && <Button disabled>{formattedNumber(curVolume)}</Button>}
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
                // className='w-full'
                prefix="$"
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
            >
              <Input 
                type="number"
                suffix="%"
                placeholder='0'
                // className='w-full'
                disabled={selectedBot && selectedBot.state.status === EWasherBotStatus.RUNNING ? true : false}
              />
            </Form.Item>
          </Col>}

          {(!tokenInfo || (accounts.length < 1 && !kucoinAccountInfo) ) && <Col span={11}>
            <div className='flex justify-center items-center'>
              <Spin />
            </div>
          </Col>}
        </Row>
      </Form>
    </Modal>
  );
};
