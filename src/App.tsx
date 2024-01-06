import { ReactNode } from "react";
import SelectMusic from "./routers/selectMusic";
import CurrentManifests from "./routers/currentMusic";
import "./App.css";
import { Layout, Space } from "antd";
import React from "react";
import {
  Route,
  Link,
  Routes,
} from "react-router-dom";
import About from "./routers/about";
import Music from "./routers/passedMusic";

const { Header, Content, Footer } = Layout;

class App extends React.Component {
  render(): ReactNode {
    return (
      <Layout>
        <Header className="bg-white" style={{ padding: 0, paddingLeft: 30 }}>
            <Space className="text-center">
              <Link to="/">主页</Link>
              <Link to="/current">当前歌单</Link>
              <Link to="/select">所有方案</Link>
              <Link to="/music">已过审歌曲</Link>
            </Space>
        </Header>
        <Content>
          <Routes>
            <Route path="/" element={<About />} />
            <Route path="/current" element={<CurrentManifests />} />
            <Route path="/select" element={<SelectMusic />} />
            <Route path="/music" element={<Music />} />
          </Routes>
        </Content>
        <Footer style={{ textAlign: "center" }}>
          This website © 2024 created by CoolPlayLin
        </Footer>
      </Layout>
    );
  }
}

export default App;
