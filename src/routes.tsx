import { Redirect } from "react-router-dom";
import { LoginPage, SignupPage, TwoFactorAuth } from './views/auth';
import { DashboardPage } from "./views/dashboard";
import { MonitorPage } from "./views/monitor"
import { BotPage} from "./views/bot";
import { HistoryPage } from "./views/history";
import { WalletPage } from "./views/wallet";
import { NetworkPage } from "./views/network";
import { AdminPage } from "./views/admin";
import { SettingPage } from "./views/setting";
import { ScannerPage } from "./views/scanner";
import { VolumeToolPage } from "./views/volume";
import { LiquidatorToolPage } from "./views/liquidator";
import { ReportPage } from "./views/report";
import { WasherPage } from "./views/washer";
import { TokenCreatorPage } from './views/tokenCreator';
import { EUserRole } from './types';

export const routes = {
  dashboard: [
    {
      path: "/dashboard",
      component: DashboardPage,
      exact: true,
      allowRoles: [EUserRole.ADMIN]
    },
    {
      path: "/monitor",
      component: MonitorPage,
      exact: true,
      allowRoles: [EUserRole.ADMIN, EUserRole.TRADER, EUserRole.MONITOR, EUserRole.MAINTAINER, EUserRole.LIQUIDATOR]
    },
    {
      path: "/bot",
      component: BotPage,
      exact: true,
      allowRoles: [EUserRole.ADMIN, EUserRole.TRADER]
    },
    {
      path: "/volume",
      component: VolumeToolPage,
      exact: true,
      allowRoles: [EUserRole.ADMIN]
    },
    {
      path: "/liquidator",
      component: LiquidatorToolPage,
      exact: true,
      allowRoles: [EUserRole.ADMIN, EUserRole.LIQUIDATOR]
    },
    {
      path: "/history",
      component: HistoryPage,
      exact: true,
      allowRoles: [EUserRole.ADMIN]
    },
    {
      path: "/wallet",
      component: WalletPage,
      exact: true,
      allowRoles: [EUserRole.ADMIN, EUserRole.TRADER]
    },
    {
      path: "/network",
      component: NetworkPage,
      exact: true,
      allowRoles: [EUserRole.ADMIN, EUserRole.MAINTAINER]
    },
    {
      path: "/admin",
      component: AdminPage,
      exact: true,
      allowRoles: [EUserRole.ADMIN]
    },
    {
      path: "/setting",
      component: SettingPage,
      exact: true,
      allowRoles: [EUserRole.ADMIN, EUserRole.TRADER, EUserRole.MONITOR, EUserRole.MAINTAINER, EUserRole.LIQUIDATOR]
    },
    {
      path: "/scanner",
      component: ScannerPage,
      exact: true,
      allowRoles: [EUserRole.ADMIN, EUserRole.TRADER, EUserRole.MONITOR]
    },
    {
      path: "/report",
      component: ReportPage,
      exact: true,
      allowRoles: [EUserRole.ADMIN]
    },
    {
      path: "/washer",
      component: WasherPage,
      exact: true,
      allowRoles: [EUserRole.ADMIN]
    },
    {
      path: "/tokenCreator",
      component: TokenCreatorPage,
      exact: true,
      allowRoles: [EUserRole.ADMIN]
    },
    {
      path: "**",
      exact: true,
      component: () => <Redirect to="/monitor" />,
      allowRoles: [EUserRole.ADMIN, EUserRole.TRADER, EUserRole.MONITOR, EUserRole.MAINTAINER, EUserRole.LIQUIDATOR]
    },
  ],
  minimal: [
    {
      path: "/auth/login",
      component: LoginPage,
      exact: true,
    },
    {
      path: "/auth/register",
      component: SignupPage,
      exact: true,
    },
    {
      path: "/auth/2fa-authentication",
      component: TwoFactorAuth,
      exact: true,
    },
    {
      path: "**",
      exact: true,
      component: () => <Redirect to="/auth/login" />,
    },
  ],
};
