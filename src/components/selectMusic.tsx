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
  excludeSongs: string[];
  includeSingers: string[];
  excludeSingers: string[];
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
          excludeSongs: [],
          includeSingers: [],
          excludeSingers: [],
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
        excludeSingers: [],
        includeSingers: [],
        excludeSongs: [],
        maxLength: -1,
        minLength: -1,
      },
    };
  }
  componentDidMount() {
    this.updateData(true)();
  }
  removeConflict = () => {
    const singerConflicts = this.state.conditions.excludeSingers.filter(
      (singer) => {
        return this.state.conditions.includeSingers.includes(singer);
      }
    );
    const songsConflicts = this.state.conditions.excludeSongs.filter((song) => {
      return this.state.conditions.includeSongs.includes(song);
    });
    if (songsConflicts.length === 0 && singerConflicts.length === 0) {
      return;
    }
    notification.warning({
      message: "存在冲突的歌曲或歌手, 这些冲突歌曲或歌手将被移除",
    });
    this.setState({
      conditions: {
        includeSingers: this.state.conditions.includeSingers.filter(
          (singer) => !singerConflicts.includes(singer)
        ),
        excludeSingers: this.state.conditions.excludeSingers.filter(
          (singer) => !singerConflicts.includes(singer)
        ),
        includeSongs: this.state.conditions.includeSongs.filter(
          (song) => !songsConflicts.includes(song)
        ),
        excludeSongs: this.state.conditions.excludeSongs.filter(
          (song) => !songsConflicts.includes(song)
        ),
        maxLength: this.state.conditions.maxLength,
        minLength: this.state.conditions.minLength,
      },
      cache: {
        conditions: {
          includeSingers: this.state.cache.conditions.includeSingers.filter(
            (singer) => !singerConflicts.includes(singer)
          ),
          excludeSingers: this.state.cache.conditions.excludeSingers.filter(
            (singer) => !singerConflicts.includes(singer)
          ),
          includeSongs: this.state.cache.conditions.includeSongs.filter(
            (song) => !songsConflicts.includes(song)
          ),
          excludeSongs: this.state.cache.conditions.excludeSongs.filter(
            (song) => !songsConflicts.includes(song)
          ),
          maxLength: this.state.cache.conditions.maxLength,
          minLength: this.state.cache.conditions.minLength,
        },
      },
    });
  };
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
          this.state.conditions.includeSongs.length === 0 ||
          manifest.songs
            .map((song) => song.songName)
            .filter((value) =>
              this.state.conditions.includeSongs.includes(value)
            ).length === this.state.conditions.includeSongs.length
        );
      })
      .filter((manifest) => {
        return (
          this.state.conditions.includeSingers.length === 0 ||
          manifest.songs
            .map((songs) => songs.singer)
            .filter((value) =>
              this.state.conditions.includeSingers.includes(value)
            ).length === this.state.conditions.includeSingers.length
        );
      })
      .filter((manifest) => {
        return (
          this.state.conditions.excludeSongs.length === 0 ||
          manifest.songs
            .map((song) => song.songName)
            .filter((value) =>
              this.state.conditions.excludeSongs.includes(value)
            ).length === 0
        );
      })
      .filter((manifest) => {
        return (
          this.state.conditions.excludeSingers.length === 0 ||
          manifest.songs
            .map((songs) => songs.singer)
            .filter((value) =>
              this.state.conditions.excludeSingers.includes(value)
            ).length === 0
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
              this.state.conditions.excludeSingers.length === 0 &&
              this.state.conditions.includeSingers.length === 0 &&
              this.state.conditions.excludeSongs.length === 0 &&
              this.state.conditions.includeSongs.length === 0 &&
              this.state.conditions.maxLength === -1 &&
              this.state.conditions.minLength === -1
            }
            onClick={() => {
              this.setState({
                conditions: {
                  includeSongs: [],
                  excludeSongs: [],
                  includeSingers: [],
                  excludeSingers: [],
                  maxLength: -1,
                  minLength: -1,
                },
                cache: {
                  conditions: {
                    includeSongs: [],
                    excludeSongs: [],
                    includeSingers: [],
                    excludeSingers: [],
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
                      excludeSingers:
                        this.state.cache.conditions.excludeSingers,
                      includeSongs: this.state.cache.conditions.includeSongs,
                      excludeSongs: this.state.cache.conditions.excludeSongs,
                      maxLength: this.state.cache.conditions.maxLength,
                      minLength: this.state.cache.conditions.minLength,
                    },
                  },
                });
              }}
              style={{ width: "auto" }}
            />{" "}
            排除歌手
            <Select
              value={this.state.cache.conditions.excludeSingers}
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
                      includeSingers:
                        this.state.cache.conditions.includeSingers,
                      excludeSingers: args,
                      includeSongs: this.state.cache.conditions.includeSongs,
                      excludeSongs: this.state.cache.conditions.excludeSongs,
                      maxLength: this.state.cache.conditions.maxLength,
                      minLength: this.state.cache.conditions.minLength,
                    },
                  },
                });
              }}
            ></Select>
            <Button
              onClick={() => {
                this.setState(
                  {
                    conditions: {
                      includeSingers:
                        this.state.cache.conditions.includeSingers,
                      excludeSingers:
                        this.state.cache.conditions.excludeSingers,
                      includeSongs: this.state.conditions.includeSongs,
                      excludeSongs: this.state.conditions.excludeSongs,
                      maxLength: this.state.conditions.maxLength,
                      minLength: this.state.conditions.minLength,
                    },
                  },
                  () => {
                    this.removeConflict();
                  }
                );
              }}
              disabled={
                this.state.conditions.includeSingers.toString() ===
                  this.state.cache.conditions.includeSingers.toString() &&
                this.state.conditions.excludeSingers.toString() ===
                  this.state.cache.conditions.excludeSingers.toString()
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
                      excludeSongs: this.state.cache.conditions.excludeSongs,
                      minLength: this.state.cache.conditions.minLength,
                      maxLength: this.state.cache.conditions.maxLength,
                      includeSingers:
                        this.state.cache.conditions.includeSingers,
                      excludeSingers:
                        this.state.cache.conditions.excludeSingers,
                    },
                  },
                });
              }}
              style={{ width: "100%" }}
              mode="tags"
            />{" "}
            排除歌曲
            <Select
              style={{ width: "100%" }}
              mode="tags"
              value={this.state.cache.conditions.excludeSongs}
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
                      includeSongs: this.state.cache.conditions.includeSongs,
                      excludeSongs: args,
                      minLength: this.state.cache.conditions.minLength,
                      maxLength: this.state.cache.conditions.maxLength,
                      includeSingers:
                        this.state.cache.conditions.includeSingers,
                      excludeSingers:
                        this.state.cache.conditions.excludeSingers,
                    },
                  },
                });
              }}
            ></Select>
            <Button
              onClick={() => {
                this.setState(
                  {
                    conditions: {
                      includeSingers: this.state.conditions.includeSingers,
                      excludeSingers: this.state.conditions.excludeSingers,
                      includeSongs: this.state.cache.conditions.includeSongs,
                      excludeSongs: this.state.cache.conditions.excludeSongs,
                      maxLength: this.state.conditions.maxLength,
                      minLength: this.state.conditions.minLength,
                    },
                  },
                  () => {
                    this.removeConflict();
                  }
                );
              }}
              disabled={
                this.state.conditions.includeSongs.toString() ===
                  this.state.cache.conditions.includeSongs.toString() &&
                this.state.conditions.excludeSongs.toString() ===
                  this.state.cache.conditions.excludeSongs.toString()
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
                      excludeSongs: this.state.conditions.excludeSongs,
                      excludeSingers: this.state.conditions.excludeSingers,
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
                    excludeSongs: this.state.conditions.excludeSongs,
                    excludeSingers: this.state.conditions.excludeSingers,
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
                      excludeSongs: this.state.conditions.excludeSongs,
                      excludeSingers: this.state.conditions.excludeSingers,
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
                    excludeSongs: this.state.conditions.excludeSongs,
                    excludeSingers: this.state.conditions.excludeSingers,
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
