import { ReactNode } from "react";
import SelectMusic from "./routers/selectMusic";
import CurrentManifests from "./routers/currentMusic";
import "./App.css";
import { Layout, Space } from "antd";
import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import About from "./routers/about";
import Music from "./routers/passedMusic";

const { Header, Content, Footer } = Layout;

const router = createBrowserRouter([
  {
    path: "/",
    element: <About />,
  },
  {
    path: "/current",
    element: <CurrentManifests />,
  },
  {
    path: "/select",
    element: <SelectMusic />,
  },
  {
    path: "/music",
    element: <Music />,
  },
]);

class App extends React.Component {
  render(): ReactNode {
    return (
      <Layout>
        <Header className="bg-white" style={{ padding: 0, paddingLeft: 30 }}>
          <Space className="text-center">
            <a href="/">主页</a>
            <a href="/current">当前歌单</a>
            <a href="/select">所有方案</a>
            <a href="/music">已过审歌曲</a>
          </Space>
        </Header>
        <Content>
          <RouterProvider router={router} />
        </Content>
        <Footer style={{ textAlign: "center" }}>
          This website © 2024 created by CoolPlayLin
        </Footer>
      </Layout>
    );
  }
}

export default App;
