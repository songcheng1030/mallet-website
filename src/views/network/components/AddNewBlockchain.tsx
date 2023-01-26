import { useState } from 'react';
import { Modal, Button, Form, Input, InputNumber, Row, Col, Select } from 'antd';
import { IBlockchainPostRequest } from '../../../types';
import { useDispatch, useSelector } from 'react-redux';
import { addBlockchain } from '../../../store/network/network.action';
import { selectNodes } from '../../../store/network/network.selectors';

interface FormData {
  name: string;
  chainId: number;
  coinSymbol: string;
  node?: string;
  explorer?: string;
  amountForFee: number;
  gasPrice?: number;
}

export const AddNewBlockchain = () => {
  const dispatch = useDispatch();
  const nodeData = useSelector(selectNodes);
  const [visible, setVisible] = useState<boolean>(false);
  const [confirmLoading, setConfirmLoading] = useState<boolean>(false);
  const [form] = Form.useForm();
  const { Option } = Select;

  const showModal = () => {
    setVisible(true);
  };

  const handleCancel = () => {
    form.resetFields();
    setVisible(false);
  }

  const handleAddBlockchain = (formdata: FormData) => {
    let payload: IBlockchainPostRequest = {
      name: formdata.name,
      chainId: formdata.chainId,
      coinSymbol: formdata.coinSymbol,
      node: formdata.node,
      explorer: formdata.explorer,
      amountForFee: formdata.amountForFee,
    };

    setConfirmLoading(true);
    dispatch(addBlockchain(payload));
    setConfirmLoading(false);
    handleCancel();
  }

  return (
    <>
      <Button type="primary" onClick={showModal} className="mb-3">
        Add New
      </Button>
      <Modal
        title="Add New Blockchain"
        visible={visible}
        onOk={form.submit}
        confirmLoading={confirmLoading}
        onCancel={handleCancel}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddBlockchain}
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
            rules={[{ required: false }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Default Node"
            name="node"
          >
            <Select placeholder='Please select node' allowClear>
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