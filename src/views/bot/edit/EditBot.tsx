import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Modal, Form, Input, InputNumber, Button, Checkbox, Select, Row, Col, DatePicker, TimePicker, Space, Card, Divider } from 'antd';
import { PlusCircleOutlined, MinusCircleOutlined } from '@ant-design/icons';
import moment from 'moment-timezone';

import { updateBot, addBot } from '../../../store/bot/bot.actions';
import { selectNodes, selectDexs, selectBlockchains, selectCoins } from '../../../store/network/network.selectors';
import { selectMyWallets } from '../../../store/wallet/wallet.selectors';
import { EBotType, IBot, ITokenDetailDto, ITokenDetailReqDto, EBotSellType } from '../../../types';
import { tokenService } from '../../../services';
import { showNotification, numberWithCommas } from "../../../shared/helpers";

interface Props {
  bot?: IBot;
  visible: boolean;
  setVisible: (visible: boolean) => void;
  isEdit: boolean;
  onlyBuy: boolean;
}

export const EditBot = (props: Props) => {
  const [tokenInfo, setTokenInfo] = useState<ITokenDetailDto | null>(null);
  const [useStopLoss, setUseStopLoss] = useState<boolean>(false);
  const [useSavings, setUseSavings] = useState<boolean>(false);

  const { bot, visible, setVisible, isEdit, onlyBuy } = props;
  const dispatch = useDispatch();
  const { Option } = Select;
  const [form] = Form.useForm();
  const chainData = useSelector(selectBlockchains);
  const nodeData = useSelector(selectNodes);
  const dexData = useSelector(selectDexs);
  const walletData = useSelector(selectMyWallets);
  const coinData = useSelector(selectCoins);

  useEffect(() => {
    if (!bot && !isEdit) {
      visible && form.setFieldsValue({sellType: 'SPAM'});
      return;
    }

    if (!bot) return;

    let formData: any = {
      blockchain: bot.blockchain._id,
      dex: bot.dex._id,
      node: bot.node._id,
      wallet: bot.wallet._id,
      coin: bot.coin._id,
      tokenAddress: isEdit ? bot.token.address : '',
    }

    if ((bot.type === EBotType.BUY || bot.type === EBotType.BUY_SELL) && bot.buy) {
      formData = {
        ...formData,
        buyType: bot.buy.type,
        buyAmount: bot.buy.amount,
        buyGasPrice: bot.buy.gasPrice,
        buyStartDate: {
          buyStartTime: moment(bot.buy.startTime),
        },
        buyPeriod: bot.buy.period,
      };
    }
    
    if ((bot.type === EBotType.SELL || bot.type === EBotType.BUY_SELL) && bot.sell) {
      formData = {
        ...formData,
        sellType: bot.sell.type,
        // sellGasPrice: bot.sell.gasPrice,
        sellItems: bot.sell.type === EBotSellType.TIMER ? bot.sell.items : [],
        spamSellAmount: (bot.sell.items && bot.sell.items.length > 0) ? bot.sell.items[0].amount : 0,
        spamSellDelta: (bot.sell.items && bot.sell.items.length > 0) ? bot.sell.items[0].deltaTime : 0,
      }
    }

    setUseStopLoss(bot.config?.stopLoss ? true : false);
    setUseSavings(bot.config?.savings ? true: false);
    formData = {
      ...formData,
      stopLimit: bot.config ? bot.config.stopLimit : 0,
      saveLimit: bot.config ? bot.config.saveLimit: 0,
      rugpool: bot.config?.rugpool ? true: false,
      antiSell: bot.config?.antiSell ? true: false,
      buyLimitDetected: bot.config?.buyLimitDetected ? true : false,
      sellLimitDetected: bot.config?.sellLimitDetected ? true : false,
      autoBuyAmount: bot.config?.autoBuyAmount ? true : false,
      buyAnyCost: bot.config?.buyAnyCost ? true : false
    }

    form.setFieldsValue(formData);

    let mounted = true;
    isEdit && tokenService.getTokenDetail({
      blockchainId: form.getFieldValue("blockchain"),
      nodeId: form.getFieldValue("node"),
      dexId: form.getFieldValue("dex"),
      tokenAddress: form.getFieldValue("tokenAddress"),
      walletId: form.getFieldValue('wallet'),
      netCoin: true,
      coinAddress: bot.coin.address
    })
    .then(res => {
      if (res && mounted) {
        setTokenInfo(res);
      } else {
        // showNotification("Could not read valid information", "error", "topRight")  
      }
    })
    .catch(err => {
      // showNotification("Could not read valid information", "error", "topRight")
    });

    return () => {
      mounted = false;
    }
  }, [form, bot, isEdit, visible]);

  const handleCancel = () => {
    form.resetFields();
    setVisible(false);
  }

  const nodes = () => {
    let computed = nodeData;
    computed = computed.filter(node => form.getFieldValue('blockchain') === undefined || node.blockchain?._id === form.getFieldValue('blockchain'));
    return computed;
  }

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

  const handleTokenInfo = () => {
    const selectedCoin = coins().find(item => item._id === form.getFieldValue("coin"));
    const payload: ITokenDetailReqDto = {
      blockchainId: form.getFieldValue("blockchain"),
      nodeId: form.getFieldValue("node"),
      dexId: form.getFieldValue("dex"),
      tokenAddress: form.getFieldValue("tokenAddress"),
      walletId: form.getFieldValue('wallet'),
      netCoin: true,
      coinAddress: selectedCoin?.address
    };
    tokenService.getTokenDetail(payload)
    .then(res => {
      if (res) {
        setTokenInfo(res);
      } else {
        showNotification("Could not read valid information", "error", "topRight")  
      }
    })
    .catch(err => {
      showNotification("Could not read valid information", "error", "topRight")
    })
  }

  const onFinish = (values: any) => {
    const temp = {
      blockchain: values.blockchain,
      dex: values.dex,
      node: values.node,
      wallet: values.wallet,
      coin: values.coin,
      tokenAddress: values.tokenAddress,
      type: onlyBuy ? EBotType.BUY : EBotType.BUY_SELL,
      buy: {
        type: values.buyType,
        amount: values.buyAmount,
        gasPrice: values.buyGasPrice,
        startTime: values.buyType === 'SPAM' ? values.buyStartDate.buyStartTime.format('YYYY-MM-DD HH:mm:ss').toString(): new Date(), // Convert to PST time
        period: values.buyType === 'SPAM' ? values.buyPeriod : 1
      },
      sell: !onlyBuy ? {
        type: values.sellType,
        items: values.sellType === 'SPAM' ? [{
          amount: values.spamSellAmount,
          deltaTime: values.spamSellDelta
        }] : values.sellItems ? values.sellItems : [],
        count: values.sellType === 'SPAM' ? 1 : values.sellItems ? values.sellItems.length : 0,
        step: 0,
        interval: 1,
        gasPrice: 5                 // not use
      }: {},
      config: {
        stopLoss: useStopLoss,
        stopLimit: values.stopLimit,
        savings: useSavings,
        saveLimit: values.saveLimit,
        rugpool: values.rugpool,
        antiSell: values.antiSell,
        buyLimitDetected: values.buyLimitDetected,
        sellLimitDetected: values.sellLimitDetected,
        autoBuyAmount: values.autoBuyAmount,
        buyAnyCost: values.buyAnyCost
      }
    };

    if (bot && isEdit) {
      const payload = {
        ...temp,
        _id: bot._id,
      };

      dispatch(updateBot(payload._id, payload));
    } else {
      dispatch(addBot(temp));
    }

    form.resetFields();
    setVisible(false);
  };

  return (
    <Modal
      title={isEdit ? 'Edit Bot' : 'Add Bot'}
      visible={visible}
      width={1600}
      maskClosable={false}
      onOk={handleCancel}
      onCancel={handleCancel}
      footer={[
        <Button key="submit" type="primary" onClick={form.submit}>
          Save
        </Button>,
        <Button key="cancel" onClick={handleCancel}>
          Cancel
        </Button>,
      ]}
      centered
    >
      <Form
        name="editBotForm"
        form={form}
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        initialValues={{ remember: true }}
        onFinish={onFinish}
        autoComplete="off"
        labelAlign='left'
      >
        <Row gutter={20}>
          <Col span={8}>
            <Card
              title={<span className='text-blue-dark'>Main Settings</span>}
              className="w-full h-full border border-solid border-blue-dark"
            >
              <Form.Item
                label="Chain"
                name="blockchain"
                rules={[{ required: true, message: 'Please select a chain!' }]}
              >
                <Select className="w-28">
                  {chainData.map((blockchain, idx) => (
                    <Option key={idx} value={blockchain._id}>{blockchain.name}  <span style={{ color: "#e8962e" }}>[{blockchain.coinSymbol}]</span>  ({blockchain.chainId})</Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                label="Node"
                name="node"
                rules={[{ required: true, message: 'Please select a node!' }]}
              >
                <Select className="w-28">
                  {nodes().map((node, idx) => (
                    <Option key={idx} value={node._id ? node._id : 'unknown'}>{node.name}</Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                label="DEX"
                name="dex"
                rules={[{ required: true, message: 'Please select a dex!' }]}
              >
                <Select className="w-28">
                  {dexes().map((dex, idx) => (
                    <Option key={idx} value={dex._id ? dex._id : 'unknown'}>{dex.name}</Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                label="Wallet"
                name="wallet"
                rules={[{ required: true, message: 'Please select wallet!' }]}
              >
                <Select className="w-28">
                  {walletData.map((wallet, idx) => (
                    <Option key={idx} value={wallet._id}> {wallet.name} </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                label="Base Coin"
                name="coin"
                rules={[{ required: true, message: 'Please enter base coin!' }]}
              >
                <Select className="w-28">
                  {
                    coins().map((item, idx) => <Option value={item._id} key={idx} >{item.name}</Option>)
                  }
                </Select>
              </Form.Item>
              <Form.Item
                label="Token Address"
                name="tokenAddress"
                rules={[{ required: true, message: 'Please type token address!' }]}
              >
                <Input />
              </Form.Item>
              <div className='w-full flex flex-column justify-end'>
                <div className="ant-col-16 mb-2">
                  <Button className='w-full' onClick={handleTokenInfo} >READ</Button>
                </div>
              </div>
              <div className='w-full flex flex-column justify-end'>
                <div 
                  style={{ color: '#90c19a', fontSize: 13, fontWeight: 300 }}
                  className="ant-col-16 border-solid border border-gray-dark mb-5"
                >
                  <div className="border-solid border border-l-0 border-r-0 border-t-0 border-gray-dark p-1.5">
                    <Row gutter={24}>
                      <Col span={8}>Name</Col>
                      <Col className="text-blue-light">{tokenInfo?.token?.name}</Col>
                    </Row>
                  </div>
                  <div className="border-solid border border-l-0 border-r-0 border-t-0 border-gray-dark p-1.5">
                    <Row gutter={24}>
                      <Col span={8}>Symbol</Col>
                      <Col className="text-blue-light">{tokenInfo?.token?.symbol}</Col>
                    </Row>
                  </div>
                  <div className="border-solid border border-l-0 border-r-0 border-t-0 border-gray-dark p-1.5">
                    <Row gutter={24}>
                      <Col span={8}>Digits</Col>
                      <Col className="text-blue-light">{tokenInfo?.token?.decimals}</Col>
                    </Row>
                  </div>
                  <div className="border-solid border border-l-0 border-r-0 border-t-0 border-gray-dark p-1.5">
                    <Row gutter={24}>
                      <Col span={8}>Total Supply</Col>
                      <Col className="text-blue-light">{numberWithCommas(tokenInfo?.token?.totalSupply ? tokenInfo?.token?.totalSupply : 0)}</Col>
                    </Row>
                  </div>
                  <div className="border-solid border border-l-0 border-r-0 border-t-0 border-gray-dark p-1.5">
                    <Row gutter={24}>
                      <Col span={8}>Market Cap</Col>
                      {tokenInfo && <Col className="text-blue-light">---</Col>}
                    </Row>
                  </div>
                  <div className="p-1.5">
                    <Row gutter={24}>
                      <Col span={8}>Liquidity</Col>
                      <Col className="text-blue-light">
                        <div>---</div>
                      </Col>
                    </Row>
                  </div>
                </div>
              </div>
            </Card>
          </Col>
          <Col span={8}>
            <Card
              title={<span className='text-green-dark'>Buying {onlyBuy ? '' : 'And Selling'} Settings</span>}
              className="w-full h-full border border-solid border-green-dark"
            >
              <Form.Item
                label="Buying Type"
                name="buyType"
                initialValue="SPAM"
                rules={[{ required: true, message: 'Please select buy type!' }]}
              >
                <Select className="w-28">
                  <Option value="SPAM">Spam</Option>
                  <Option value="EVENT">Event</Option>
                </Select>
              </Form.Item>

              <Form.Item
                label="Gas [GWEI]"
                name="buyGasPrice"
                initialValue={30}
                rules={[{ required: true, message: 'Please type GWEI!' }]}
              >
                <InputNumber className='w-full' />
              </Form.Item>

              <Form.Item
                label="Amount"
                name="buyAmount"
                rules={[{ required: true, message: 'Please select buy amount!' }]}
              >
                <InputNumber className='w-full' />
              </Form.Item>

              {form.getFieldValue("buyType") === 'SPAM' && (
                <>
                  <Form.Item label="Start Time">
                    <Input.Group compact>
                      <Form.Item
                        name={["buyStartDate", "buyStartTime"]}
                        rules={[{ required: true, message: 'Please select start date!' }]}
                        noStyle
                      >
                        <DatePicker style={{ width: '50%' }} />
                      </Form.Item>
                      <Form.Item
                        name={["buyStartDate", "buyStartTime"]}
                        rules={[{ required: true, message: 'Please select start time!' }]}
                        noStyle
                      >
                        <TimePicker style={{ width: '50%' }} />
                      </Form.Item>
                    </Input.Group>
                  </Form.Item>
                  <Form.Item
                    label="Period[s]"
                    name="buyPeriod"
                    initialValue={600}
                    rules={[{ required: true, message: 'Please type buy period!' }]}
                  >
                    <InputNumber className='w-full' />
                  </Form.Item>
                </>
              )}
              {/* buying end */}

              {!onlyBuy && (
              <>
                <Divider dashed></Divider>
                {/* selling start */}
                <Form.Item
                  label="Selling Type"
                  name="sellType"
                  initialValue="SPAM"
                  rules={[{ required: true, message: 'Please select sell type!' }]}
                >
                  <Select className="w-28" disabled={onlyBuy}>
                    <Option value="SPAM">Spam</Option>
                    <Option value="TIMER">Timer</Option>
                  </Select>
                </Form.Item>

                {form.getFieldValue("sellType") === 'TIMER' && (
                  <Row>
                    <Col span={8} className='text-right pt-1 pr-2'>Triggers :</Col>
                    <Col span={16}>
                      <Form.List name="sellItems">
                        {(fields, { add, remove }) => (
                          <>
                            {fields.map(({ key, name, fieldKey, ...restField }) => (
                              <Space key={key} style={{ display: 'flex' }} align="baseline">
                                <Form.Item
                                  {...restField}
                                  label="Amount[%]"
                                  labelCol={{span: 16}}
                                  name={[name, 'amount']}
                                  fieldKey={[fieldKey, 'amount']}
                                  initialValue={50}
                                  rules={[{ required: true, message: 'Please select sell amount!' }]}
                                >
                                  <InputNumber className='w-full' />
                                </Form.Item>

                                <Form.Item
                                  {...restField}
                                  label="Time[s]"
                                  labelCol={{span: 16}}
                                  name={[name, 'deltaTime']}
                                  fieldKey={[fieldKey, 'deltaTime']}
                                  initialValue={30}
                                  rules={[{ required: true, message: 'Please type sell interval!' }]}
                                >
                                  <InputNumber className='w-full' />
                                </Form.Item>
                                <MinusCircleOutlined onClick={() => remove(name)} />
                              </Space>
                            ))}
                            <Form.Item>
                              <Button type="dashed" onClick={() => add()} block icon={<PlusCircleOutlined />} disabled={onlyBuy} >
                                Add Sell Triggers
                              </Button>
                            </Form.Item>
                          </>
                        )}
                      </Form.List>
                    </Col>
                  </Row>
                )}

                {form.getFieldValue("sellType") === 'SPAM' && (
                  <>
                    <Form.Item
                      label="Amount [%]"
                      name="spamSellAmount"
                      initialValue={100}
                      rules={[{ required: true, message: 'Please type amount!' }]}
                    >
                      <InputNumber className='w-full' disabled={onlyBuy}/>
                    </Form.Item>

                    <Form.Item
                      label="Delta Time"
                      name="spamSellDelta"
                      initialValue={10}
                      rules={[{ required: true, message: 'Please type delta time!' }]}
                    >
                      <InputNumber className='w-full' disabled={onlyBuy}/>
                    </Form.Item>
                  </>
                )}
              </>
              )}
            </Card>
          </Col>

          <Col span={8}>
            <Card
              title={<span className='text-yellow-light'>Auto Feature Settings</span>}
              className="w-full h-full border border-solid border-yellow-light"
            >
              {!onlyBuy &&
                <>
                <div className='flex'>
                  <div className='ant-col-8 text-left mt-1 pr-2'>Stop Loss[%]:</div>
                  <div className='flex ant-col-16'>
                    <Form.Item >
                      <Checkbox 
                        className='mr-3'
                        onChange={(e) => setUseStopLoss(e.target.checked)}
                        checked={useStopLoss}
                      />
                    </Form.Item>
                    <Form.Item
                      name="stopLimit"
                      initialValue={25}
                      // noStyle
                    >
                      {useStopLoss && <InputNumber />}
                    </Form.Item>
                  </div>
                </div>

                <div className='flex'>
                  <div className='ant-col-8 text-left mt-1 pr-2'>Savings[%]:</div>
                  <div className='flex ant-col-16'>
                    <Form.Item >
                      <Checkbox 
                        className='mr-3'
                        onChange={(e) => setUseSavings(e.target.checked)}
                        checked={useSavings}
                      />
                    </Form.Item>
                    <Form.Item
                      name="saveLimit"
                      initialValue={10}
                    >
                      {useSavings && <InputNumber/>}
                    </Form.Item>
                  </div>
                </div>
              </>
              }

              <Form.Item
                label="Rugpool"
                name="rugpool"
                valuePropName="checked"
                initialValue={false}
                hidden={onlyBuy}
              >
                <Checkbox />
              </Form.Item>

              <Form.Item
                label="Anti Sell"
                name="antiSell"
                valuePropName="checked"
                initialValue={false}
                hidden={onlyBuy}
              >
                <Checkbox />
              </Form.Item>

              <Form.Item
                label="Buy Limit Detected"
                name="buyLimitDetected"
                valuePropName="checked"
                initialValue={false}
              >
                <Checkbox />
              </Form.Item>

              <Form.Item
                label="Sell Limit Detected"
                name="sellLimitDetected"
                valuePropName="checked"
                initialValue={false}
                hidden={onlyBuy}
              >
                <Checkbox />
              </Form.Item>

              <Form.Item
                label="Auto Buy Amount"
                name="autoBuyAmount"
                valuePropName="checked"
                initialValue={false}
              >
                <Checkbox />
              </Form.Item>

              <Form.Item
                label="Buy Any Cost"
                name="buyAnyCost"
                valuePropName="checked"
                initialValue={false}
              >
                <Checkbox />
              </Form.Item>
            </Card>
          </Col>
        </Row>
      </Form>
    </Modal>
  )
}
