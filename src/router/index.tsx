import React, { useEffect } from 'react'
import { HashRouter, Switch,   useHistory } from 'react-router-dom'
import routers from './config'

const Loading= () =><>loading...</>

// 此组件用于监听基座下发的跳转指令
const NavigatorFromBaseApp:React.FC = () => {
  const history = useHistory()

  useEffect(() => {
    window.microApp?.addDataListener((data: Record<string, unknown>) => {
      // 当基座下发path时进行跳转
      if (data.path && data.path !== history.location.pathname) {
        history.push(data.path as string)
      }
    })
  }, [history])

  return null
}

function App () {
  // 子应用内部跳转时，通知侧边栏改变菜单状态
  // function onRouteChange (): void {
  //   if (window.__MICRO_APP_ENVIRONMENT__) {
  //     // 发送全局数据，通知侧边栏修改菜单展示
  //     window.microApp.setGlobalData({ name: window.__MICRO_APP_NAME__ })
  //   }
  // }

  return (
    <React.Suspense fallback={<Loading />}>
    {/* 因为child-react17子应用是hash路由，主应用为history路由，所以不需要设置基础路由__MICRO_APP_BASE_ROUTE__ */}
    <HashRouter>
      <NavigatorFromBaseApp />
      <Switch>
          {routers}
        {/* <Route exact={true} path="/formily2-test" component={Formily2Test} /> */}
        {/* <Redirect to='/' /> */}
      </Switch>
    </HashRouter>
    </React.Suspense>
  )
}

export default App
