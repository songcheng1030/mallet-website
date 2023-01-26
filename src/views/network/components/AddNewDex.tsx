import { useState } from 'react';
import { Modal, Button, Form, Input, Select, } from 'antd';
import { IDex, EDexType } from '../../../types';
import { useDispatch, useSelector } from 'react-redux';
import { addDex } from '../../../store/network/network.action';
import { selectBlockchains } from '../../../store/network/network.selectors';

export const AddNewDex = () => {
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

  const handleAddDex = (dex: IDex) => {
    setConfirmLoading(true);
    dispatch(addDex(dex));
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
        title="Add New DEX"
        visible={visible}
        onOk={form.submit}
        confirmLoading={confirmLoading}
        onCancel={handleCancel}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddDex}
          autoComplete="off"
        >
          <Form.Item
            label="DEX Name"
            name="name"
            rules={[{ required: true, message: 'Please enter dex name!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Chain"
            name="blockchain"
            rules={[{ required: true, message: 'Please select chain!'}]}
          >
            <Select placeholder='Select Chain'>
              {blockchainData.map((blockchain, idx) => (
                <Option key={idx} value={blockchain._id ? blockchain._id : 'unknown'}>{blockchain.name}  <span style={{color: "#e8962e"}}>[{blockchain.coinSymbol}]</span> ({blockchain.chainId})</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="DEX Type"
            name="type"
            rules={[{ required: true, message: 'Please enter DEX Type!' }]}
          >
            <Select placeholder='Select DEX Type'>
              {Object.keys(EDexType).map((dexType, idx) => (
                <Option key={idx} value={dexType}>{dexType}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="Router Address"
            name="routerAddress"
            rules={[{ required: true, message: 'Please enter Router Address!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Factory Address"
            name="factoryAddress"
            rules={[{ required: true, message: 'Please enter Factory Address!' }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}