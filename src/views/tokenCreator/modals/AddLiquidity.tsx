import { useEffect, useMemo, useState } from 'react';
import { Modal, Form, Input, Select, Switch, Button, Divider } from 'antd';
import { useSelector } from 'react-redux';
import Web3 from "web3";
import { selectDexs, selectCoins } from '../../../store/network/network.selectors';
import { formattedNumber, formattedNumberWithoutZeroDecimal } from "shared";
import BigNumber from 'bignumber.js';
import { tokenService } from 'services';
import { selectTokenCreators } from 'store/tokenCreator/tokenCreator.selectors';
import { ITokenCreator } from 'types';
const erc20ABI = require("shared/erc20.json");
const uniswapV2FactoryABI = require("shared/uniswapV2Factory.json");
const uniswapV2PairABI = require("shared/uniswapV2Pair.json")
interface Props {
  visible: boolean,
  setVisible: (visible: boolean) => void,
  // blockchainId?: string;
  // rpcurl: string | undefined;
  // tokenAddress: string | undefined;
  // walletAddress: string | undefined;
  // explorer: string | undefined;
  botId: string;
}

export const AddLiquidity = (props: Props) => {
  const { visible, setVisible, botId } = props;
  // const dispatch = useDispatch();
  const dexData = useSelector(selectDexs);
  const coinData = useSelector(selectCoins);
  const [form] = Form.useForm();
  const { Option } = Select;
  const tokenCreators = useSelector(selectTokenCreators);

  const [creatorBot, setCreatorBot] = useState<ITokenCreator>();
  const [liquidity, setLiquidity] = useState<string>("0x0000000000000000000000000000000000000000");
  const [lpAmount, setLPAmount] = useState<BigNumber>(new BigNumber(0));
  const [totalLPAmount, setTotalLPAmount] = useState<BigNumber>(new BigNumber(0));
  const [coinBalanceOfPool, setCoinBalanceOfPool] = useState<BigNumber>(new BigNumber(0));
  const [tokenBalanceOfPool, setTokenBalanceOfPool] = useState<BigNumber>(new BigNumber(0));

  const [selectedDEX, setSelectedDEX] = useState<string>("");
  const [selectedBaseCoin, setSelectedBaseCoin] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [coinBalance, setCoinBalance] = useState<BigNumber>(new BigNumber(0));
  const [tokenBalance, setTokenBalance] = useState<BigNumber>(new BigNumber(0));
  const [coinSymbol, setCoinSymbol] = useState<string>("");
  const [tokenSymbol, setTokenSymbol] = useState<string>("");
  const [coinDecimals, setCoinDecimals] = useState<number>(18);
  const [tokenDecimals, setTokenDecimals] = useState<number>(18);
  const [rate, setRate] = useState<BigNumber>(new BigNumber(0));
  const [inputRemoveLP, setInputRemoveLP] = useState<number>(0);

  useEffect(() => {
    if (botId) {
      const creator = tokenCreators.find(el => el._id === botId);
      setCreatorBot(creator);
    }
  }, [botId, tokenCreators]);

  const getCoinBalance = async (coinAddress: string) => {
    if (!creatorBot) { return; }
    if (creatorBot.node.rpcProviderURL && coinAddress && creatorBot.wallet.publicKey) {
      const web3Client = new Web3(creatorBot.node.rpcProviderURL);
      const coinContract = new web3Client.eth.Contract(erc20ABI, coinAddress);
      const balance = await coinContract.methods.balanceOf(creatorBot.wallet.publicKey).call();
      const symbol = await coinContract.methods.symbol().call();
      const decimals = await coinContract.methods.decimals().call();
      setCoinDecimals(decimals);
      setCoinBalance(new BigNumber(balance).shiftedBy(-decimals));
      setCoinSymbol(symbol);
    }
  }

  const getTokenBalance = async () => {
    if (!creatorBot) { return; }

    if (creatorBot.node.rpcProviderURL && creatorBot.token?.address && creatorBot.wallet.publicKey) {
      const web3Client = new Web3(creatorBot.node.rpcProviderURL);
      const tokenContract = new web3Client.eth.Contract(erc20ABI, creatorBot.token.address);
      const balance = await tokenContract.methods.balanceOf(creatorBot.wallet.publicKey).call();
      const symbol = await tokenContract.methods.symbol().call();
      const decimals = await tokenContract.methods.decimals().call();
      setTokenDecimals(Number(decimals));
      setTokenSymbol(symbol);
      setTokenBalance(new BigNumber(balance).shiftedBy(-Number(decimals)));
      console.log("----------->", balance, symbol, decimals);
    }
  }
  useEffect(() => {
    getTokenBalance();
  }, [creatorBot?.token?.address]);

  useEffect(() => {
    form.setFieldsValue({ addOrRemove: true });
    console.log("changed");
  }, [form]);

  const dexes = useMemo(() => {
    let computed = dexData;
    computed = computed.filter(dex => creatorBot?.blockchain._id === undefined || dex.blockchain?._id === creatorBot.blockchain._id);
    return computed;
  }, [dexData, creatorBot?.blockchain._id]);

  const coins = useMemo(() => {
    let computed = coinData;
    computed = computed.filter(coin => creatorBot?.blockchain._id === undefined || coin.blockchain?._id === creatorBot?.blockchain._id);
    return computed;
  }, [coinData, creatorBot?.blockchain._id]);

  const onFinish = (values: any) => {
    const selectedCoinInfo = coinData.filter(coin => coin._id === selectedBaseCoin);
    let payload: any = {
      baseCoinAddress: selectedCoinInfo[0].address,
      creatorId: creatorBot?._id,
      dexId: values.dex,
    };
    // console.log(values.addOrRemove);
    // return;

    setIsLoading(true);
    if (values.addOrRemove || values.addOrRemove === undefined) {
      payload = {
        ...payload,
        tokenAmount: new BigNumber(values.inTokenAmount).shiftedBy(Number(tokenDecimals)).toFixed(0),
        baseCoinAmount: new BigNumber(values.inCoinAmount).shiftedBy(Number(coinDecimals)).toFixed(0)
      };

      tokenService.addLP(payload)
        .then(res => console.log("add lp res", res))
        .catch(err => console.log(err));
    } else {
      payload = {
        ...payload,
        lpAddress: liquidity,
        lpAmount: new BigNumber(lpAmount).multipliedBy(Number(values.inLPAmount)).shiftedBy(16).toFixed(0)
      };

      tokenService.removeLP(payload)
        .then(res => console.log("add lp res", res))
        .catch(err => console.log(err));
    }

    setTimeout(() => {
      form.resetFields();
      setIsLoading(false);
      setVisible(false);
    }, 2000);
  };

  const handleCancel = () => {
    setVisible(false);
  }

  const handleDEXChange = (value: any) => {
    setSelectedDEX(value)
  }
  const handleBaseCoinChange = (value: any) => {
    setSelectedBaseCoin(value);
  }

  const getLiquidity = async (factoryAddress: string, coinAddress: string) => {
    try {
      if (creatorBot?.node.rpcProviderURL && creatorBot.token?.address && creatorBot.wallet.publicKey) {
        const web3Client = new Web3(creatorBot.node.rpcProviderURL);
        const factoryContract = new web3Client.eth.Contract(uniswapV2FactoryABI, factoryAddress);
        const pairContractAddress = await factoryContract.methods.getPair(
          coinAddress,
          creatorBot.token.address
        ).call();
        setLiquidity(pairContractAddress);
        if (pairContractAddress !== "0x0000000000000000000000000000000000000000") {
          const pairContract = new web3Client.eth.Contract(uniswapV2PairABI, pairContractAddress);
          const _totalLPAmount = await pairContract.methods.totalSupply().call();
          const balance = await pairContract.methods.balanceOf(creatorBot.wallet.publicKey).call();
          const res = await pairContract.methods.getReserves().call();

          const _rate = Number(coinAddress) < Number(creatorBot.token.address) ? new BigNumber(res[1]).dividedBy(res[0]) : new BigNumber(res[0]).dividedBy(res[1]);
          setRate(_rate);
          setTotalLPAmount(new BigNumber(_totalLPAmount).shiftedBy(-18))
          setLPAmount(new BigNumber(balance).shiftedBy(-18));

          const coinContract = new web3Client.eth.Contract(erc20ABI, coinAddress);
          const _coinBalanceOfPool = await coinContract.methods.balanceOf(pairContractAddress).call();
          console.log("///-------------->", _coinBalanceOfPool);
          const _coinDecimals = await coinContract.methods.decimals().call();
          setCoinBalanceOfPool(new BigNumber(_coinBalanceOfPool).shiftedBy(-Number(_coinDecimals)))

          const tokenContract = new web3Client.eth.Contract(erc20ABI, creatorBot.token.address);
          const _tokenBalanceOfPool = await tokenContract.methods.balanceOf(pairContractAddress).call();
          const _tokendecimals = await tokenContract.methods.decimals().call();
          setTokenBalanceOfPool(new BigNumber(_tokenBalanceOfPool).shiftedBy(-Number(_tokendecimals)));
          console.log("///======>", _tokenBalanceOfPool);


        }
      }
    } catch (e) {
      console.log(e);
    }
  }
  useEffect(() => {
    if (selectedDEX && selectedBaseCoin) {
      const selectedDEXInfo = dexData.filter(dex => dex._id === selectedDEX);
      const selectedCoinInfo = coinData.filter(coin => coin._id === selectedBaseCoin);
      getLiquidity(selectedDEXInfo[0].factoryAddress, selectedCoinInfo[0].address)
      getCoinBalance(selectedCoinInfo[0].address);
    }
  }, [selectedDEX, selectedBaseCoin]);

  const handleInCoinAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value || '0';
    if (rate.isGreaterThan(0)) {
      form.setFieldsValue({ 'inTokenAmount': new BigNumber(rate.shiftedBy(Number(tokenDecimals)).multipliedBy(value).toFixed(0)).shiftedBy(-Number(tokenDecimals)).toString() })
      form.validateFields(['inTokenAmount']);
    }
  }

  const handleInTokenAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value || '0';
    if (rate.isGreaterThan(0)) {
      form.setFieldsValue({ 'inCoinAmount': new BigNumber(new BigNumber(value).shiftedBy(Number(coinDecimals)).dividedBy(rate).toFixed(0)).shiftedBy(-Number(coinDecimals)).toString() })
      form.validateFields(['inCoinAmount']);
    }
  }
  const handleSetMaxInCoinAmount = () => {
    let value = coinBalance;
    form.setFieldsValue({ 'inCoinAmount': value.toString() });
    if (rate.isGreaterThan(0)) {
      form.setFieldsValue({ 'inTokenAmount': new BigNumber(rate.shiftedBy(Number(tokenDecimals)).multipliedBy(value).toFixed(0)).shiftedBy(-Number(tokenDecimals)).toString() })
      form.validateFields(['inTokenAmount']);
    }
  }
  const handleSetMaxInTokenAmount = () => {
    let value = tokenBalance;
    form.setFieldsValue({ 'inTokenAmount': value.toString() });
    if (rate.isGreaterThan(0)) {
      form.setFieldsValue({ 'inCoinAmount': new BigNumber(value.shiftedBy(Number(coinDecimals)).dividedBy(rate).toFixed(0)).shiftedBy(-Number(coinDecimals)) })
      form.validateFields(['inCoinAmount']);
    }
  }

  const handleSetMaxLPAmount = () => {
    form.setFieldsValue({ 'inLPAmount': 100 });
  }

  const handleChangeInputLP = (e: any) => {
    let x = Number(e.target.value);
    if (x > 100) x = 100;
    if (x < 0) x = 0;
    setInputRemoveLP(x);
  }
  return (
    <Modal
      title="Liquidity"
      visible={visible}
      onOk={form.submit}
      onCancel={handleCancel}
      okText="Ok"
      width={625}
      confirmLoading={isLoading}
    >
      <Form
        form={form}
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        labelAlign='left'
        onFinish={onFinish}
      >
        <Form.Item
          label="DEX"
          name="dex"
          rules={[{ required: true, message: 'Please select a dex!' }]}
        >
          <Select className="w-28" onChange={handleDEXChange}>
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
          <Select className="w-28" onChange={handleBaseCoinChange}>
            {coins.map((coin, idx) => (
              <Option key={idx} value={coin._id ? coin._id : 'unknown'}>{coin.name}</Option>
            ))}
          </Select>
        </Form.Item>

        {selectedBaseCoin && <><div className="w-full p-3 text-sm border-solid border border-gray-dark mb-5">
          <div className='flex justify-between'>
            <div>Pair</div>
            <div className='text-blue'>{liquidity === "0x0000000000000000000000000000000000000000" ? "---" : <a
              href={`${creatorBot?.blockchain.explorer}/address/${liquidity}`}
              target="_blank"
              rel="noreferrer"
            >
              {liquidity}
            </a>
            }
            </div>
          </div>
          <Divider orientation="left" plain>Total LP Amount</Divider>
          {liquidity !== "0x0000000000000000000000000000000000000000" && coinBalanceOfPool.isGreaterThan(0) && coinDecimals && <div className='flex justify-between'>
            <div>{coinSymbol || ''}</div>
            <div className='text-green'>{formattedNumberWithoutZeroDecimal(coinBalanceOfPool.toNumber(), coinDecimals)}</div>
          </div>}
          {liquidity !== "0x0000000000000000000000000000000000000000" && tokenBalanceOfPool.isGreaterThan(0) && tokenDecimals && <div className='flex justify-between'>
            <div>{tokenSymbol || ''}</div>
            <div className='text-green'>{formattedNumberWithoutZeroDecimal(tokenBalanceOfPool.toNumber(), tokenDecimals)}</div>
          </div>}
          {/* ----Pooled----- */}
          <Divider orientation="left" plain>Added LP Amount</Divider>
          {liquidity !== "0x0000000000000000000000000000000000000000" && coinBalanceOfPool.isGreaterThan(0) && totalLPAmount.isGreaterThan(0) && <div className='flex justify-between'>
            <div>{coinSymbol || ''}</div>
            <div className='text-green'>{formattedNumberWithoutZeroDecimal(lpAmount.multipliedBy(coinBalanceOfPool).dividedBy(totalLPAmount).toNumber(), coinDecimals)}</div>
          </div>}
          {liquidity !== "0x0000000000000000000000000000000000000000" && tokenBalanceOfPool.isGreaterThan(0) && totalLPAmount.isGreaterThan(0) && <div className='flex justify-between'>
            <div>{tokenSymbol || ''}</div>
            <div className='text-green'>{formattedNumberWithoutZeroDecimal(lpAmount.multipliedBy(tokenBalanceOfPool).dividedBy(totalLPAmount).toNumber(), tokenDecimals)}</div>
          </div>}
          <Divider orientation="left" plain>Wallet</Divider>
          {coinSymbol && coinDecimals && <><div className='flex justify-between'>
            <div>{coinSymbol}</div>
            <div className='text-green'>{formattedNumberWithoutZeroDecimal(coinBalance.toNumber(), coinDecimals)}</div>
          </div></>}
          {tokenSymbol && tokenDecimals && <><div className='flex justify-between'>
            <div>{tokenSymbol}</div>
            <div className='text-green'>{formattedNumberWithoutZeroDecimal(tokenBalance.toNumber(), tokenDecimals)}</div>
          </div></>}
        </div>

          {lpAmount.isGreaterThan(0) && <Form.Item
            label="Add or Remove"
            name="addOrRemove"
            valuePropName="checked"
            rules={[{ required: true }]}
          >
            <Switch checkedChildren="Add" unCheckedChildren="Remove" defaultChecked />
          </Form.Item>}

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => prevValues.addOrRemove !== currentValues.addOrRemove}
          >
            {({ getFieldValue }) =>
              (getFieldValue('addOrRemove') === true || lpAmount.isZero()) ? (
                <Form.Item label="Base Coin Amount">
                  <Form.Item
                    name="inCoinAmount"
                    noStyle
                    rules={[{ required: true, message: 'Please input Base coin amount!' },
                    {
                      validator: async (_, inCoinAmount) => {
                        if (new BigNumber(inCoinAmount).isGreaterThan(coinBalance)) {
                          return Promise.reject(new Error('Overflow of Balance...'))
                        }
                      }
                    }
                    ]}
                  >
                    <Input
                      type={'number'}
                      className='w-80'
                      placeholder='0'
                      suffix={coinSymbol}
                      onChange={handleInCoinAmount}
                    />
                  </Form.Item>
                  <Button className='ml-1' onClick={handleSetMaxInCoinAmount}>Max</Button>
                </Form.Item>
              ) : null
            }
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => prevValues.addOrRemove !== currentValues.addOrRemove}
          >
            {({ getFieldValue }) =>
              (getFieldValue('addOrRemove') === true || lpAmount.isZero()) ? (
                <Form.Item label="Token Amount">
                  <Form.Item
                    name="inTokenAmount"
                    noStyle
                    rules={[
                      { required: true, message: 'Please input token amount!' },
                      {
                        validator: async (_, inTokenAmount) => {
                          if (new BigNumber(inTokenAmount).isGreaterThan(tokenBalance)) {
                            return Promise.reject(new Error('Overflow of Balance...'))
                          }
                        }
                      }
                    ]}
                  >
                    <Input
                      type={'number'}
                      className='w-80'
                      placeholder='0'
                      suffix={tokenSymbol}
                      onChange={handleInTokenAmount}
                    />
                  </Form.Item>
                  <Button className='ml-1' onClick={handleSetMaxInTokenAmount}>Max</Button>
                </Form.Item>
              ) : null
            }
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => prevValues.addOrRemove !== currentValues.addOrRemove}
          >
            {({ getFieldValue }) =>
              getFieldValue('addOrRemove') === false ? (<>
                <Form.Item label="LP Amount">
                  <Form.Item
                    name="inLPAmount"
                    noStyle
                    rules={[{ required: true, message: 'Please input LP amount!' },
                    {
                      validator: async (_, inLPAmount) => {
                        if (new BigNumber(inLPAmount).isGreaterThan(100)) {
                          return Promise.reject(new Error('Overflow of Balance...'))
                        } else if (new BigNumber(inLPAmount).isLessThanOrEqualTo(0)) {
                          return Promise.reject(new Error('Must be greater than 0'))
                        }
                      }
                    }]}
                  >
                    <Input
                      type={'number'}
                      className='w-80'
                      suffix="%"
                      placeholder='0'
                      onChange={handleChangeInputLP}
                    />
                  </Form.Item>
                  <Button className='ml-1' onClick={handleSetMaxLPAmount}>Max</Button>
                </Form.Item>
                <div className='flex justify-between'>
                  <div>{coinSymbol || ''}</div>
                  <div className='text-green'>{
                    formattedNumberWithoutZeroDecimal(lpAmount.multipliedBy(coinBalanceOfPool).multipliedBy(inputRemoveLP / 100).dividedBy(totalLPAmount).toNumber(), coinDecimals)}</div>
                </div>
                <div className='flex justify-between'>
                  <div>{tokenSymbol || ''}</div>
                  <div className='text-green'>{
                    formattedNumberWithoutZeroDecimal(lpAmount.multipliedBy(tokenBalanceOfPool).multipliedBy(inputRemoveLP / 100).dividedBy(totalLPAmount).toNumber(), tokenDecimals)}</div>
                </div>
              </>
              ) : null
            }
          </Form.Item></>}

      </Form>
    </Modal>
  );
};
