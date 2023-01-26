import { useSelector } from 'react-redux';
import { Modal, Button, Form, Input } from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';

import { selectUser } from "../../../store/auth/auth.selectors";
import { authService } from '../../../services';
import { ChangePwdRequest } from '../../../types';
import { showNotification } from "../../../shared/helpers";

interface Props {
  visible: boolean,
  setVisible: (visible: boolean) => void
}

export const ChangePwd = (props: Props) => {
  const {visible, setVisible} = props;
  const [form] = Form.useForm();
  const user = useSelector(selectUser);

  const onFinish = async (values: ChangePwdRequest) => {
    if (values.newPwd !== values.confirmPwd) {
      showNotification("Password verification is not the same", "error", "topRight");
      return;
    }

    try {
      const result = await authService.changePwd({
        ...values,
        email: user.email
      });
      if (result) {
        showNotification("Password has been changed successfully", "success", "topRight");
        setVisible(false);
      } else {
        showNotification("Password not valid", "error", "topRight");
      }
    } catch (err) {
      showNotification("Password not valid", "error", "topRight");
    }
  }

  return (
    <Modal
      visible={visible}
      title={<div className='text-lg'>Change Password</div>}
      onCancel={() => setVisible(false)}
      footer={[
        <Button key="back" onClick={form.submit}>
          Update password
        </Button>
      ]}
      width={600}
    >
      <div className='flex flex-col items-center text-base pt-10'>
        <div className='mb-10'>
          <div className='text-center'>
            <p>To change your password, you need to enter the current password that is used to log in to the system</p>
          </div>
        </div>

        <Form
          name="changePassword"
          form={form}
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
          style={{width: '80%'}}
        >
          <Form.Item
            label="Current password"
            name="currentPwd"
            rules={[{ required: true, message: 'Please enter current password' }]}
          >
            <Input.Password iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)} />
          </Form.Item>

          <Form.Item
            label="New password"
            name="newPwd"
            rules={[{ required: true, message: 'Please enter new password' }]}
          >
            <Input.Password iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)} />
          </Form.Item>

          <Form.Item
            label="Repeat new password"
            name="confirmPwd"
            rules={[{ required: true, message: 'Confirm password is a required field' }]}
          >
            <Input.Password iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)} />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  )
}
