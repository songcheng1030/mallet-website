import { useDispatch } from 'react-redux';
import { Form, Input, Button } from 'antd';
import { Link } from 'react-router-dom';

import { verify2FA } from '../../store/auth/auth.actions';

export const TwoFactorAuth = () => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();

  const onFinish = (values: { code: string }) => {
    dispatch(verify2FA(values.code));
  };

  return (
    <div className='w-full max-w-md m-auto bg-gray-darkest rounded-lg border border-primaryBorder shadow-default py-10 px-16'>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
      >
        <Form.Item
          label="Code given by Authentication App"
          name="code"
          rules={[{ required: true, message: 'Enter your code!' }]}
        >
          <Input placeholder='000000' autoComplete="new-code"/>
        </Form.Item>

        <Form.Item className="mt-10">
          <Button type="primary" htmlType="submit" className="w-full">
            Sign In
          </Button>
        </Form.Item>
      </Form>

      <div className="w-full text-center">
        <Link to="/auth/login">Back to Sign in</Link>
      </div>
    </div>
  );
};

