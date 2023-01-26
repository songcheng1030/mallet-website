import { useEffect, useMemo } from 'react';
import { Modal, Form, Input, Select } from 'antd';
import { useDispatch, useSelector } from 'react-redux';

import { updateCexAccount, addCexAccount } from '../../../store/cexAccount/cexAccount.actions';
import { selectUsers } from "../../../store/user/user.selectors";
import { EUserStatus, ICexAccount, ICexAccountEditRequest, ECEXType } from '../../../types';

interface Props {
  account?: ICexAccount,
  visible: boolean,
  setVisible: (visible: boolean) => void
}

export const EditCexAccount = (props: Props) => {
  const { account, visible, setVisible } = props;
  const dispatch = useDispatch();
  
  const [form] = Form.useForm();
  const { Option } = Select;
  const users = useSelector(selectUsers);

  useEffect(() => {
    if (!account) return;
    let users: string[] = [];
    account.users.forEach(user => {
      if (user._id) {
        users.push(user._id);
      }
    });

    const formData: ICexAccountEditRequest = {
      _id: account._id,
      name: account.name,
      cex: account.cex,
      users
    };

    form.setFieldsValue(formData);
  }, [form, account]);

  const filteredUsers = useMemo(() => {
    let computed = users;
    const me = localStorage.getItem("id");
    computed = computed.filter(user => user.status !== EUserStatus.BLOCKED && user._id !== me);
    return computed;
  }, [users]);

  const handleCancel = () => {
    form.resetFields();
    setVisible(false);
  };

  const onFinish = (updatedAccount: ICexAccountEditRequest) => {
    const users = updatedAccount.users ? updatedAccount.users.slice() : [];

    if (account) {
      dispatch(updateCexAccount({
        ...updatedAccount,
        users
      }));
    } else {
      dispatch(addCexAccount({
        name: updatedAccount.name,
        cex: updatedAccount.cex,
        apiKey: updatedAccount.apiKey,
        apiSecret: updatedAccount.apiSecret,
        apiPassword: updatedAccount.apiPassword,
        users
      }));
    }

    form.resetFields();
    setVisible(false);
  };

  return (
    <Modal
      title="Add CEX Wallet"
      visible={visible}
      onOk={form.submit}
      onCancel={handleCancel}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
      >
        <Form.Item
          label="Id"
          name="_id"
          hidden
        >
          <Input hidden />
        </Form.Item>

        <Form.Item
          label="Account Name"
          name="name"
          rules={[{ required: true, message: 'Please enter account name!' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="CEX"
          name="cex"
          rules={[{ required: true, message: 'Please enter account name!' }]}
        >
          <Select>
            <Option value={ECEXType.COINBASE}>Coinbase</Option>
            <Option value={ECEXType.KUCOIN}>Kucoin</Option>
          </Select>
        </Form.Item>

        {!account && <Form.Item
          label="API Key"
          name="apiKey"
          rules={[{ required: true, message: 'Please enter API key!' }]}
        >
          <Input placeholder="API key" />
        </Form.Item>}

        {!account && <Form.Item
          label="API Secret"
          name="apiSecret"
          rules={[{ required: true, message: 'Please enter API secret!' }]}
        >
          <Input />
        </Form.Item>}

        {!account && <Form.Item
          noStyle
          shouldUpdate={(prevValues, currentValues) => prevValues.cex !== currentValues.cex}
        >
          {({ getFieldValue }) =>
            getFieldValue('cex') === ECEXType.KUCOIN ? (
              <Form.Item
                label="API Password"
                name="apiPassword"
                rules={[{ required: true, message: 'Please enter API password!' }]}
              >
                <Input />
              </Form.Item>
            ) : null
          }
        </Form.Item>}

        <Form.Item
          name="users"
          label="Shared Users"
        >
          <Select mode="multiple" showArrow placeholder="Select Users">
            {filteredUsers.map((user, idx) => (
              <Option value={user._id ? user._id : 'unknown'} key={idx}>{user.username}</Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};
