<script lang="ts" setup>
import {
  Alert,
  Button,
  Card,
  DatePicker,
  Input,
  message,
  Modal,
  Select,
  Switch,
  Tag
} from 'ant-design-vue'

defineOptions({ name: 'DemosAntd' })

function notify(): void {
  message.success('操作成功（模拟）')
}
function confirm(): void {
  Modal.confirm({
    title: '确认操作',
    content: '这是一个模拟确认框',
    onOk: () => message.success('已确认')
  })
}
</script>

<template>
  <div class="demos-antd">
    <Card title="Antd 组件演示" style="margin-bottom: 16px">
      <div class="row">
        <span>按钮：</span>
        <Button type="primary" @click="notify">主要按钮</Button>
        <Button @click="notify">默认</Button>
        <Button type="dashed">虚线</Button>
        <Button type="link">链接</Button>
        <Button danger @click="notify">危险</Button>
      </div>
      <div class="row">
        <span>输入：</span>
        <Input placeholder="文本框" style="width: 200px" />
        <Select style="width: 160px" placeholder="下拉" :options="[
          { label: '选项1', value: '1' },
          { label: '选项2', value: '2' }
        ]" />
        <DatePicker placeholder="日期" />
        <Switch checked-children="开" un-checked-children="关" />
      </div>
      <div class="row">
        <span>交互：</span>
        <Button @click="confirm">弹确认框</Button>
      </div>
    </Card>

    <Card title="标签与提示">
      <div class="row">
        <Tag color="magenta">标签1</Tag>
        <Tag color="red">标签2</Tag>
        <Tag color="volcano">标签3</Tag>
        <Tag color="orange">标签4</Tag>
        <Tag color="gold">标签5</Tag>
        <Tag color="lime">标签6</Tag>
        <Tag color="green">标签7</Tag>
        <Tag color="cyan">标签8</Tag>
        <Tag color="blue">标签9</Tag>
        <Tag color="geekblue">标签10</Tag>
      </div>
      <Alert style="margin-top: 12px" type="info" message="这是一个提示信息" show-icon />
      <Alert style="margin-top: 8px" type="success" message="操作成功" show-icon />
      <Alert style="margin-top: 8px" type="warning" message="注意警告" show-icon />
      <Alert style="margin-top: 8px" type="error" message="发生错误" show-icon />
    </Card>

    <div class="mock-tag">用于验证 antd 组件在布局中正常渲染</div>
  </div>
</template>

<style scoped>
.row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.row>span:first-child {
  width: 60px;
  color: hsl(var(--muted-foreground));
  font-size: 13px;
}

.mock-tag {
  text-align: center;
  font-size: 12px;
  color: rgba(22, 119, 255, 0.6);
  margin-top: 16px;
}
</style>
