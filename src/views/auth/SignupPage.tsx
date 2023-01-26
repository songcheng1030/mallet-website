import { useDispatch } from 'react-redux';
import { Form, Input, Button } from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { Link } from 'react-router-dom';

import { register } from '../../store/auth/auth.actions';

interface RegisterForm {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export const SignupPage = () => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();

  const onFinish = (values: RegisterForm) => {
    dispatch(register(values.username, values.email, values.password));
    // form.resetFields();
  };

  return (
    <div className='w-full max-w-md m-auto bg-gray-darkest rounded-lg border border-primaryBorder shadow-default py-10 px-16'>
      {/* <h1 className='text-2xl font-medium mt-4 mb-12 text-center'>
        Sign up
      </h1> */}

      <Form
        form={form}
        layout="vertical"
        autoComplete="off"
        onFinish={onFinish}
      >
        <Form.Item
          label="Username"
          name="username"
          rules={[{ required: true, message: 'Please enter username!' }]}
        >
          <Input placeholder="input username" />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          rules={[{ required: true, message: 'Please enter email!' }]}
        >
          <Input type="email" placeholder="input email" />
        </Form.Item>

        <Form.Item 
          label="Password"
          name="password"
          rules={[{ required: true, message: 'Please enter password!' }]}
          hasFeedback
        >
          <Input.Password
            placeholder="input password"
            minLength={6}
            iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
          />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label="Confirm Password"
          dependencies={['password']}
          hasFeedback
          rules={[
            {
              required: true,
              message: 'Please confirm your password!',
            },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('The two passwords that you entered do not match!'));
              },
            }),
          ]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item className="mt-10">
          <Button type="primary" htmlType="submit" className="w-full">
            Sign up
          </Button>
        </Form.Item>
      </Form>

      <div className="w-full text-center">
        <span>Have an account? <Link to="/auth/login" className='text-blue'>&nbsp;Sign in</Link></span>
      </div>
    </div>
  );
};
