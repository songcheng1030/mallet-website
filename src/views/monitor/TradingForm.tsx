import { useState, useMemo, useEffect } from 'react';
import { Form, Input, InputNumber, Button, Select } from 'antd';
import { useSelector, useDispatch } from 'react-redux';

import { addBot } from '../../store/manualBot/manualBot.actions';
import { selectNodes, selectDexs, selectBlockchains, selectCoins } from '../../store/network/network.selectors';
import { selectMyWallets } from '../../store/wallet/wallet.selectors';
import { ETradingInitiator, EBotType, EBotBuyType, EBotSellType, IBot } from '../../types';

interface Props {
  bot?: IBot
}

const TradingForm = (props: Props) => {
  const [isBuy, setIsBuy] = useState<boolean>(true);
  const [mode, setMode] = useState<string>('');
  const [selectedChain, setSelectedChain] = useState<string>('');

  const { bot } = props;
  const [form] = Form.useForm();
  const { Option } = Select;
  const dispatch = useDispatch();

  useEffect(() => {
    if (bot) {
      const formData = {
        blockchain: bot.blockchain._id,
        dex: bot.dex._id,
        node: bot.node._id,
        wallet: bot.wallet._id,
        coin: bot.coin._id,
        tokenAddress: bot.token.address,
        gasPrice: bot.type === EBotType.BUY ? bot.buy?.gasPrice : bot.sell?.gasPrice,
        amount: bot.type === EBotType.BUY ? bot.buy?.amount : bot.sell?.amount,
      };

      form.setFieldsValue(formData);
    }
  }, [bot, form]);

  const chainData = useSelector(selectBlockchains);
  const nodeData = useSelector(selectNodes);
  const dexData = useSelector(selectDexs);
  const walletData = useSelector(selectMyWallets);
  const coinData = useSelector(selectCoins);

  const coins  = useMemo(() => {
    let computed = coinData;
    computed = computed.filter(coin => coin.blockchain?._id === selectedChain);
    return computed;
  }, [selectedChain, coinData]);

  const onFinish = (values: any) => {
    const payload = {
      blockchain: values.blockchain,
      dex: values.dex,
      node: values.node,
      wallet: values.wallet,
      coin: values.coin,
      tokenAddress: values.tokenAddress,
      initiator: ETradingInitiator.DIRECT,
      type: isBuy ? EBotType.BUY : EBotType.SELL,
      buy: isBuy ? {
        type: mode === 'once' ? EBotBuyType.ONCE : EBotBuyType.SPAM,
        amount: values.amount,
        gasPrice: values.gasPrice,
      } : {},
      sell: !isBuy ? {
        type: mode === 'once' ? EBotSellType.ONCE : EBotSellType.SPAM,
        gasPrice: values.gasPrice,
        items: [{
          amount: values.amount,
          deltaTime: 0
        }]
      } : {},
    };

    dispatch(addBot(payload));
  }

  const handleBuy = (md: string) => {
    setIsBuy(true);
    setMode(md);
    form.submit();
  }

  const handleSell = (md: string) => {
    setIsBuy(false);
    setMode(md);
    form.submit();
  }

  const handleChain = (value: string) => {
    setSelectedChain(value);
  }

  return (
    <div className='px-5 pt-5 pb-2 mb-3 ml-2 bg-gray-darkest rounded-md' style={{width: 450}}>
      <Form
        name="manualBotForm"
        form={form}
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        labelAlign="left"
        onFinish={onFinish}
        autoComplete="off"
      >
        <Form.Item
          label="Chain"
          name="blockchain"
          rules={[{ required: true, message: 'Please select a chain!' }]}
        >
          <Select className="w-28" onChange={handleChain}>
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
              coins.map((item, idx) => <Option value={item._id} key={idx} >{item.name}</Option>)
            }
          </Select>
        </Form.Item>
        <Form.Item
          label="Token"
          name="tokenAddress"
          rules={[{ required: true, message: 'Please type token address!' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Gas [GWEI]"
          name="gasPrice"
          rules={[{ required: true, message: 'Please type GWEI!' }]}
        >
          <InputNumber className='w-full' />
        </Form.Item>

        <Form.Item
          label={
            <div>Amount
              {/* <Tooltip placement="left" title="">
                <QuestionCircleOutlined />
              </Tooltip> */}
            </div>
          }
          name="amount"
          rules={[{ required: true, message: 'Please select buy amount!' }]}
        >
          <InputNumber className='w-full' />
        </Form.Item>
      </Form>

      <div className='flex justify-between mt-6'>
        <Button 
          type="primary" 
          shape='round'
          className='w-32 mr-2'
          onClick={()=>handleBuy('once')}
          danger
        >
          Buy (once)
        </Button>
        <Button 
          type="primary" 
          shape='round'
          className='w-32 mr-2'
          onClick={()=>handleSell('once')}
        >
          Sell (once)
        </Button>
      </div>

      <div className='flex justify-between mt-2'>
        <Button 
          type="primary" 
          shape='round'
          className='w-32 mr-2'
          onClick={()=>handleBuy('spam')}
          danger
        >
          Buy (spam)
        </Button>
        <Button 
          type="primary" 
          shape='round'
          className='w-32 mr-2'
          onClick={()=>handleSell('spam')}
        >
          Sell (spam)
        </Button>
      </div>
    </div>
  )
}

export default TradingForm;
