<script lang="ts" setup>
import { Card, Col, Row, Typography } from 'ant-design-vue'

defineOptions({ name: 'Workspace' })

const shortcuts = [
  { title: '上传视频', desc: '上传新的视频文件', color: '#1677ff' },
  { title: '视频列表', desc: '管理所有视频资源', color: '#52c41a' },
  { title: '转码任务', desc: '查看转码进度', color: '#faad14' },
  { title: '系统设置', desc: '配置系统参数', color: '#722ed1' }
]

const todo = [
  { id: 1, title: '上传宣传视频', status: '进行中' },
  { id: 2, title: '审核用户提交', status: '待处理' },
  { id: 3, title: '清理过期缓存', status: '已完成' }
]
</script>

<template>
  <div class="workspace-view">
    <Typography.Title :level="4" style="margin-bottom: 16px">工作台</Typography.Title>

    <Row :gutter="16">
      <Col :xs="24" :lg="16">
        <Card title="快捷入口">
          <Row :gutter="[16, 16]">
            <Col v-for="s in shortcuts" :key="s.title" :xs="12" :sm="6">
              <div class="shortcut" :style="{ '--c': s.color } as any">
                <div class="shortcut-icon"></div>
                <div class="shortcut-title">{{ s.title }}</div>
                <div class="shortcut-desc">{{ s.desc }}</div>
              </div>
            </Col>
          </Row>
        </Card>
      </Col>
      <Col :xs="24" :lg="8">
        <Card title="待办事项">
          <div v-for="t in todo" :key="t.id" class="todo-item">
            <span class="todo-title">{{ t.title }}</span>
            <span class="todo-status" :class="t.status">{{ t.status }}</span>
          </div>
        </Card>
      </Col>
    </Row>

    <div class="mock-tag">数据为模拟，仅用于布局演示</div>
  </div>
</template>

<style scoped>
.shortcut {
  padding: 16px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.02);
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
}
.shortcut:hover {
  background: var(--c);
  color: #fff;
  transform: translateY(-2px);
}
.shortcut-icon {
  width: 40px;
  height: 40px;
  margin: 0 auto 10px;
  border-radius: 10px;
  background: var(--c);
}
.shortcut:hover .shortcut-icon {
  background: rgba(255, 255, 255, 0.3);
}
.shortcut-title {
  font-weight: 500;
  margin-bottom: 4px;
}
.shortcut-desc {
  font-size: 12px;
  opacity: 0.7;
}
.todo-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}
.todo-item:last-child {
  border-bottom: none;
}
.todo-status {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 10px;
}
.todo-status.进行中 {
  background: rgba(22, 119, 255, 0.1);
  color: #1677ff;
}
.todo-status.待处理 {
  background: rgba(250, 173, 20, 0.1);
  color: #faad14;
}
.todo-status.已完成 {
  background: rgba(82, 196, 26, 0.1);
  color: #52c41a;
}
.mock-tag {
  text-align: center;
  font-size: 12px;
  color: rgba(22, 119, 255, 0.6);
  margin-top: 16px;
}
</style>
