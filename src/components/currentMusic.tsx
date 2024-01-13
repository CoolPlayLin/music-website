import React from "react";
import { Button, Pagination, notification, Space, List } from "antd";
import { fetchData } from "../../utils/web";
import type { Song } from "../../utils/types";

interface CurrentMusic {
  date: string;
  fullLength: number;
  songs: Song[];
}

class CurrentManifests extends React.Component {
  state: Readonly<{
    music: CurrentMusic[];
    loading: boolean;
    page: { currentPage: number; pageSize: number };
  }> = {
    music: [],
    loading: false,
    page: {
      currentPage: 1,
      pageSize: 20,
    },
  };
  componentDidMount(): void {
    this.updateData(true)();
  }
  updateData = (useCache: boolean) => {
    return () => {
      this.setState({ loading: true });
      fetchData(useCache)(
        "https://gh.xfisxf.top/https://raw.githubusercontent.com/CoolPlayLin/music-manifests/master/public/current.json",
      )
        .then((res) => res.json())
        .then((data) => {
          if (this.state.music.toString() === data.toString()) {
            notification.warning({
              message: "数据无变化，无需更新",
            });
          } else {
            if (this.state.music.length !== 0) {
              notification.success({
                message: "数据更新成功",
              });
            }
            this.setState({ music: data });
          }
          this.setState({ loading: false });
        })
        .catch((error) => {
          if (this.state.music.length !== 0) {
            notification.error({
              message: "数据更新失败",
            });
          }
          console.error(error);
          this.setState({ loading: false });
        });
    };
  };
  fetchCurrentManifests = (currentPage: number, pageSize: number) => {
    return this.state.music.slice(
      (currentPage - 1) * pageSize,
      currentPage * pageSize,
    );
  };
  render(): React.ReactNode {
    return (
      <div>
        <Space>
          <Button onClick={this.updateData(false)} loading={this.state.loading}>
            更新数据
          </Button>
          <Pagination
            showQuickJumper
            showTotal={(total) => `一共 ${total} 条结果`}
            onChange={(currentPage: number, pageSize: number) => {
              this.setState({ page: { currentPage, pageSize } });
            }}
            pageSize={this.state.page.pageSize}
            defaultCurrent={1}
            total={this.state.music.length}
          ></Pagination>
        </Space>
        <List
          loading={this.state.loading}
          itemLayout="vertical"
          dataSource={this.fetchCurrentManifests(
            this.state.page.currentPage,
            this.state.page.pageSize,
          )}
          renderItem={(items) => (
            <List.Item>
              <List.Item.Meta
                title={items.date}
                description={`总时长：${items.fullLength}s`}
              ></List.Item.Meta>
              <List
                dataSource={items.songs}
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

export default CurrentManifests;
