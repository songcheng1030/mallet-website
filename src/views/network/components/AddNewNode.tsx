import { useState } from 'react';
import { Modal, Button, Form, Input, Select } from 'antd';
import { INode } from '../../../types';
import { useDispatch, useSelector } from 'react-redux';
import { addNode } from '../../../store/network/network.action';
import { selectBlockchains } from '../../../store/network/network.selectors';

export const AddNewNode = () => {
  const dispatch = useDispatch();
  const blockchainData = useSelector(selectBlockchains);
  const [visible, setVisible] = useState<boolean>(false);
  const [confirmLoading, setConfirmLoading] = useState<boolean>(false);
  const [form] = Form.useForm();
  const { Option } = Select;

  const showModal = () => {
    setVisible(true);
  };

  const handleCancel = () => {
    setVisible(false);
  }

  const handleAddNode = (node: INode) => {
    const payload = {
      ...node,
      active: true
    };
    setConfirmLoading(true);
    dispatch(addNode(payload));
    setConfirmLoading(false);
    form.resetFields();
    setVisible(false);
  }

  return (
    <>
      <Button type="primary" onClick={showModal} className="mb-3">
        Add New
      </Button>
      <Modal
        title="Add New Node"
        visible={visible}
        onOk={form.submit}
        confirmLoading={confirmLoading}
        onCancel={handleCancel}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddNode}
          autoComplete="off"
        >
          <Form.Item
            label="Node name"
            name="name"
            rules={[{ required: true, message: 'Please enter node name!' }]}
          >
            <Input
              placeholder="node name"
            />
          </Form.Item>
          <Form.Item
            label="Chain"
            name="blockchain"
            rules={[{ required: true, message: 'Please select chain!'}]}
          >
            <Select placeholder='Select Chain'>
              {blockchainData.map((blockchain, idx) => (
                <Option key={idx} value={blockchain._id ? blockchain._id : 'unknown' }>{blockchain.name}  <span style={{color: "#e8962e"}}>[{blockchain.coinSymbol}]</span>  ({blockchain.chainId})</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="RPC Provider URL"
            name="rpcProviderURL"
            rules={[{ required: true, message: 'Please enter RPC Provider URL!' }]}
          >
            <Input
              placeholder="RPC Provider URL"
            />
          </Form.Item>
          <Form.Item
            label="WebSocket Provider URL"
            name="wsProviderURL"
            rules={[{ required: true, message: 'Please enter WebSocket Provider URL!' }]}
          >
            <Input
              placeholder="WebSocket Provider URL"
            />
          </Form.Item>
          {/* <Form.Item
            label="IP Address"
            name="ipAddress"
            rules={[{ required: false, message: 'Please enter IP Address!' }]}
          >
            <Input
              placeholder="IP Address"
            />
          </Form.Item>
          <Form.Item
            label="Node Check Url"
            name="checkUrl"
            rules={[{ required: false, message: 'Please enter Node Check Url!' }]}
          >
            <Input
              placeholder="Node Check Url"
            />
          </Form.Item> */}
          {/* <Form.Item
            label=""
            name="active"
            valuePropName="checked"
          >
            <Checkbox></Checkbox>
          </Form.Item> */}
        </Form>

      </Modal>
    </>
  )
}