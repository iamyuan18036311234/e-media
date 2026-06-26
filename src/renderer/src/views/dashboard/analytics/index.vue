<script lang="ts" setup>
import { ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons-vue'
import { Card, Col, Row, Statistic, Table, Typography } from 'ant-design-vue'

defineOptions({ name: 'Analytics' })

const stats = [
  { title: '视频总数', value: 1280, prefix: '', suffix: '个', up: true, delta: '12.5%' },
  { title: '今日播放', value: 38420, prefix: '', suffix: '次', up: true, delta: '8.2%' },
  { title: '在线用户', value: 256, prefix: '', suffix: '人', up: false, delta: '3.1%' },
  { title: '存储用量', value: 68.5, prefix: '', suffix: 'GB', up: true, delta: '5.7%' }
]

const columns = [
  { title: '名称', dataIndex: 'name' },
  { title: '类型', dataIndex: 'type' },
  { title: '大小', dataIndex: 'size' },
  { title: '更新时间', dataIndex: 'time' },
  { title: '状态', dataIndex: 'status' }
]

const dataSource = [
  {
    key: '1',
    name: '产品介绍.mp4',
    type: '视频',
    size: '128 MB',
    time: '2026-06-25 14:30',
    status: '已发布'
  },
  {
    key: '2',
    name: '培训课程-01.mp4',
    type: '视频',
    size: '256 MB',
    time: '2026-06-24 09:15',
    status: '处理中'
  },
  {
    key: '3',
    name: '宣传片.mov',
    type: '视频',
    size: '512 MB',
    time: '2026-06-23 18:42',
    status: '已发布'
  },
  {
    key: '4',
    name: '会议录屏.mp4',
    type: '视频',
    size: '89 MB',
    time: '2026-06-22 11:20',
    status: '草稿'
  }
]
</script>

<template>
  <div class="analytics-view">
    <Typography.Title :level="4" style="margin-bottom: 16px">分析页</Typography.Title>

    <Row :gutter="16">
      <Col v-for="s in stats" :key="s.title" :xs="24" :sm="12" :lg="6">
        <Card class="stat-card">
          <Statistic :title="s.title" :value="s.value" :suffix="s.suffix" />
          <div class="delta" :class="{ up: s.up, down: !s.up }">
            <component :is="s.up ? ArrowUpOutlined : ArrowDownOutlined" />
            <span>{{ s.delta }}</span>
            <span class="vs">较昨日</span>
          </div>
        </Card>
      </Col>
    </Row>

    <Card title="最近视频" style="margin-top: 16px">
      <Table :columns="columns" :data-source="dataSource" :pagination="false" size="middle" />
    </Card>

    <div class="mock-tag">数据为模拟，仅用于布局演示</div>
  </div>
</template>

<style scoped>
.analytics-view {
  padding: 4px;
}
.stat-card {
  margin-bottom: 16px;
}
.delta {
  margin-top: 8px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}
.delta.up {
  color: #52c41a;
}
.delta.down {
  color: #ff4d4f;
}
.delta .vs {
  color: rgba(0, 0, 0, 0.4);
  margin-left: 4px;
}
.mock-tag {
  text-align: center;
  font-size: 12px;
  color: rgba(22, 119, 255, 0.6);
  margin-top: 16px;
}
</style>
