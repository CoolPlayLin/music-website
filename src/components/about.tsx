import React from "react";
import { Typography, Switch, Space } from "antd";

const { Title, Paragraph, Text } = Typography;

class About extends React.Component {
  state: Readonly<{ lang: "EN" | "CN" }>;
  constructor(props: Readonly<unknown>) {
    super(props);
    this.state = {
      lang: "CN",
    };
  }
  render() {
    return (
      <div>
        <Space direction="vertical">
          <Switch
            defaultChecked
            checkedChildren="中文"
            unCheckedChildren="English"
            onChange={(args) => {
              this.setState({ lang: args ? "CN" : "EN" });
            }}
          />
          <Typography>
            <Title>
              {this.state.lang === "CN" ? "关于本网站" : "About the website"}
            </Title>
            <Paragraph>
              {this.state.lang === "CN"
                ? "本网站是由 CoolPlayLin 搭建的网站，你可以在上面使用你喜欢的内容"
                : "This is a personal website which was built by CoolPlayLin You can choose links above to use feature that you like."}
            </Paragraph>
            <Paragraph>
              <Text strong>
                {this.state.lang === "CN"
                  ? "如果你想投稿更多的音乐，请要求本站作者提供更多信息"
                  : "If you want to add more music that you like, ask the CoolPalyLin to get more info."}
              </Text>
            </Paragraph>
          </Typography>
        </Space>
      </div>
    );
  }
}

export default About;
