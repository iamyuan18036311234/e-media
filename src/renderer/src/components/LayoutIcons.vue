<script lang="ts" setup>
/**
 * 布局示意图标组件（对齐 web-antd preferences/icons）
 * 用于偏好设置抽屉中的布局模式选择
 */
import type { Component } from 'vue'
import SidebarNav from './layout-icons/SidebarNav.vue'
import SidebarMixedNav from './layout-icons/SidebarMixedNav.vue'
import HeaderNav from './layout-icons/HeaderNav.vue'
import HeaderSidebarNav from './layout-icons/HeaderSidebarNav.vue'
import MixedNav from './layout-icons/MixedNav.vue'
import HeaderMixedNav from './layout-icons/HeaderMixedNav.vue'
import FullContent from './layout-icons/FullContent.vue'
import ContentCompact from './layout-icons/ContentCompact.vue'

defineProps<{
  /** 布局类型 */
  type?:
  | 'sidebar-nav'
  | 'sidebar-mixed-nav'
  | 'header-nav'
  | 'header-sidebar-nav'
  | 'mixed-nav'
  | 'header-mixed-nav'
  | 'full-content'
  | 'content-compact'
  | 'content-wide'
}>()

// ContentWide 复用 HeaderNav（对齐 web-antd icons/index.ts）
const components: Record<string, Component> = {
  'sidebar-nav': SidebarNav,
  'sidebar-mixed-nav': SidebarMixedNav,
  'header-nav': HeaderNav,
  'header-sidebar-nav': HeaderSidebarNav,
  'mixed-nav': MixedNav,
  'header-mixed-nav': HeaderMixedNav,
  'full-content': FullContent,
  'content-compact': ContentCompact,
  'content-wide': HeaderNav
}
</script>

<template>
  <component :is="components[type || 'sidebar-nav']" />
</template>
