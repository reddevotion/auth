import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { Alert, Button, Card, Form, Input, message, Typography } from "antd";
import { LeftOutlined } from "@ant-design/icons";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState, } from "react";
import { mock2FASession, type AuthError } from "@/api/authApi";

const { Title, Text } = Typography;

export const Route = createFileRoute("/2fa/")({
  component: TwoFactor,
});

export default function TwoFactor() {
  const [form] = Form.useForm();
  const { twoFactorMutation, resendMutation } = useAuth();
  const search = useSearch({ from: "/2fa/" }) as { tempToken?: string };
  const tempToken = search?.tempToken;
  const [isExpired, setIsExpired] = useState(false);

useEffect(() => {
  if (!tempToken || !mock2FASession) return;

  const interval = setInterval(() => {
    setIsExpired(Date.now() > (mock2FASession?.expiresAt ?? 0));
  }, 1000);

  return () => clearInterval(interval);
}, [tempToken]);

const handleSubmit = async () => { 
  if (!tempToken) { 
    message.error("Missing temporary token. Please sign in again."); return; 
  } 
  try { 
    const values = await form.validateFields(); 
    twoFactorMutation.mutate( { 
      tempToken, code: values.code 
    }, { 
      onError: (error: AuthError) => { 
        form.setFields([ { name: "code", errors: [error.message], }, ]); 
      }, 
      onSuccess: () => { 
        message.success("2FA verification successful!"); 
        form.resetFields(); 
      }, } ); } 
  catch { 
    
  }
};


  const handleResend = () => {
    if (!tempToken) {
      message.warning("Missing temporary token. Please sign in again.");
      return;
    }
    resendMutation.mutate({ tempToken });
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center p-4">
      <Card className="w-full max-w-[440px] shadow-xl" styles={{ body: { padding: 28 } }}>
        <div className="relative">
          <Link to={"/"}>
            <Button
              type="text"
              shape="circle"
              icon={<LeftOutlined />}
              aria-label="Back"
              className="absolute left-0 top-0"
            />
          </Link>
          <div className="text-center mb-6">
            <Text>Company</Text>
            <Title level={3} style={{ margin: 0 }}>
              Two-Factor Authentication
            </Title>
            <h4 className="text-[18px]">Enter the 6-digit code from the Google Authenticator app</h4>
          </div>
        </div>


        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="code"
            rules={[
              { required: true, message: "Please enter your 2FA code" },
              { len: 6, message: "Code must be 6 digits" },
            ]}
          >
            <Input.OTP
              disabled={!tempToken || isExpired}
              length={6}
              size="large"
              onChange={() => {
              }}
              style={{ display: "flex", justifyContent: "space-between" }}
            />
          </Form.Item>
          {!tempToken && (
            <Alert className="mb-4!" type="warning" showIcon message="Missing verification session" description="Start again from Sign in" />
          )}

          <div className="flex gap-2 items-center">
            <Button
              type="primary"
              size="large"
              htmlType={!isExpired ? "submit" : undefined}
              onClick={isExpired ? handleResend : undefined}
              loading={twoFactorMutation.isPending || resendMutation.isPending}
              block
            >
              {!isExpired ? "Continue" : "Get New"}
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}