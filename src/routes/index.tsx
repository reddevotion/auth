import { createFileRoute } from '@tanstack/react-router'
import { Button, Card, Divider, Form, Input, message, Typography} from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { useAuth } from '../hooks/useAuth';

const { Title, Text } = Typography;

export const Route = createFileRoute('/')({
  component: SignIn,
})

const copy = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    message.success('Copied!');
  } catch {
    message.error('Copy failed');
  }
};

export function SignIn() {
  const [form] = Form.useForm();
  const {loginMutation} = useAuth();

  const email = Form.useWatch("email", form);
  const password = Form.useWatch("password", form);

  const isEmailValid = !!email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isPasswordValid = !!password && password.length > 0;

  const isFormValid = isEmailValid && isPasswordValid;

  return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 flex items-center justify-center p-4">
      <Card
        className="w-full max-w-[440px] shadow-xl"
        styles={{ body: { padding: 28 } }}
      >
        <div className="text-center mb-6">
          <Text>Company</Text>
          <Title level={3} style={{ margin: 0 }}>Sign in to your account to continue</Title>
        </div>


        <Form
            form={form}
            name="login"
            autoComplete="on"
            onFinish={(values) => loginMutation.mutate(values)}
          >
            <Form.Item
              name="email"
              rules={[
                { required: true, message: "Please enter email" },
                { type: "email", message: "Invalid email" },
              ]}
            >
              <Input size="large" prefix={<UserOutlined className='text-[#8c8c8c]!'/>} placeholder="Email" />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: "Please enter password" }]}
            >
              <Input.Password size="large" prefix={<LockOutlined className='text-[#8c8c8c]!'/>} placeholder="Password" />
            </Form.Item>


            <Button
              block
              size="large"
              type="primary"
              htmlType="submit"
              loading={loginMutation.isPending}
              disabled={!isFormValid}
              className={
                !isFormValid
                ? "bg-[#f5f5f5] border border-[#d9d9d9] text-[#b8b8b8]"
                : "bg-primary text-white hover:bg-primary/90"
              }
              >
              Sign in
            </Button>

          </Form>
        <Divider plain>Test states</Divider>
        <div className="text-xs text-slate-500 space-y-1">
          <p>
            Password: <code title="Click to copy" className="cursor-pointer hover:bg-gray-200 px-1 rounded" onClick={() => copy('Password123!')}>Password123!</code>
          </p>
          <p>Invalid credentials: any email, other password</p>
          <p>
            2FA: <code title="Click to copy" className="cursor-pointer hover:bg-gray-200 px-1 rounded" onClick={() => copy('2fa@demo.dev')}>2fa@demo.dev</code>{" "}
              <span>(code will be in the console: <code>000000</code>)</span>
          </p>
          <p>Locked: <code title="Click to copy" className="cursor-pointer hover:bg-gray-200 px-1 rounded" onClick={() => copy('locked@demo.dev')}>locked@demo.dev</code></p>
          <p>Rate limit: <code title="Click to copy" className="cursor-pointer hover:bg-gray-200 px-1 rounded" onClick={() => copy('rate@demo.dev')}>rate@demo.dev</code></p>
          <p>Server error: <code title="Click to copy" className="cursor-pointer hover:bg-gray-200 px-1 rounded" onClick={() => copy('server@demo.dev')}>server@demo.dev</code></p>
          <p>Network issue: <code title="Click to copy" className="cursor-pointer hover:bg-gray-200 px-1 rounded" onClick={() => copy('network@demo.dev')}>network@demo.dev</code></p>
        </div>
      </Card>
    </div>
  );
}