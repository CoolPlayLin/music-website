import React from "react";
import { Pagination, List, Button, Space } from "antd";
import "./App.css";

interface Music {
  fullLength: number;
  songs: Song[];
}

interface Song {
  songName: string;
  singer: string;
  length: number;
}

class App extends React.Component {
  state: Readonly<{
    music: Music[];
    loading: boolean;
    page: { currentPage: number; pageSize: number };
  }> = {
    music: [],
    loading: true,
    page: {
      currentPage: 1,
      pageSize: 20,
    },
  };
  componentDidMount() {
    fetch(
      "https://fastly.jsdelivr.net/gh/CoolPlayLin/music-manifests@master/public/music.json"
    )
      .then((res) => res.json())
      .then((data) => {
        this.setState({ music: data, loading: false });
      });
  }
  fetchCurrentManifests = (currentPage: number, pageSize: number) => {
    return this.state.music.slice(
      (currentPage - 1) * pageSize,
      currentPage * pageSize
    );
  };
  updateData = () => {
    this.setState({ loading: true });
    fetch(
      "https://fastly.jsdelivr.net/gh/CoolPlayLin/music-manifests@master/public/music.json"
    )
      .then((res) => res.json())
      .then((data) => {
        this.setState({ music: data, loading: false });
      });
  };
  render(): React.ReactNode {
    return (
      <div className="self-center">
        <h1 className="text-center">全部歌曲方案查看</h1>
        <Space>
          <Button
            loading={this.state.loading}
            onClick={() => {
              this.updateData();
            }}
          >
            获取最新数据
          </Button>
          <Pagination
            showQuickJumper
            showTotal={(total) => `共 ${total} 种方案`}
            className="origin-center"
            onChange={(currentPage: number, pageSize: number) => {
              this.setState({ page: { currentPage, pageSize } });
            }}
            pageSize={this.state.page.pageSize}
            defaultCurrent={this.state.page.currentPage}
            total={this.state.music.length}
          />
        </Space>
        <List
          loading={this.state.loading}
          itemLayout="vertical"
          dataSource={this.fetchCurrentManifests(
            this.state.page.currentPage,
            this.state.page.pageSize
          )}
          renderItem={(item, index) => (
            <List.Item>
              <List.Item.Meta
                title={`方案 ${
                  index +
                  1 +
                  (this.state.page.currentPage - 1) * this.state.page.pageSize
                }`}
                description={`总时长 ${item.fullLength}s`}
              ></List.Item.Meta>
              <List
                dataSource={item.songs}
                renderItem={(song) => (
                  <List.Item>
                    {song.songName} | {song.singer}
                  </List.Item>
                )}
              ></List>
            </List.Item>
          )}
        ></List>
      </div>
    );
  }
}

export default App;
