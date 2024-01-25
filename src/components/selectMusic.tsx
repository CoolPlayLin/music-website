import React from "react";
import {
  Button,
  InputNumber,
  List,
  notification,
  Pagination,
  Select,
  Space,
} from "antd";
import { fetchData } from "../utils/web";
import type { Music, Song } from "../utils/types";

interface Condition {
  keyword: string[];
  singer: string[];
  maxLength: number;
  minLength: number;
}

class SelectMusic extends React.Component {
  state: Readonly<{
    music: Music[];
    manifests: Song[];
    loading: boolean;
    page: { currentPage: number; pageSize: number };
    conditions: Condition;
    cache: {
      conditions: Condition;
    };
  }>;
  constructor(props: Readonly<object>) {
    super(props);
    this.state = {
      cache: {
        conditions: {
          keyword: [],
          singer: [],
          maxLength: -1,
          minLength: -1,
        },
      },
      music: [],
      loading: true,
      manifests: [],
      page: {
        currentPage: 1,
        pageSize: 20,
      },
      conditions: {
        keyword: [],
        singer: [],
        maxLength: -1,
        minLength: -1,
      },
    };
  }
  componentDidMount() {
    this.updateData(true)();
  }
  fetchCurrentManifests = (currentPage: number, pageSize: number) => {
    return this.state.music.slice(
      (currentPage - 1) * pageSize,
      currentPage * pageSize
    );
  };
  getTotalPages = (): number => {
    return this.state.music.length;
  };
  updateData = (useCache: boolean) => {
    return () => {
      this.setState({ loading: true });
      fetchData(useCache)(
        "https://gh.xfisxf.top/https://raw.githubusercontent.com/CoolPlayLin/music-manifests/master/src/config/music.json"
      )
        .then((res) => res.json())
        .then((res) => {
          if (res.toString() === this.state.manifests) {
            return;
          }
          this.setState({ manifests: res });
        });
      fetchData(useCache)(
        "https://gh.xfisxf.top/https://raw.githubusercontent.com/CoolPlayLin/music-manifests/master/public/music.json"
      )
        .then((res) => res.json())
        .then((data) => {
          if (data.toString() === this.state.music.toString()) {
            if (this.state.music.length !== 0) {
              notification.warning({
                message: "数据无变化，无需更新",
              });
            }
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
        <Space direction="vertical">
          <Space>
            包含歌手{" "}
            <Select
              mode="tags"
              options={[
                ...new Set(
                  this.state.manifests.map((manifest, index) => {
                    return {
                      value: manifest.singer,
                      label: manifest.singer,
                      key: `singer.${index}`,
                    };
                  })
                ),
              ]}
              onChange={(args) => {
                this.setState({
                  cache: {
                    conditions: {
                      singer: args,
                      keyword: this.state.cache.conditions.keyword,
                      maxLength: this.state.cache.conditions.maxLength,
                      minLength: this.state.cache.conditions.minLength,
                    },
                  },
                });
              }}
              style={{ width: "auto" }}
            />
            <Button
              onClick={() => {
                this.setState({
                  conditions: {
                    singer: this.state.cache.conditions.singer,
                    keyword: this.state.conditions.keyword,
                    maxLength: this.state.conditions.maxLength,
                    minLength: this.state.conditions.minLength,
                  },
                });
              }}
              disabled={
                this.state.conditions.singer.toString() ===
                this.state.cache.conditions.singer.toString()
              }
            >
              应用
            </Button>
          </Space>
          <Space>
            包含歌曲{" "}
            <Select
              options={[
                ...new Set(
                  this.state.manifests.map((manifest, index) => {
                    return {
                      value: manifest.songName,
                      label: manifest.songName,
                      key: `music.${index}`,
                    };
                  })
                ),
              ]}
              onChange={(args) => {
                this.setState({
                  cache: {
                    conditions: {
                      keyword: args,
                      minLength: this.state.cache.conditions.minLength,
                      maxLength: this.state.cache.conditions.maxLength,
                      singer: this.state.cache.conditions.singer,
                    },
                  },
                });
              }}
              style={{ width: "100%" }}
              mode="tags"
            />
            <Button
              onClick={() => {
                this.setState({
                  conditions: {
                    singer: this.state.conditions.singer,
                    keyword: this.state.cache.conditions.keyword,
                    maxLength: this.state.conditions.maxLength,
                    minLength: this.state.conditions.minLength,
                  },
                });
              }}
              disabled={
                this.state.conditions.keyword.toString() ===
                this.state.cache.conditions.keyword.toString()
              }
            >
              应用
            </Button>
          </Space>
          <Space>
            最大长度{" "}
            <InputNumber
              onChange={(args) => {
                this.setState({
                  cache: {
                    conditions: {
                      maxLength:
                        args == null || (args as number) < -1
                          ? this.state.conditions.maxLength
                          : args,
                      minLength: this.state.conditions.minLength,
                      keyword: this.state.conditions.keyword,
                      singer: this.state.conditions.singer,
                    },
                  },
                });
              }}
            />{" "}
            <Button
              disabled={
                this.state.cache.conditions.maxLength ===
                this.state.conditions.maxLength
              }
              onClick={() => {
                this.setState({
                  conditions: {
                    minLength: this.state.conditions.minLength,
                    maxLength: this.state.cache.conditions.maxLength,
                    singer: this.state.conditions.singer,
                    keyword: this.state.conditions.keyword,
                  },
                });
              }}
            >
              应用
            </Button>
            当前设置:{" "}
            {this.state.conditions.maxLength === -1
              ? "无限制"
              : `${this.state.conditions.maxLength}秒`}
          </Space>
          <Space>
            最短长度{" "}
            <InputNumber
              onChange={(args) => {
                this.setState({
                  cache: {
                    conditions: {
                      minLength:
                        args == null || (args as number) < -1
                          ? this.state.conditions.minLength
                          : args,
                      maxLength: this.state.conditions.maxLength,
                      singer: this.state.conditions.singer,
                      keyword: this.state.conditions.keyword,
                    },
                  },
                });
              }}
            />{" "}
            <Button
              disabled={
                this.state.cache.conditions.minLength ===
                this.state.conditions.minLength
              }
              onClick={() => {
                this.setState({
                  conditions: {
                    minLength: this.state.cache.conditions.minLength,
                    maxLength: this.state.conditions.maxLength,
                    singer: this.state.conditions.singer,
                    keyword: this.state.conditions.keyword,
                  },
                });
              }}
            >
              应用
            </Button>
            当前设置:{" "}
            {this.state.conditions.minLength === -1
              ? "无限制"
              : `${this.state.conditions.minLength}秒`}
          </Space>
          <Pagination
            showQuickJumper
            showTotal={(total) => `共 ${total} 种方案`}
            className="origin-center"
            onChange={(currentPage: number, pageSize: number) => {
              this.setState({ page: { currentPage, pageSize } });
            }}
            pageSize={this.state.page.pageSize}
            defaultCurrent={1}
            total={this.getTotalPages()}
          />
        </Space>
        <List
          loading={this.state.loading}
          itemLayout="vertical"
          dataSource={this.fetchCurrentManifests(
            this.state.page.currentPage,
            this.state.page.pageSize
          )}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                title={`方案 ${this.state.music.indexOf(item) + 1}`}
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
        <Button loading={this.state.loading} onClick={this.updateData(false)}>
          获取最新数据
        </Button>
      </div>
    );
  }
}

export default SelectMusic;
