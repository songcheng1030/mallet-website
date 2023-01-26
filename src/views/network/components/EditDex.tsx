import { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, } from 'antd';
import { IDex, EDexType } from '../../../types';
import { useDispatch, useSelector } from 'react-redux';
import { updateDex } from '../../../store/network/network.action';
import { selectBlockchains } from '../../../store/network/network.selectors';

interface Props {
  dex: IDex,
  visible: boolean,
  setVisible: (visible: boolean) => void,
}
export const EditDex = (props: Props) => {
  const { dex, visible, setVisible } = props;
  const dispatch = useDispatch();
  const blockchainData = useSelector(selectBlockchains);
  const [confirmLoading, setConfirmLoading] = useState<boolean>(false);
  const [form] = Form.useForm();
  const { Option } = Select;


  useEffect(() => {
    if (form && visible && dex && dex.blockchain) {
      form.setFieldsValue({
        ...dex,
        blockchain: dex.blockchain._id
      });
    }
  }, [form, visible, dex]);


  const handleCancel = () => {
    setVisible(false);
  }

  const handleUpdateDex = (updatedDex: IDex) => {
    setConfirmLoading(true);
    dispatch(updateDex({...updatedDex, _id: dex._id}));
    setConfirmLoading(false);
    setVisible(false);
  }

  return (
    <>
      <Modal
        title="Edit DEX"
        visible={visible}
        onOk={form.submit}
        confirmLoading={confirmLoading}
        onCancel={handleCancel}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdateDex}
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
            rules={[{ required: true, message: 'Please select blockchain!'}]}
          >
            <Select placeholder='Select Chain'>
              {blockchainData.map((item, idx) => (
                <Option key={idx} value={item._id ? item._id : 'unknown'}>{item.name}  <span style={{color: "#e8962e"}}>[{item.coinSymbol}]</span> ({item.chainId})</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="DEX Type"
            name="type"
            rules={[{ required: true, message: 'Please enter Dex Type!' }]}
          >
            <Select placeholder='Select Dex Type'>
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