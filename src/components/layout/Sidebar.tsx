import { Menu, Tooltip } from "antd";
import {
  AreaChartOutlined,
  RobotOutlined,
  LineChartOutlined,
  SettingOutlined,
  ScanOutlined,
  ScheduleOutlined,
  AppstoreAddOutlined,
  TransactionOutlined
} from "@ant-design/icons";
import { Link, useHistory } from "react-router-dom";
import { getBasePathFromHistory } from "../../shared/helpers";
import { RoleGuard } from '../../guards';
import { EUserRole } from '../../types';
import SubMenu from "antd/lib/menu/SubMenu";

export const Sidebar = () => {
  const history = useHistory();
  const currentPath = getBasePathFromHistory(history);

  return (
    <Menu
      mode="inline"
      style={{ height: "100%", borderRight: 0, background: "#24262d" }}
      selectedKeys={[currentPath]}
      theme="dark"
    >
      {RoleGuard({ roles: [EUserRole.ADMIN, EUserRole.TRADER, EUserRole.MONITOR, EUserRole.MAINTAINER, EUserRole.LIQUIDATOR] }) &&
        <Menu.Item
          key="/monitor"
          icon={<AreaChartOutlined />}

        >
          <Tooltip placement="right" title="">
            <Link to="/monitor" className="flex w-full">Monitor</Link>
          </Tooltip>
        </Menu.Item>
      }

      {/* {RoleGuard({roles: [EUserRole.ADMIN]}) && 
        <Menu.Item key="/dashboard" icon={<AppstoreOutlined />}>
          <Tooltip placement="right" title="">
            <Link to="/dashboard" className="flex w-full">Dashboard</Link>
          </Tooltip>
        </Menu.Item>
      } */}

      {RoleGuard({ roles: [EUserRole.ADMIN, EUserRole.TRADER, EUserRole.MONITOR] }) &&
        <Menu.Item key="/scanner" icon={<ScanOutlined />}>
          <Tooltip placement="right" title="">
            <Link to="/scanner" className="flex w-full">Token Scan</Link>
          </Tooltip>
        </Menu.Item>
      }

      {RoleGuard({ roles: [EUserRole.ADMIN] }) &&
        <Menu.Item key="/tokenCreator" icon={<AppstoreAddOutlined />}>
          <Tooltip placement="right" title="">
            <Link to="/tokenCreator" className="flex w-full">Token Creator</Link>
          </Tooltip>
        </Menu.Item>
      }

      {RoleGuard({ roles: [EUserRole.ADMIN, EUserRole.TRADER] }) &&
        <Menu.Item key="/bot" icon={<RobotOutlined />}>
          <Tooltip placement="right" title="">
            <Link to="/bot" className="flex w-full">Bot</Link>
          </Tooltip>
        </Menu.Item>
      }

      {RoleGuard({ roles: [EUserRole.ADMIN, EUserRole.LIQUIDATOR] }) &&
        <Menu.Item key="/liquidator" icon={<LineChartOutlined />}>
          <Tooltip placement="right" title="">
            <Link to="/liquidator" className="flex w-full">Liquidator</Link>
          </Tooltip>
        </Menu.Item>
      }

      {RoleGuard({ roles: [EUserRole.ADMIN] }) &&
        <Menu.Item key="/volume" icon={<ScheduleOutlined />}>
          <Tooltip placement="right" title="">
            <Link to="/volume" className="flex w-full">Scheduler</Link>
          </Tooltip>
        </Menu.Item>
      }

      {RoleGuard({ roles: [EUserRole.ADMIN] }) &&
        <Menu.Item key="/washer" icon={<TransactionOutlined />}>
          <Tooltip placement="right" title="">
            <Link to="/washer" className="flex w-full">Washer</Link>
          </Tooltip>
        </Menu.Item>
      }

      {/* {RoleGuard({roles: [EUserRole.ADMIN]}) && 
        <Menu.Item key="/history" icon={<ClockCircleOutlined />}>
          <Tooltip placement="right" title="">
            <Link to="/history" className="flex w-full">History</Link>
          </Tooltip>
        </Menu.Item>
      } */}

      <SubMenu key="sub1" icon={<SettingOutlined />} title="Settings">
        {RoleGuard({ roles: [EUserRole.ADMIN, EUserRole.TRADER] }) &&
          <Menu.Item key="/wallet" title="">
            <Link to="/wallet" className="flex w-full">Wallet</Link>
          </Menu.Item>
        }
        {RoleGuard({ roles: [EUserRole.ADMIN, EUserRole.MAINTAINER] }) &&
          <Menu.Item key="/network" title="">
            <Link to="/network" className="flex w-full">Network</Link>
          </Menu.Item>
        }
        {RoleGuard({ roles: [EUserRole.ADMIN] }) &&
          <Menu.Item key="/admin" title="">
            <Link to="/admin" className="flex w-full">Admin</Link>
          </Menu.Item>}
        {RoleGuard({ roles: [EUserRole.ADMIN, EUserRole.TRADER, EUserRole.MONITOR, EUserRole.MAINTAINER, EUserRole.LIQUIDATOR] }) &&
          <Menu.Item key="/setting" title="">
            <Link to="/setting" className="flex w-full">Account Setting</Link>
          </Menu.Item>
        }
      </SubMenu>
    </Menu>
  );
};
