import { Layout } from "antd";

export const EmptyLayout = ({ children }: any) => {
  return (
    <Layout className="h-screen bg-white">
        {children}
    </Layout>
  );
};
