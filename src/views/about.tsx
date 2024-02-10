import React, { useState } from "react";
import { Typography, Switch, Space } from "antd";

const { Title, Paragraph, Text } = Typography;

const About: React.FC = () => {
  const [lang, setLang] = useState("CN");

  return (
    <div>
      <Space direction="vertical">
        <Switch
          defaultChecked
          checkedChildren="中文"
          unCheckedChildren="English"
          onChange={(args) => {
            setLang(args ? "CN" : "EN");
          }}
        />
        <Typography>
          <Title>{lang === "CN" ? "关于本网站" : "About the website"}</Title>
          <Paragraph>
            {lang === "CN"
              ? "本网站是由 CoolPlayLin 搭建的网站，你可以在上面使用你喜欢的内容"
              : "This is a personal website which was built by CoolPlayLin You can choose links above to use feature that you like."}
          </Paragraph>
          <Paragraph>
            <Text strong>
              {lang === "CN"
                ? "如果你想投稿更多的音乐，请要求本站作者提供更多信息"
                : "If you want to add more music that you like, ask the CoolPalyLin to get more info."}
            </Text>
          </Paragraph>
        </Typography>
      </Space>
    </div>
  );
};

export default About;
