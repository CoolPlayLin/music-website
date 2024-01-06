import React from "react";
import { Pagination, List, Button, Space, notification } from "antd";
import { fetchData } from "../../utils/web";
import type {Music} from '../../utils/types';


class SelectMusic extends React.Component {
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
    this.updateData(true)();
  }
  fetchCurrentManifests = (currentPage: number, pageSize: number) => {
    return this.state.music.slice(
      (currentPage - 1) * pageSize,
      currentPage * pageSize
    );
  };
  updateData = (useCache: boolean) => {
    return () => {
      this.setState({ loading: true });
      fetchData(useCache)(
        "https://fastly.jsdelivr.net/gh/CoolPlayLin/music-manifests@master/public/music.json"
      )
        .then((res) => res.json())
        .then((data) => {
          if (data !== this.state.music) {
            if (this.state.music.length !== 0) {
              notification.success({
                message: "数据更新成功",
              });
            }
            this.setState({ music: data });
          } else if (this.state.music === data) {
            notification.warning({
              message: "数据无变化，无需更新",
            });
          }
          this.setState({ loading: false });
        })
        .catch((error) => {
          notification.error({
            message: "数据更新失败",
          });
          console.error(error);
          this.setState({ loading: false });
        });
    };
  };
  render(): React.ReactNode {
    return (
      <div className="self-center">
        <h1 className="text-center">全部歌曲方案查看</h1>
        <Space>
          <Button loading={this.state.loading} onClick={this.updateData(false)}>
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
            defaultCurrent={1}
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

export default SelectMusic;
