<script lang="ts" setup>
import { Card, Tag } from 'ant-design-vue'

defineOptions({ name: 'About' })

const stack = [
  { label: '框架', value: 'Vue 3 + TypeScript + Electron' },
  { label: 'UI 库', value: 'Ant Design Vue' },
  { label: '路由', value: 'Vue Router 4' },
  { label: '状态', value: 'Pinia' },
  { label: '构建', value: 'electron-vite + electron-builder' },
  { label: '布局参照', value: 'vben-admin apps/web-antd' },
  { label: '数据', value: 'Mock（VITE_USE_MOCK=true）' }
]
</script>

<template>
  <div class="about-view p-4">
    <Card title="关于本项目">
      <p class="intro">
        流光视频（lx-video）桌面端，布局对齐 vben-admin web-antd 架构。
        当前为模拟数据阶段，未包含具体业务视图。
      </p>
      <div class="stack-list">
        <div v-for="item in stack" :key="item.label" class="stack-item">
          <span class="stack-label">{{ item.label }}</span>
          <Tag color="blue">{{ item.value }}</Tag>
        </div>
      </div>
    </Card>
  </div>
</template>

<style scoped>
.about-view {
  height: 100%;
}

.intro {
  margin-bottom: 20px;
  color: rgba(0, 0, 0, 0.65);
  line-height: 1.8;
}

.stack-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
}

.stack-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 6px;
}

.stack-label {
  color: rgba(0, 0, 0, 0.55);
  font-size: 13px;
}
</style>
