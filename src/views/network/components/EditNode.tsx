import { useEffect, useState } from 'react';
import { Modal, Form, Input, Select } from 'antd';
import { INode } from '../../../types';
import { useDispatch, useSelector } from 'react-redux';
import { updateNode } from '../../../store/network/network.action';
import { selectBlockchains } from '../../../store/network/network.selectors';

interface Props {
  node: INode,
  visible: boolean,
  setVisible: (visible: boolean) => void,
}
export const EditNode = (props: Props) => {
  const { node, visible, setVisible } = props;
  const dispatch = useDispatch();
  const blockchainData = useSelector(selectBlockchains);
  const [confirmLoading, setConfirmLoading] = useState<boolean>(false);
  const [form] = Form.useForm();
  const { Option } = Select;

  useEffect(() => {
    if (form && node && visible) {
      form.setFieldsValue({
        ...node,
        blockchain: node.blockchain._id
      });
    }
  }, [form, node, visible]);

  const handleCancel = () => {
    setVisible(false);
  }

  const handleUpdateNode = (updatedNode: INode) => {
    const payload = {
      ...updatedNode,
      active: true,
      _id: node._id
    };
    setConfirmLoading(true);
    dispatch(updateNode(payload));
    setConfirmLoading(false);
    setVisible(false);
  }

  return (
    <>
      <Modal
        title="Edit Node"
        visible={visible}
        onOk={form.submit}
        confirmLoading={confirmLoading}
        onCancel={handleCancel}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdateNode}
          autoComplete="off"
        >
          <Form.Item
            label="Node name"
            name="name"
            rules={[{ required: true, message: 'Please enter node name!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Chain"
            name="blockchain"
            rules={[{ required: true, message: 'Please select chain!' }]}
          >
            <Select placeholder='Select Chain'>
              {blockchainData.map((item, idx) => (
                <Option key={idx} value={item._id ? item._id : 'unknown'}>
                  {item.name}  <span style={{color: "#e8962e"}}>[{item.coinSymbol}]</span>  ({item.chainId})
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="RPC Provider URL"
            name="rpcProviderURL"
            rules={[{ required: true, message: 'Please enter RPC Provider URL!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="WebSocket Provider URL"
            name="wsProviderURL"
            rules={[{ required: true, message: 'Please enter WebSocket Provider URL!' }]}
          >
            <Input />
          </Form.Item>
          {/* <Form.Item
            label="IP Address"
            name="ipAddress"
            rules={[{ required: false, message: 'Please enter IP Address!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Node Check Url"
            name="checkUrl"
            rules={[{ required: false, message: 'Please enter Node Check Url!' }]}
          >
            <Input />
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