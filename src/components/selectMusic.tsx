import React, { useState, useEffect } from "react";
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

const SelectMusic: React.FC = () => {
  const [music, setMusic] = useState<Music[]>([]);
  const [manifests, setManifests] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [includeSongs, setIncludeSongs] = useState<string[]>([]);
  const [excludeSongs, setExcludeSongs] = useState<string[]>([]);
  const [includeSingers, setIncludeSingers] = useState<string[]>([]);
  const [excludeSingers, setExcludeSingers] = useState<string[]>([]);
  const [maxLength, setMaxLength] = useState(0);
  const [minLength, setMinLength] = useState(0);
  const [_includeSongs, _setIncludeSongs] = useState<string[]>([]);
  const [_excludeSongs, _setExcludeSongs] = useState<string[]>([]);
  const [_includeSingers, _setIncludeSingers] = useState<string[]>([]);
  const [_excludeSingers, _setExcludeSingers] = useState<string[]>([]);
  const [_maxLength, _setMaxLength] = useState(-1);
  const [_minLength, _setMinLength] = useState(-1);

  function removeConflict() {
    const singerConflicts = excludeSingers.filter((singer) => {
      return includeSingers.includes(singer);
    });
    const songsConflicts = excludeSongs.filter((song) => {
      return includeSongs.includes(song);
    });
    if (songsConflicts.length === 0 && singerConflicts.length === 0) {
      return;
    }
    notification.warning({
      message: "包含冲突的歌曲或歌手, 这些冲突歌曲或歌手将被移除",
    });
    setIncludeSongs(
      includeSongs.filter((song) => !songsConflicts.includes(song))
    );
    setExcludeSongs(
      excludeSongs.filter((song) => !songsConflicts.includes(song))
    );
    setIncludeSingers(
      includeSingers.filter((singer) => !singerConflicts.includes(singer))
    );
    setExcludeSingers(
      excludeSingers.filter((singer) => !singerConflicts.includes(singer))
    );
    _setIncludeSingers(
      _includeSongs.filter((singer) => !singerConflicts.includes(singer))
    );
    _setExcludeSongs(
      _excludeSongs.filter((song) => !songsConflicts.includes(song))
    );
    _setIncludeSingers(
      _includeSingers.filter((singer) => !singerConflicts.includes(singer))
    );
    _setExcludeSingers(
      _excludeSingers.filter((singer) => !singerConflicts.includes(singer))
    );
  }
  function scopeMusic() {
    const manifests = music
      .filter((manifest) => {
        return (
          (manifest.fullLength >= minLength || minLength === -1) &&
          (manifest.fullLength <= maxLength || maxLength === -1)
        );
      })
      .filter((manifest) => {
        return (
          includeSongs.length === 0 ||
          manifest.songs
            .map((song) => song.songName)
            .filter((value) => includeSongs.includes(value)).length ===
            includeSongs.length
        );
      })
      .filter((manifest) => {
        return (
          includeSingers.length === 0 ||
          manifest.songs
            .map((songs) => songs.singer)
            .filter((value) => includeSingers.includes(value)).length ===
            includeSingers.length
        );
      })
      .filter((manifest) => {
        return (
          excludeSongs.length === 0 ||
          manifest.songs
            .map((song) => song.songName)
            .filter((value) => excludeSongs.includes(value)).length === 0
        );
      })
      .filter((manifest) => {
        return (
          excludeSingers.length === 0 ||
          manifest.songs
            .map((songs) => songs.singer)
            .filter((value) => excludeSingers.includes(value)).length === 0
        );
      });
    return manifests;
  }
  function fetchCurrentManifests(currentPage: number, pageSize: number) {
    const scopedMusic = scopeMusic();
    return scopedMusic.slice(
      (currentPage - 1) * pageSize,
      currentPage * pageSize
    );
  }
  function updateData(useCache: boolean) {
    return () => {
      setLoading(true);
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
          if (JSON.stringify(data.manifests) === JSON.stringify(manifests)) {
            if (manifests.length !== 0) {
              notification.warning({
                message: "数据无变化，无需更新",
              });
            }
          } else {
            if (manifests.length !== 0) {
              notification.success({
                message: "数据更新成功",
              });
            }
            setManifests(data.manifests);
            setMusic(data.music);
          }
          setLoading(false);
        })
        .catch((error) => {
          notification.error({
            message: "数据更新失败",
          });
          console.error(error);
          setLoading(false);
        });
    };
  }
  useEffect(() => {
    updateData(true)();
  }, []);
  return (
    <div className="self-center">
      <h1 className="text-center">全部歌曲方案查看</h1>
      <Space direction="vertical">
        <Button
          disabled={
            excludeSingers.length === 0 &&
            includeSingers.length === 0 &&
            excludeSongs.length === 0 &&
            includeSongs.length === 0 &&
            maxLength === -1 &&
            minLength === -1
          }
          onClick={() => {
            setIncludeSingers([]);
            setExcludeSingers([]);
            setIncludeSongs([]);
            setExcludeSongs([]);
            setMaxLength(-1);
            setMinLength(-1);
            _setIncludeSingers([]);
            _setExcludeSingers([]);
            _setIncludeSongs([]);
            _setExcludeSongs([]);
            _setMaxLength(-1);
            _setMinLength(-1);
          }}
        >
          清除所有条件
        </Button>
        <Space>
          包含歌手{" "}
          <Select
            value={_includeSingers}
            mode="tags"
            loptions={[
              ...new Set(
                manifests.map((item) => {
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
              _setIncludeSingers(args);
            }}
            style={{ width: "auto" }}
          />{" "}
          排除歌手
          <Select
            value={_excludeSingers}
            mode="tags"
            loptions={[
              ...new Set(
                manifests.map((item) => {
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
              _setExcludeSingers(args);
            }}
          ></Select>
          <Button
            onClick={() => {
              setIncludeSingers(_includeSingers);
              setExcludeSingers(_excludeSingers);
              removeConflict();
            }}
            disabled={
              includeSingers.toString() === _includeSingers.toString() &&
              excludeSingers.toString() === _excludeSingers.toString()
            }
          >
            应用
          </Button>
        </Space>
        <Space>
          包含歌曲{" "}
          <Select
            value={_includeSongs}
            loptions={[
              ...new Set(
                manifests.map((manifest, index) => {
                  return {
                    value: manifest.songName,
                    label: manifest.songName,
                    key: `music.${index}`,
                  };
                })
              ),
            ]}
            onChange={(args) => {
              _setIncludeSongs(args);
            }}
            style={{ width: "100%" }}
            mode="tags"
          />{" "}
          排除歌曲
          <Select
            style={{ width: "100%" }}
            mode="tags"
            value={_excludeSongs}
            loptions={[
              ...new Set(
                manifests.map((manifest, index) => {
                  return {
                    value: manifest.songName,
                    label: manifest.songName,
                    key: `music.${index}`,
                  };
                })
              ),
            ]}
            onChange={(args) => {
              _setExcludeSongs(args);
            }}
          ></Select>
          <Button
            onClick={() => {
              setIncludeSongs(_includeSongs);
              setExcludeSongs(_excludeSongs);
              removeConflict();
            }}
            disabled={
              includeSongs.toString() === _includeSongs.toString() &&
              excludeSongs.toString() === _excludeSongs.toString()
            }
          >
            应用
          </Button>
        </Space>
        <Space>
          最大长度{" "}
          <InputNumber
            value={_maxLength}
            onChange={(args) => {
              _setMaxLength(
                args == null || (args as number) < -1 ? maxLength : args
              );
            }}
          />{" "}
          <Button
            disabled={_maxLength === maxLength}
            onClick={() => {
              setMaxLength(_maxLength);
            }}
          >
            应用
          </Button>
          当前设置: {maxLength === -1 ? "无限制" : `${maxLength}秒`}
        </Space>
        <Space>
          最短长度{" "}
          <InputNumber
            value={_minLength}
            onChange={(args) => {
              _setMinLength(
                args == null || (args as number) < -1 ? minLength : args
              );
            }}
          />{" "}
          <Button
            disabled={_minLength === minLength}
            onClick={() => {
              setMinLength(_minLength);
            }}
          >
            应用
          </Button>
          当前设置: {minLength === -1 ? "无限制" : `${minLength}秒`}
        </Space>
        <Pagination
          showQuickJumper
          showTotal={(total) => `共 ${total} 种方案`}
          className="origin-center"
          onChange={(currentPage: number, pageSize: number) => {
            setCurrentPage(currentPage);
            setPageSize(pageSize);
          }}
          pageSize={pageSize}
          defaultCurrent={1}
          total={scopeMusic().length}
        />
      </Space>
      <List
        loading={loading}
        itemLayout="vertical"
        dataSource={fetchCurrentManifests(currentPage, pageSize)}
        renderItem={(item) => (
          <List.Item>
            <List.Item.Meta
              title={`方案 ${music.indexOf(item) + 1}`}
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
      <Button loading={loading} onClick={updateData(false)}>
        获取最新数据
      </Button>
    </div>
  );
};

export default SelectMusic;
