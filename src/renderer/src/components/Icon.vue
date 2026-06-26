<script lang="ts" setup>
import {
  AppstoreOutlined,
  AreaChartOutlined,
  BookOutlined,
  CopyrightOutlined,
  DashboardOutlined,
  InfoCircleOutlined,
  SettingOutlined
} from '@ant-design/icons-vue'
import { computed, h } from 'vue'

const props = defineProps<{ icon?: string; size?: number }>()

/** iconify 名称到 antd 图标的映射（项目用到的子集） */
const iconMap: Record<string, ReturnType<typeof h>> = {
  'lucide:layout-dashboard': h(DashboardOutlined),
  'lucide:area-chart': h(AreaChartOutlined),
  'carbon:workspace': h(AppstoreOutlined),
  'lucide:info': h(InfoCircleOutlined),
  'lucide:copyright': h(CopyrightOutlined),
  'lucide:component': h(AppstoreOutlined),
  'lucide:book-open-text': h(BookOutlined),
  'lucide:settings': h(SettingOutlined)
}

const rendered = computed(() => {
  if (!props.icon) return h(AppstoreOutlined)
  return iconMap[props.icon] ?? h(AppstoreOutlined)
})
</script>

<template>
  <span class="inline-flex items-center justify-center" :style="{ fontSize: (size ?? 16) + 'px' }">
    <component :is="rendered" />
  </span>
</template>
