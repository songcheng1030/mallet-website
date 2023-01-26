import { useState, useEffect } from 'react';
import { Modal, Form, InputNumber, Select, Spin } from 'antd';
import { useDispatch, useSelector } from "react-redux";
import Web3 from 'web3';

import { addBot } from '../../../store/pool/pool.actions';
import { selectMyWallets } from "../../../store/wallet/wallet.selectors";
import { selectCoins } from '../../../store/network/network.selectors';
import { selectNodes } from '../../../store/network/network.selectors';
import { IPool, IAutoBotAddRequest, ERunningStatus } from '../../../types';
import { showNotification } from "../../../shared/helpers";
const erc20ABI = require("shared/erc20.json");

interface Props {
  pool: IPool,
  visible: boolean;
  setVisible: (visible: boolean) => void;
}

export const AutoBot = (props: Props) => {
  const dispatch = useDispatch();
  const {pool, visible, setVisible} = props;
  const walletData = useSelector(selectMyWallets);
  const coinData = useSelector(selectCoins);
  const nodeData = useSelector(selectNodes);
  const [form] = Form.useForm();
  const { Option } = Select;

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [balance, setBalance] = useState<number>(0);

  useEffect(() => {
    let amount = Math.min(balance, pool.amount1 / 10**18);
    amount = Math.ceil(amount * 100) / 100;
    form.setFieldsValue({buyAmount: amount})
  }, [pool, form, balance]);

  const getTokenBalance = async (rpcUrl: string, tokenAddress: string, walletAddress: string) => {
    const web3Client = new Web3(rpcUrl);
    const tokenErc20Contract = new web3Client.eth.Contract(erc20ABI, tokenAddress)
    const balance = await tokenErc20Contract.methods.balanceOf(walletAddress).call();
    return balance;
  }

  const handleClose = () => {
    setBalance(0);
    form.resetFields();
    setVisible(false);
  }

  const handleWallet = (walletId: string) => {
    const wallet = walletData.find(el => el._id === walletId);
    const node = nodeData.find(el => el._id === String(pool.blockchain.node));
    if (wallet && node) {
      getTokenBalance(node.rpcProviderURL, pool.token1.address, wallet.publicKey)
      .then(res => {
        setBalance(res / 10 ** 18);
      })
    }
  }

  const onFinish = async (values: any) => {
    const coin = coinData.find(el => el.address === pool.token1.address);
    if (!coin) {
      showNotification("Unregistered coin!", 'error');
      return;
    }

    const payload: IAutoBotAddRequest = {
      blockchain: pool?.blockchain._id,
      dex: pool.dex._id,
      node: String(pool.blockchain.node),
      mainWallet: values.wallet,
      coin: coin?._id,
      tokenAddress: pool.token2.address,
      buyAmount: values.buyAmount,
      pool: pool._id,
      state: {
        active: false,
        status: ERunningStatus.DRAFT
      }
    };

    setIsLoading(true);
    await dispatch(addBot(payload));
    setIsLoading(false);
    
    handleClose();
  }
  
  return (
    <Modal
        title="Add Bot"
        visible={visible}
        onOk={form.submit}
        onCancel={handleClose}
    >
      {!isLoading && (
        <Form
          name="autoBotForm"
          form={form}
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 18 }}
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            label="Wallet"
            name="wallet"
            rules={[{ required: true, message: 'Please select wallet!' }]}
          >
            <Select className="w-28" onChange={handleWallet}>
              {walletData.map((wallet, idx) => (
                <Option key={idx} value={wallet._id}> {wallet.name} </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Amount"
            name="buyAmount"
            rules={[{ required: true, message: 'Please enter buy amount!' }]}
          >
            <InputNumber className='w-full' />
          </Form.Item>
        </Form>
      )}
      {isLoading && (
        <Spin />
      )}        
    </Modal>
  )
}
