import { useEffect } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { Provider } from 'react-redux';

import { DashboardLayout } from "./layouts/DashboardLayout";
import { MinimalLayout } from "./layouts/MinimalLayout";
import { routes } from "./routes";
import WithScrollTop from "./wrappers/ScrollTop";
import store from './store';
import { AuthGuard, RoleGuard } from "./guards";

function App() {
  useEffect(() => {
    Notification.requestPermission(function(result) {
      if (result === 'denied') {
        return;
      }
    })
  }, []);

  return (
    <Provider store={store}>
      <Router>
        <WithScrollTop>
          <AuthGuard authorized>
            <Route
              path={[...routes.dashboard.map(({ path }) => path)]}
              component={(props: any) => (
                <DashboardLayout {...props}>
                  <Switch {...props}>
                    {routes.dashboard.map((route, idx) => {
                      return RoleGuard({roles: route.allowRoles}) && (
                        <Route
                          key={idx}
                          path={route.path}
                          exact={route.exact}
                          component={(props: any) => (
                            <route.component {...props} key={idx} />
                          )}
                        />
                      )
                    })}
                  </Switch>
                </DashboardLayout>
              )}
            />
          </AuthGuard>

          <AuthGuard authorized={false}>
            <Route
              path={[...routes.minimal.map(({ path }) => path)]}
              component={(props: any) => (
                <MinimalLayout {...props}>
                  <Switch {...props}>
                    {routes.minimal.map((route, idx) => (
                      <Route
                        key={idx}
                        path={route.path}
                        exact={route.exact}
                        component={(props: any) => (
                          <route.component {...props} key={idx} />
                        )}
                      />
                    ))}
                  </Switch>
                </MinimalLayout>
              )}
            />
          </AuthGuard>
        </WithScrollTop>
      </Router>
    </Provider>
  );
}

export default App;
