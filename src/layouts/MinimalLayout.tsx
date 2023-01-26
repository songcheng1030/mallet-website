import { Layout } from "antd";
import LoadingBar from 'react-redux-loading-bar'

export const MinimalLayout = ({ children }: any) => {
  return (
    <Layout className="h-screen bg-gray minimal-layout-bg">
      <LoadingBar />
      {children}
    </Layout>
  );
};
