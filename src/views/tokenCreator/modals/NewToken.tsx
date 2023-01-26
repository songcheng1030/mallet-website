import { useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Select } from 'antd';
import { useDispatch, useSelector } from 'react-redux';

import { selectBlockchains } from '../../../store/network/network.selectors';
import { selectMyWallets } from '../../../store/wallet/wallet.selectors';
import { addTokenCreator } from 'store/tokenCreator/tokenCreator.actions';
import { ITokenCreateRequest } from 'types';

interface Props {
  visible: boolean,
  setVisible: (visible: boolean) => void,
}

export const NewToken = (props: Props) => {
  const { visible, setVisible } = props;
  const dispatch = useDispatch();
  const chainData = useSelector(selectBlockchains);
  const walletData = useSelector(selectMyWallets);
  
  const [form] = Form.useForm();
  const { Option } = Select;

  useEffect(() => {
  }, [form]);

  const onFinish = (values: any) => {
    const blockchain = chainData.find(chain => chain._id === values.blockchain);
    const temp: ITokenCreateRequest = {
      blockchain: values.blockchain,
      node: blockchain?.node?._id,
      wallet: values.wallet,
      name: values.name,
      symbol: values.symbol,
      decimals: values.decimals,
      maxSupply: values.maxSupply
    };

    dispatch(addTokenCreator(temp));
    form.resetFields();
    setVisible(false);
  };

  const handleCancel = () => {
    setVisible(false);
  }

  return (
    <Modal
      title="Create New Token"
      visible={visible}
      onOk={form.submit}
      onCancel={handleCancel}
      okText="Create"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
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
          label="Symbol"
          name="symbol"
          rules={[{ required: true, message: 'Please input symbol!' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Name"
          name="name"
          rules={[{ required: true, message: 'Please input name!' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Decimals"
          name="decimals"
          rules={[{ required: true, message: 'Please input decimals!' }]}
        >
          <InputNumber
            className='w-full'
            min={0}
          />
        </Form.Item>

        <Form.Item
          label="Max Supply"
          name="maxSupply"
          rules={[{ required: true, message: 'Please input max supply!' }]}
        >
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};
