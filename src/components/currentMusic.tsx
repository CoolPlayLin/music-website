import React, { useEffect, useState } from "react";
import { Button, Pagination, notification, Space, List } from "antd";
import { fetchData } from "../utils/web";
import type { Song } from "../utils/types";

interface CurrentMusic {
  date: string;
  fullLength: number;
  songs: Song[];
}

const CurrentManifests: React.FC = () => {
  const [music, setMusic] = useState<CurrentMusic[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  function fetchCurrentManifests(currentPage: number, pageSize: number) {
    return music.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  }
  function updateData(useCache: boolean) {
    return () => {
      setLoading(true);
      fetchData(useCache)(
        "https://gh.xfisxf.top/https://raw.githubusercontent.com/CoolPlayLin/music-manifests/master/public/current.json"
      )
        .then((res) => res.json())
        .then((data) => {
          if (music.toString() === data.toString()) {
            notification.warning({
              message: "数据无变化，无需更新",
            });
          } else {
            if (music.length !== 0) {
              notification.success({
                message: "数据更新成功",
              });
            }
            setMusic(data);
          }
          setLoading(false);
        })
        .catch((error) => {
          if (music.length !== 0) {
            notification.error({
              message: "数据更新失败",
            });
          }
          console.error(error);
          setLoading(false);
        });
    };
  }
  useEffect(() => {
    updateData(true)();
  }, []);
  return (
    <div>
      <Space>
        <Button onClick={updateData(false)} loading={loading}>
          更新数据
        </Button>
        <Pagination
          showQuickJumper
          showTotal={(total) => `一共 ${total} 条结果`}
          onChange={(currentPage: number, pageSize: number) => {
            setCurrentPage(currentPage);
            setPageSize(pageSize);
          }}
          pageSize={pageSize}
          defaultCurrent={1}
          total={music.length}
        ></Pagination>
      </Space>
      <List
        loading={loading}
        itemLayout="vertical"
        dataSource={fetchCurrentManifests(currentPage, pageSize)}
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
};

export default CurrentManifests;
