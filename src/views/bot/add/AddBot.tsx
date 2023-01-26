import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Modal, Form, Input, InputNumber, Button, Checkbox, Select, Row, Col, DatePicker, TimePicker, Space, Card } from 'antd';
import { PlusCircleOutlined, MinusCircleOutlined } from '@ant-design/icons';

import { addBot } from '../../../store/bot/bot.actions';
import { selectNodes, selectDexs, selectBlockchains } from '../../../store/network/network.selectors';
import { selectCoins } from '../../../store/network/network.selectors';
import { selectMyWallets } from '../../../store/wallet/wallet.selectors';
import { EBotType, IBotAddRequest, ITokenDetailDto, ITokenDetailReqDto, ETradingInitiator } from '../../../types';
import { tokenService } from '../../../services';
import { showNotification, numberWithCommas } from "../../../shared/helpers";

export const AddBot = () => {
  const [visible, setVisible] = useState<boolean>(false);
  const [isBuy, setIsBuy] = useState<boolean>(true);
  const [isSell, setIsSell] = useState<boolean>(true);
  const [tokenInfo, setTokenInfo] = useState<ITokenDetailDto | null>(null);

  const dispatch = useDispatch();
  const { Option } = Select;
  const [form] = Form.useForm();
  const chainData = useSelector(selectBlockchains);
  const nodeData = useSelector(selectNodes);
  const dexData = useSelector(selectDexs);
  const walletData = useSelector(selectMyWallets);

  const coinData = useSelector(selectCoins);

  useEffect(() => {
    visible && form.setFieldsValue({sellType: 'SPAM'});
  }, [form, visible]);

  const coins = () => {
    let computed = coinData;
    computed = computed.filter(coin => coin.blockchain?._id === form.getFieldValue('blockchain'));
    return computed;
  };

  const handleCancel = () => {
    form.resetFields();
    setVisible(false);
  }

  const handleChangeBotType = (name: 'BUY' | 'SELL', checked: boolean) => { 
    if (name === 'BUY') {
      if (!checked && !isSell) {
        setIsSell(true);
      }
      setIsBuy(checked);
    } else {
      if (!checked && !isBuy) {
        setIsBuy(true);
      }
      setIsSell(checked)
    }
  }

  const handleTokenInfo = () => {
    const selectedCoin = coins().find(item => item._id === form.getFieldValue("coin"));
    const payload: ITokenDetailReqDto = {
      blockchainId: form.getFieldValue("blockchain"),
      nodeId: form.getFieldValue("node"),
      dexId: form.getFieldValue("dex"),
      tokenAddress: form.getFieldValue("tokenAddress"),
      walletId: form.getFieldValue("wallet"),
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
    const payload: IBotAddRequest = {
      blockchain: values.blockchain,
      dex: values.dex,
      node: values.node,
      wallet: values.wallet,
      coin: values.coin,
      tokenAddress: values.tokenAddress,
      initiator: ETradingInitiator.BOT,
      type: (isBuy && isSell) ? EBotType.BUY_SELL : isBuy ? EBotType.BUY : EBotType.SELL,
      buy: isBuy ? {
        type: values.buyType,
        amount: values.buyAmount,
        gasPrice: values.buyGasPrice,
        startTime: values.buyType === 'SPAM' ? values.buyStartDate.buyStartTime.format('YYYY-MM-DD HH:mm:ss ZZ').toString() : new Date(),
        interval: values.buyType === 'SPAM' ? values.buyInterval : 1,
        period: values.buyType === 'SPAM' ? values.buyPeriod : 1
      } : {},
      sell: isSell ? {
        type: values.sellType,
        items: values.sellType === 'SPAM' ? [{
          amount: values.spamSellAmount,
          deltaTime: values.spamSellDelta
        }] : values.sellItems ? values.sellItems : [],
        count: values.sellType === 'SPAM' ? 1 : values.sellItems ? values.sellItems.length : 0,
        step: 0,
        interval: 1,
        gasPrice: values.sellGasPrice,
        startTime: values.sellDate.sellTime ? values.sellDate.sellTime.format('YYYY-MM-DD HH:mm:ss ZZ').toString() : null
      } : {},
    };

    dispatch(addBot(payload));
    form.resetFields();
    setVisible(false);
  };

  return (
    <Modal
      title="Add New Bot"
      visible={visible}
      width="90%"
      maskClosable={false}
      onOk={handleCancel}
      onCancel={handleCancel}
      footer={[
        <Button key="submit" type="primary" onClick={form.submit}>
          Save
        </Button>,
        <Button key="run" onClick={form.submit}>
          Run
        </Button>,
      ]}
    >
      <Form
        name="addBotForm"
        form={form}
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 18 }}
        initialValues={{ remember: true }}
        onFinish={onFinish}
        autoComplete="off"
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
                  {nodeData.map((node, idx) => (
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
                  {dexData.map((dex, idx) => (
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
                <div className='flex justify-between'>
                  <Input />
                  <Button className='w-15' onClick={handleTokenInfo} >READ</Button>
                </div>
              </Form.Item>
              <div className='w-full flex flex-column justify-end'>
                <div 
                  style={{ color: '#90c19a', fontSize: 13, fontWeight: 300 }}
                  className="ant-col-18 border-solid border border-gray-dark mb-5"
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
              title={<span className='text-green-dark'>Buying Settings</span>}
              className="w-full h-full border border-solid border-green-dark"
              extra={
                <Checkbox 
                  onChange={(e) => handleChangeBotType('BUY', e.target.checked)}
                  checked={isBuy}
                >
                    Active
                </Checkbox>
              }
            >
              <Form.Item
                label="Type"
                name="buyType"
                initialValue="SPAM"
                rules={[{ required: isBuy, message: 'Please select buy type!' }]}
              >
                <Select className="w-28" disabled={!isBuy}>
                  <Option value="SPAM">Spam</Option>
                  <Option value="EVENT">Event</Option>
                </Select>
              </Form.Item>

              <Form.Item
                label="Gas [GWEI]"
                name="buyGasPrice"
                initialValue={30}
                rules={[{ required: isBuy, message: 'Please type GWEI!' }]}
              >
                <InputNumber className='w-full' disabled={!isBuy} />
              </Form.Item>

              <Form.Item
                label="Amount"
                name="buyAmount"
                rules={[{ required: isBuy, message: 'Please select buy amount!' }]}
              >
                <InputNumber className='w-full' disabled={!isBuy} />
              </Form.Item>

              {form.getFieldValue("buyType") === 'SPAM' && (
                <>
                  <Form.Item label="Start Time">
                    <Input.Group compact>
                      <Form.Item
                        name={["buyStartDate", "buyStartTime"]}
                        rules={[{ required: isBuy, message: 'Please select start date!' }]}
                        noStyle
                      >
                        <DatePicker style={{ width: '50%' }} disabled={!isBuy} />
                      </Form.Item>
                      <Form.Item
                        name={["buyStartDate", "buyStartTime"]}
                        rules={[{ required: isBuy, message: 'Please select start time!' }]}
                        noStyle
                      >
                        <TimePicker style={{ width: '50%' }} disabled={!isBuy} />
                      </Form.Item>
                    </Input.Group>
                  </Form.Item>
                  <Form.Item
                    label="Period [s]"
                    name="buyPeriod"
                    initialValue={600}
                    rules={[{ required: isBuy, message: 'Please type buy period!' }]}
                  >
                    <InputNumber className='w-full' disabled={!isBuy} />
                  </Form.Item>
                  <Form.Item
                    label="Interval [s]"
                    name="buyInterval"
                    initialValue={1}
                    rules={[{ required: isBuy, message: 'Please type spam interval!' }]}
                  >
                    <InputNumber className='w-full' disabled={!isBuy} />
                  </Form.Item>
                </>
              )}
            </Card>
          </Col>

          <Col span={8}>
            <Card
              title={<span className='text-yellow-light'>Selling Settings</span>}
              className="w-full h-full border border-solid border-yellow-light"
              extra={
                <Checkbox 
                  onChange={(e) => handleChangeBotType('SELL', e.target.checked)}
                  checked={isSell}
                >
                    Active
                </Checkbox>
              }
            >
              <Form.Item
                label="Type"
                name="sellType"
                initialValue="Spam"
                rules={[{ required: isSell, message: 'Please select sell type!' }]}
              >
                <Select className="w-28" disabled={!isSell}>
                  <Option value="SPAM">Spam</Option>
                  <Option value="TIMER">Timer</Option>
                </Select>
              </Form.Item>

              <Form.Item
                label="Gas [GWEI]"
                name="sellGasPrice"
                initialValue={5}
                rules={[{ required: isSell, message: 'Please type gas price!' }]}
              >
                <InputNumber className='w-full' disabled={!isSell} />
              </Form.Item>

              <Form.Item label="Time">
                <Input.Group compact>
                  <Form.Item
                    name={["sellDate", "sellTime"]}
                    rules={[{ required: false }]}
                    noStyle
                  >
                    <DatePicker style={{ width: '50%' }} disabled={!isSell} />
                  </Form.Item>
                  <Form.Item
                    name={["sellDate", "sellTime"]}
                    rules={[{ required: false }]}
                    noStyle
                  >
                    <TimePicker style={{ width: '50%' }} disabled={!isSell} />
                  </Form.Item>
                </Input.Group>
              </Form.Item>
              
              {form.getFieldValue("sellType") === 'TIMER' && (
                <Row>
                  <Col span={6} className='text-right pt-1 pr-2'>Triggers :</Col>
                  <Col span={18}>
                    <Form.List name="sellItems">
                      {(fields, { add, remove }) => (
                        <>
                          {fields.map(({ key, name, fieldKey, ...restField }) => (
                            <Space key={key} style={{ display: 'flex' }} align="baseline">
                              <Form.Item
                                {...restField}
                                label="Amount(%)"
                                labelCol={{span: 16}}
                                name={[name, 'amount']}
                                fieldKey={[fieldKey, 'amount']}
                                initialValue={50}
                                rules={[{ required: isSell, message: 'Please select sell amount!' }]}
                              >
                                <InputNumber className='w-full' disabled={!isSell} />
                              </Form.Item>

                              <Form.Item
                                {...restField}
                                label="Time[s]"
                                labelCol={{span: 16}}
                                name={[name, 'deltaTime']}
                                fieldKey={[fieldKey, 'deltaTime']}
                                initialValue={30}
                                rules={[{ required: isSell, message: 'Please type sell interval!' }]}
                              >
                                <InputNumber className='w-full' disabled={!isSell} />
                              </Form.Item>
                              <MinusCircleOutlined onClick={() => remove(name)} disabled={!isSell} />
                            </Space>
                          ))}
                          <Form.Item>
                            <Button type="dashed" onClick={() => add()} block icon={<PlusCircleOutlined />} disabled={!isSell}>
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
                    label="Amount (%)"
                    name="spamSellAmount"
                    initialValue={100}
                    rules={[{ required: isSell, message: 'Please type amount!' }]}
                  >
                    <InputNumber className='w-full' disabled={!isSell} />
                  </Form.Item>

                  <Form.Item
                    label="Delta Time"
                    name="spamSellDelta"
                    initialValue={10}
                    rules={[{ required: isSell, message: 'Please type delta time!' }]}
                  >
                    <InputNumber className='w-full' disabled={!isSell} />
                  </Form.Item>
                </>
              )}

              <Form.Item
                label="Schedule"
                name="sellScheduleCheck"
                valuePropName="sellScheduleCheck"
              >
                <Checkbox disabled></Checkbox>
              </Form.Item>

              <Form.Item
                label="Schedule"
                name="sellScheduleAmount"
                initialValue={4}
                rules={[{ required: true, message: 'Please type sell amount!' }]}
              >
                <InputNumber
                  className='w-full'
                  disabled
                />
              </Form.Item>

              <Form.Item
                label="Stop Loss [%]"
                name="stopLoss"
                initialValue={25}
                rules={[{ required: true, message: 'Please type stop loss!' }]}
              >
                <InputNumber
                  className='w-full'
                  disabled
                />
              </Form.Item>
            </Card>
          </Col>
        </Row>
      </Form>
    </Modal>
  )
}
