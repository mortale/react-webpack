import React from "react";
import { Route } from "react-router-dom";

interface IRouteData {
    path:string
    PageComponent:React.ComponentType
}

const routerData: IRouteData[] = [
  {
    path:"/",
    PageComponent:React.lazy(()=>import("../pages/home"))
  },
  {
    path: "/custom-form/",
    PageComponent: React.lazy(() => import("../pages/custom-form")),
  },
  // {
  //   path: "/custom-flow-design/",
  //   PageComponent: React.lazy(() => import("../pages/custom-form")),
  // },
];

const routerGuard = (route:any, props:any) => {
  const { PageComponent } = route;
  return <PageComponent {...route} {...props} />;
};

const routers = routerData.map((route, i) => (
  <Route
    key={route.path}
    exact={true}
    path={route.path}
    render={routerGuard.bind(null, route)}
  />
));

export default routers