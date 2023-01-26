import { useDispatch } from 'react-redux';
import { Form, Input, Button } from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { login } from '../../store/auth/auth.actions';

interface LoginForm {
  username: string;
  password: string;
}

export const LoginPage = () => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();

  const onFinish = (values: LoginForm) => {
    dispatch(login(values.username, values.password));
    // form.resetFields();
  };

  return (
    <div className='w-full max-w-md m-auto bg-gray-darkest rounded-lg border border-primaryBorder shadow-default py-10 px-16'>
      {/* <h1 className='text-2xl font-medium mt-4 mb-12 text-center'>
        Sign in to your account
      </h1> */}

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
      >
        <Form.Item
          label="User"
          name="username"
          rules={[{ required: true, message: 'Please enter username!' }]}
        >
          <Input autoComplete="new-username"/>
        </Form.Item>

        <Form.Item 
          label="Password"
          name="password"
          rules={[{ required: true, message: 'Please enter password!' }]}
        >
          <Input.Password
            iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
            autoComplete="new-password"
          />
        </Form.Item>

        <Form.Item className="mt-10">
          <Button type="primary" htmlType="submit" className="w-full">
            Login
          </Button>
        </Form.Item>
      </Form>

      <div className="w-full text-center">
        <span>Don't have an account? <Link to="/auth/register" className='text-blue'>&nbsp;Sign up </Link></span>
      </div>
    </div>
  );
};

