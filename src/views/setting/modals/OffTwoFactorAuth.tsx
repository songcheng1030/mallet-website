import { useDispatch } from 'react-redux';
import { Modal, Button, Form, Input } from 'antd';

import { deactive2FASecret } from '../../../store/auth/auth.actions';
import { showNotification } from "../../../shared/helpers";

interface Props {
  visible: boolean,
  setVisible: (visible: boolean) => void
}

export const OffTwoFactorAuth = (props: Props) => {
  const {visible, setVisible} = props;
  const [form] = Form.useForm();
  const dispatch = useDispatch();

  const onFinish = async (values: { verifyCode: string }) => {
    dispatch(deactive2FASecret(values.verifyCode));
    showNotification("Two Factor Authentication has been disabled", "success", "topRight");
    setVisible(false);
  }

  return (
    <Modal
      visible={visible}
      title={<div className='text-lg'>Turn off 2-Step Verification</div>}
      onCancel={() => setVisible(false)}
      footer={[
        <Button key="back" onClick={form.submit}>
          Turn Off
        </Button>,
      ]}
      width={600}
    >
      <div className='text-center text-base pt-10'>
        <div className='mb-20'>
          <div className='mb-5'>
            <p>Your account is more secure when you need a password and verification code to sign in. If you remove this extra layer of security.</p>
            <p></p>
          </div>
        </div>

        <Form
          name="off2fa"
          form={form}
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            label="Enter the code given by Authentication App"
            name="verifyCode"
            rules={[{ required: true, message: 'Must be exactly 6 digits' }]}
          >
            <Input placeholder='000000' />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  )
}
