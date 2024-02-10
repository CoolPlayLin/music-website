import React, { useState, useEffect } from "react";
import type { Song } from "../utils/types";
import { fetchData } from "../utils/web";
import { Button, Pagination, notification, Space, List } from "antd";

const Music: React.FC = () => {
  const [music, setMusic] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  function updateData(useCache: boolean) {
    return () => {
      setLoading(true);
      fetchData(useCache)(
        "https://gh.xfisxf.top/https://raw.githubusercontent.com/CoolPlayLin/music-manifests/master/src/config/music.json"
      )
        .then((res) => res.json())
        .then((data) => {
          console.log("time");
          if (data.toString() === music.toString()) {
            if (music.length !== 0) {
              notification.warning({
                message: "数据无变化，无需更新",
              });
            }
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
  function fetchCurrentManifests(currentPage: number, pageSize: number) {
    return music.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  }

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
            <List.Item>
              {items.songName} | {items.singer}
            </List.Item>
          </List.Item>
        )}
      ></List>
    </div>
  );
};

export default Music;
