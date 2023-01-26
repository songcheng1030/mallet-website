import { useEffect, useState } from 'react';
import { Modal, Form, Input, InputNumber, Row, Col, Select } from 'antd';
import { IBlockchain, IBlockchainPostRequest } from '../../../types';
import { useDispatch, useSelector } from 'react-redux';
import { updateBlockchain } from '../../../store/network/network.action';
import { selectNodes } from '../../../store/network/network.selectors';

interface FormData {
  name: string;
  chainId: number;
  coinSymbol: string;
  node?: string;
  explorer?: string;
  amountForFee?: number;
  gasPrice?: number;
}

interface Props {
  blockchain: IBlockchain,
  visible: boolean,
  setVisible: (visible: boolean) => void,
}

export const EditBlockchain = (props: Props) => {
  const {blockchain, visible, setVisible} = props;
  const dispatch = useDispatch();
  const [confirmLoading, setConfirmLoading] = useState<boolean>(false);
  const [form] = Form.useForm();
  const { Option } = Select;
  const nodeData = useSelector(selectNodes);

  useEffect(() => {
    if (form && blockchain && visible) {
      const formData = {
        ...blockchain,
        node: blockchain.node?._id,
      };
      form.setFieldsValue(formData);
    }
  }, [form, blockchain, visible]);

  const handleCancel = () => {
    setVisible(false);
  }

  const handleUpdateBlockchain = (formdata: FormData) => {
    let payload: IBlockchainPostRequest = {
      _id: blockchain._id,
      name: formdata.name,
      chainId: formdata.chainId,
      coinSymbol: formdata.coinSymbol,
      node: formdata.node,
      explorer: formdata.explorer,
      gasPrice: blockchain.gasPrice,
      amountForFee: formdata.amountForFee,
    };

    setConfirmLoading(true);
    dispatch(updateBlockchain({...payload, _id: blockchain._id}));
    setConfirmLoading(false);
    setVisible(false);
  }

  return (
    <>
      <Modal
        title="Edit Chain"
        visible={visible}
        onOk={form.submit}
        confirmLoading={confirmLoading}
        onCancel={handleCancel}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdateBlockchain}
          autoComplete="off"
        >
          <Form.Item
            label="Chain Name"
            name="name"            
            rules={[{ required: true, message: 'Please enter chain name!' }]}
          >
            <Input />
          </Form.Item>
          <Row>
            <Col span={8}>
              <Form.Item
                label="Chain ID"
                name="chainId"
                rules={[{ required: true, message: 'Please enter chain id!' }]}
              >
                <InputNumber />
              </Form.Item>
            </Col>
            <Col>
              <Form.Item
                label="Coin Symbol"
                name="coinSymbol"
                rules={[{ required: true, message: 'Please enter Coin Symbol!' }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            label="Explorer"
            name="explorer"
            rules={[{ required: false }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="AmountForFee"
            name="amountForFee"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Default Node"
            name="node"
          >
            <Select placeholder='Select Node' allowClear>
              {nodeData.map((node, idx) => (
                <Option key={idx} value={node._id ? node._id : 'unknown' }>{node.name}</Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}