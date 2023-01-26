import { useState } from "react";
import { Layout } from "antd";
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
} from '@ant-design/icons';
import LoadingBar from 'react-redux-loading-bar'

import { Navbar } from "../components/layout/Navbar";
import { Sidebar } from "../components/layout/Sidebar";

export const DashboardLayout = ({ children }: any) => {
  const [collapsed, setCollapsed] = useState<boolean>(true);

  const toggle = () => {
    setCollapsed(!collapsed);
  };

  return (
    <Layout className="h-screen overflow-hidden">
      <Layout.Header className="p-0 bg-white border-b">
        <Navbar />
        <LoadingBar />
      </Layout.Header>
      <Layout>
        <Layout.Sider trigger={null} collapsible collapsed={collapsed} className="pt-3">
          <Sidebar />
          <div className="sidebar-collapsable-btn" onClick={toggle}>
            {collapsed && <MenuUnfoldOutlined />}
            {!collapsed && <MenuFoldOutlined />}
          </div>
        </Layout.Sider>
        <Layout.Content className="h-full overflow-y-auto overflow-x-hidden p-6 relative">
          {children}
        </Layout.Content>
      </Layout>
    </Layout>
  );
};
