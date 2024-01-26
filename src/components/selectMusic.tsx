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
  includeSongs: string[];
  includeSingers: string[];
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
          includeSongs: [],
          includeSingers: [],
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
        includeSongs: [],
        includeSingers: [],
        maxLength: -1,
        minLength: -1,
      },
    };
  }
  componentDidMount() {
    this.updateData(true)();
  }
  scopeMusic = () => {
    const manifests = this.state.music
      .filter((manifest) => {
        return (
          (manifest.fullLength >= this.state.conditions.minLength ||
            this.state.conditions.minLength === -1) &&
          (manifest.fullLength <= this.state.conditions.maxLength ||
            this.state.conditions.maxLength === -1)
        );
      })
      .filter((manifest) => {
        return (
          manifest.songs.filter((value) =>
            this.state.conditions.includeSongs.includes(value.songName)
          ).length !== 0 || this.state.conditions.includeSongs.length === 0
        );
      })
      .filter((manifest) => {
        return (
          manifest.songs.filter((value) =>
            this.state.conditions.includeSingers.includes(value.singer)
          ).length !== 0 || this.state.conditions.includeSingers.length === 0
        );
      });
    return manifests;
  };
  fetchCurrentManifests = (currentPage: number, pageSize: number) => {
    const scopedMusic = this.scopeMusic();
    return scopedMusic.slice(
      (currentPage - 1) * pageSize,
      currentPage * pageSize
    );
  };
  updateData = (useCache: boolean) => {
    return () => {
      this.setState({ loading: true });
      Promise.all([
        fetchData(useCache)(
          "https://gh.xfisxf.top/https://raw.githubusercontent.com/CoolPlayLin/music-manifests/master/src/config/music.json"
        ),
        fetchData(useCache)(
          "https://gh.xfisxf.top/https://raw.githubusercontent.com/CoolPlayLin/music-manifests/master/public/music.json"
        ),
      ])
        .then(async ([res1, res2]) => {
          return {
            manifests: await res1.json(),
            music: await res2.json(),
          };
        })
        .then((data) => {
          if (
            JSON.stringify(data.manifests) ===
            JSON.stringify(this.state.manifests)
          ) {
            if (this.state.manifests.length !== 0) {
              notification.warning({
                message: "数据无变化，无需更新",
              });
            }
          } else {
            if (this.state.manifests.length !== 0) {
              notification.success({
                message: "数据更新成功",
              });
            }
            this.setState({ manifests: data.manifests });
            this.setState({ music: data.music });
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
          <Button
            disabled={
              JSON.stringify(this.state.conditions) ===
              JSON.stringify({
                includeSongs: [],
                includeSingers: [],
                maxLength: -1,
                minLength: -1,
              })
            }
            onClick={() => {
              this.setState({
                conditions: {
                  includeSongs: [],
                  includeSingers: [],
                  maxLength: -1,
                  minLength: -1,
                },
                cache: {
                  conditions: {
                    includeSongs: [],
                    includeSingers: [],
                    maxLength: -1,
                    minLength: -1,
                  },
                },
              });
            }}
          >
            清除所有条件
          </Button>
          <Space>
            包含歌手{" "}
            <Select
              value={this.state.cache.conditions.includeSingers}
              mode="tags"
              options={[
                ...new Set(
                  this.state.manifests.map((item) => {
                    return item.singer;
                  })
                ),
              ].map((singer, index) => {
                return {
                  value: singer,
                  label: singer,
                  key: `singer.${index}`,
                };
              })}
              onChange={(args) => {
                this.setState({
                  cache: {
                    conditions: {
                      includeSingers: args,
                      includeSongs: this.state.cache.conditions.includeSongs,
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
                    includeSingers: this.state.cache.conditions.includeSingers,
                    includeSongs: this.state.conditions.includeSongs,
                    maxLength: this.state.conditions.maxLength,
                    minLength: this.state.conditions.minLength,
                  },
                });
              }}
              disabled={
                this.state.conditions.includeSingers.toString() ===
                this.state.cache.conditions.includeSingers.toString()
              }
            >
              应用
            </Button>
          </Space>
          <Space>
            包含歌曲{" "}
            <Select
              value={this.state.cache.conditions.includeSongs}
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
                      includeSongs: args,
                      minLength: this.state.cache.conditions.minLength,
                      maxLength: this.state.cache.conditions.maxLength,
                      includeSingers:
                        this.state.cache.conditions.includeSingers,
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
                    includeSingers: this.state.conditions.includeSingers,
                    includeSongs: this.state.cache.conditions.includeSongs,
                    maxLength: this.state.conditions.maxLength,
                    minLength: this.state.conditions.minLength,
                  },
                });
              }}
              disabled={
                this.state.conditions.includeSongs.toString() ===
                this.state.cache.conditions.includeSongs.toString()
              }
            >
              应用
            </Button>
          </Space>
          <Space>
            最大长度{" "}
            <InputNumber
              value={this.state.cache.conditions.maxLength}
              onChange={(args) => {
                this.setState({
                  cache: {
                    conditions: {
                      maxLength:
                        args == null || (args as number) < -1
                          ? this.state.conditions.maxLength
                          : args,
                      minLength: this.state.conditions.minLength,
                      includeSongs: this.state.conditions.includeSongs,
                      includeSingers: this.state.conditions.includeSingers,
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
                    includeSingers: this.state.conditions.includeSingers,
                    includeSongs: this.state.conditions.includeSongs,
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
              value={this.state.cache.conditions.minLength}
              onChange={(args) => {
                this.setState({
                  cache: {
                    conditions: {
                      minLength:
                        args == null || (args as number) < -1
                          ? this.state.conditions.minLength
                          : args,
                      maxLength: this.state.conditions.maxLength,
                      includeSingers: this.state.conditions.includeSingers,
                      includeSongs: this.state.conditions.includeSongs,
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
                    includeSingers: this.state.conditions.includeSingers,
                    includeSongs: this.state.conditions.includeSongs,
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
            total={this.scopeMusic().length}
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
