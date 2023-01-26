import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Modal, Button, Form, Input } from 'antd';
import QRCode from 'qrcode';

import { selectUser } from "../../../store/auth/auth.selectors";
import { showNotification } from "../../../shared/helpers";
import { get2FASecret, verify2FA } from '../../../store/auth/auth.actions';
import { I2FASecret } from '../../../types';

interface Props {
  visible: boolean,
  setVisible: (visible: boolean) => void
}

export const OnTwoFactorAuth = (props: Props) => {
  const {visible, setVisible} = props;
  const [form] = Form.useForm();
  const user = useSelector(selectUser);
  const dispatch = useDispatch();

  const [code, setCode] = useState<string>("");
  const [twoFASecret, setTwoFASecret] = useState<string>("");

  useEffect(() => {
    get2FASecret(dispatch)
    .then((res: I2FASecret | undefined) => {
      if (res) {
        setTwoFASecret(res.base32);
        const secretKey = /secretkey/gi;
        const malletKey = ''.concat('Mallet(', user.email, ')');
        const otpauth_url = ''.concat(res.otpauth_url.replace(secretKey, malletKey), '&issuer=mallet.com')
        
        QRCode.toDataURL(otpauth_url)
        .then((codeUrl) => {
          setCode(codeUrl);
        })
      } else {
      }
    })
  }, [dispatch, user]);

  const onFinish = async (values: { verifyCode: string }) => {
    try {
      dispatch(verify2FA(values.verifyCode));
      showNotification("Two Factor Authentication has been enabled", "success", "topRight");
    } catch (err) {
      showNotification("Something went wrong", "error", "topRight");
    }

    setVisible(false);
  }

  return (
    <Modal
      visible={visible}
      title="Two Factor Authentication"
      onCancel={() => setVisible(false)}
      footer={[
        <Button key="back" onClick={form.submit}>
          Verify and Activate
        </Button>,
      ]}
      width={700}
      centered
    >
      <div className='text-center text-base pt-10'>
        <div className='mb-10'>
          <p className='mb-5'>Install an anthentication app in your mobile device (eg. Authy).</p>
          <p className='mb-5'>Scan the QR code or type in the code manually on your mobile device</p>
          <p className='mb-5'>Write down or save the secret code in case you loss your device</p>
          <p className='mb-5'>Do not share your secret code. Mallet will never ask for your secret code</p>
        </div>

        <img src={code} alt='QR code' className='m-auto mb-10 w-40' />

        <p className='mb-10'>
          Open the Authenticator app on your device and either scan the QR code provided,
          or manually enter the secret code.
        </p>

        <div className='mb-10'>
          <p>AUTHENTICATOR SECRET CODE</p>
          <span className='break-all text-base'>{twoFASecret}</span>
        </div>

        <Form
          name="on2fa"
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
