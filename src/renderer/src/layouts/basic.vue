<script lang="ts" setup>
import type { MenuRecord } from '#/router/access'
import type { ContextMenuItem } from '#/components/tabs'
import { computed, h, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  BellOutlined,
  BulbOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SettingOutlined,
  UserOutlined
} from '@ant-design/icons-vue'
import {
  Avatar,
  Badge,
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Dropdown,
  Layout,
  LayoutContent,
  LayoutHeader,
  LayoutSider,
  Tooltip
} from 'ant-design-vue'
import { storeToRefs } from 'pinia'
import { preferences, usePreferences } from '#/preferences'
import { useAccessStore } from '#/store/access'
import { useAuthStore } from '#/store/auth'
import { useTabsStore } from '#/store/tabs'
import { useUserStore } from '#/store/user'
import Icon from '#/components/Icon.vue'
import Updater from '#/components/Updater.vue'
import { TabsToolMore, TabsToolRefresh, TabsToolScreen, TabsView, useTabbar } from '#/components/tabs'

defineOptions({ name: 'BasicLayout' })

const router = useRouter()
const route = useRoute()
const { isDark, isMobile } = usePreferences()
const accessStore = useAccessStore()
const userStore = useUserStore()
const authStore = useAuthStore()
const tabsStore = useTabsStore()
const { accessMenus } = storeToRefs(accessStore)

/** 用户信息（安全访问，避免 null 报错） */
const userInfo = computed(() => userStore.userInfo)

/** 布局模式 */
const isTopNav = computed(() => preferences.app.layout === 'top-nav')
const isSideNav = computed(() => !isTopNav.value)

/** 侧边栏折叠 */
const collapsed = computed({
  get: () => preferences.sidebar.collapsed,
  set: (v) => (preferences.sidebar.collapsed = v)
})

function toggleCollapse() {
  collapsed.value = !collapsed.value
}

/** 切换主题 */
function toggleTheme() {
  preferences.theme.mode = isDark.value ? 'light' : 'dark'
}

/** 过滤后的菜单（用于自定义菜单渲染） */
const filteredMenus = computed(() =>
  accessMenus.value.filter((m) => !m.hideInMenu)
)

/** 递归过滤子菜单 */
function filterChildren(menus?: MenuRecord[]): MenuRecord[] {
  if (!menus) return []
  return menus.filter((m) => !m.hideInMenu)
}

/** 自定义菜单：展开的子菜单 key 列表 */
const openKeys = ref<string[]>([])

function onToggleMenu(key: string) {
  const idx = openKeys.value.indexOf(key)
  if (idx >= 0) {
    openKeys.value.splice(idx, 1)
  } else {
    openKeys.value.push(key)
  }
}

/** 当前选中的菜单项（按完整路径匹配） */
const selectedKeys = ref<string[]>([])
watch(
  () => route.path,
  (path) => {
    selectedKeys.value = [path]
  },
  { immediate: true }
)

/** 菜单点击 → 导航 */
function onMenuClick({ key }: { key: string | number }) {
  const path = String(key)
  if (path && path !== route.path) {
    router.push(path)
  }
}

/** 面包屑（取匹配路由的 meta.title） */
const breadcrumbItems = computed(() => {
  return route.matched
    .filter((r) => r.meta?.title && !r.meta?.hideInBreadcrumb)
    .map((r) => ({ title: String(r.meta!.title), path: r.path }))
})

/** 多标签（对齐 vben-admin tabbar 行为） */

/** 内容最大化状态（隐藏侧边栏/面包屑/通知等） */
const contentIsMaximize = ref(false)
function toggleMaximize() {
  contentIsMaximize.value = !contentIsMaximize.value
}

/** 刷新当前页（通过 key 强制重新挂载 RouterView） */
const refreshKey = ref(0)
function refreshTab() {
  refreshKey.value++
}

const {
  createContextMenus,
  currentActive,
  currentTabs,
  handleClose,
  handleClick
} = useTabbar({
  contentIsMaximize: computed(() => contentIsMaximize.value),
  refresh: refreshTab,
  toggleMaximize
})

/** 右键菜单（响应式构建） */
const tabbarMenus = computed<ContextMenuItem[]>(() => {
  const tab = tabsStore.getTabByKey(currentActive.value)
  return tab ? createContextMenus(tab) : []
})

/** 工具栏「更多」按钮的菜单（基于当前激活 tab） */
const moreMenus = computed(() => tabbarMenus.value)

function onMoreMenuClick(key: string) {
  const item = tabbarMenus.value.find((m) => m.key === key)
  item?.handler?.()
}

/** 监听路由变化 → 添加标签 */
watch(
  () => route.fullPath,
  () => {
    tabsStore.addTab(route)
  },
  { immediate: true }
)

/** 初始化固定标签（从路由表抽取 affixTab 路由） */
onMounted(() => {
  tabsStore.setAffixTabs(router.getRoutes() as any)
})

/** 关闭/取消固定事件转发 */
function onTabClose(key: string) {
  handleClose(key)
}

function onSortTabs(sourceKey: string, targetKey: string) {
  tabsStore.sortTabs(sourceKey, targetKey)
}

function onTabUnpin(tab: any) {
  tabsStore.toggleTabPin(tab)
}

function onTabActiveChange(key: string) {
  handleClick(key)
}

/** 用户下拉菜单 */
const userMenu = [
  { key: 'profile', icon: () => h(UserOutlined), label: '个人中心' },
  { key: 'preferences', icon: () => h(SettingOutlined), label: '偏好设置' },
  { type: 'divider' as const },
  { key: 'logout', icon: () => h(LogoutOutlined), label: '退出登录', danger: true }
]

function onUserMenuClick({ key }: { key: string | number }) {
  const k = String(key)
  if (k === 'logout') {
    authStore.logout()
  } else if (k === 'preferences') {
    router.push('/preferences')
  } else if (k === 'profile') {
    router.push('/profile')
  }
}

/** 通知（模拟数据） */
const notifications = reactive([
  { id: 1, title: '欢迎使用流光视频', desc: '系统已初始化完成', read: false, time: '刚刚' },
  { id: 2, title: '模拟数据已启用', desc: '当前 VITE_USE_MOCK=true', read: false, time: '1分钟前' },
  { id: 3, title: '布局对齐完成', desc: '参照 vben web-antd 完成', read: true, time: '5分钟前' }
])
const unreadCount = computed(() => notifications.filter((n) => !n.read).length)
function markAllRead() {
  notifications.forEach((n) => (n.read = true))
}
</script>

<template>
  <Layout class="basic-layout h-screen w-screen overflow-hidden" :class="{ 'is-content-maximize': contentIsMaximize }">
    <!-- 侧边栏（side-nav / mixed-nav 模式） -->
    <LayoutSider v-if="isSideNav && preferences.sidebar.visible" v-model:collapsed="collapsed"
      :width="preferences.sidebar.width" :collapsed-width="preferences.sidebar.collapsedWidth" :trigger="null"
      collapsible class="layout-sider" :class="{ 'sider-collapsed': collapsed }">
      <!-- Logo -->
      <div v-if="preferences.logo.visible" class="logo-wrap">
        <div class="logo-badge">流</div>
        <span v-show="!collapsed" class="logo-text">流光视频</span>
      </div>

      <!-- 自定义侧边菜单（避免 antd Menu 的 useInjectMenu 上下文断链问题） -->
      <ul class="side-menu-custom">
        <template v-for="menu in filteredMenus" :key="menu.path">
          <!-- 有子菜单 -->
          <li v-if="filterChildren(menu.children).length" class="menu-group">
            <div class="menu-title" :class="{ active: openKeys.includes(menu.path) }" @click="onToggleMenu(menu.path)">
              <Icon v-if="menu.icon" :icon="menu.icon" :size="16" />
              <span class="menu-text">{{ menu.title || menu.name }}</span>
              <span class="menu-arrow" :class="{ open: openKeys.includes(menu.path) }">›</span>
            </div>
            <ul v-show="openKeys.includes(menu.path)" class="menu-sub">
              <li v-for="child in filterChildren(menu.children)" :key="child.path" class="menu-item"
                :class="{ selected: selectedKeys.includes(child.path) }" @click="onMenuClick({ key: child.path })">
                <Icon v-if="child.icon" :icon="child.icon" :size="14" />
                <span class="menu-text">{{ child.title || child.name }}</span>
              </li>
            </ul>
          </li>
          <!-- 无子菜单 -->
          <li v-else class="menu-item" :class="{ selected: selectedKeys.includes(menu.path) }"
            @click="onMenuClick({ key: menu.path })">
            <Icon v-if="menu.icon" :icon="menu.icon" :size="16" />
            <span class="menu-text">{{ menu.title || menu.name }}</span>
          </li>
        </template>
      </ul>
    </LayoutSider>

    <Layout class="layout-main">
      <!-- 顶部 -->
      <LayoutHeader class="layout-header">
        <div class="header-left">
          <Button type="text" class="collapse-trigger" @click="toggleCollapse">
            <component :is="collapsed ? MenuUnfoldOutlined : MenuFoldOutlined" />
          </Button>

          <Breadcrumb v-if="preferences.breadcrumb.enable && !isMobile" class="header-breadcrumb">
            <BreadcrumbItem v-for="(b, i) in breadcrumbItems" :key="i">
              {{ b.title }}
            </BreadcrumbItem>
          </Breadcrumb>

          <!-- 顶部导航菜单（top-nav 模式，自定义实现） -->
          <ul v-if="isTopNav" class="top-menu-custom">
            <template v-for="menu in filteredMenus" :key="menu.path">
              <li v-if="filterChildren(menu.children).length" class="top-menu-group">
                <div class="top-menu-title" :class="{ active: openKeys.includes(menu.path) }"
                  @click="onToggleMenu(menu.path)">
                  <Icon v-if="menu.icon" :icon="menu.icon" :size="16" />
                  <span>{{ menu.title || menu.name }}</span>
                  <span class="menu-arrow" :class="{ open: openKeys.includes(menu.path) }">›</span>
                </div>
                <ul v-show="openKeys.includes(menu.path)" class="top-menu-sub">
                  <li v-for="child in filterChildren(menu.children)" :key="child.path" class="top-menu-item"
                    :class="{ selected: selectedKeys.includes(child.path) }" @click="onMenuClick({ key: child.path })">
                    {{ child.title || child.name }}
                  </li>
                </ul>
              </li>
              <li v-else class="top-menu-item" :class="{ selected: selectedKeys.includes(menu.path) }"
                @click="onMenuClick({ key: menu.path })">
                <Icon v-if="menu.icon" :icon="menu.icon" :size="16" />
                <span>{{ menu.title || menu.name }}</span>
              </li>
            </template>
          </ul>
        </div>

        <div class="header-right">
          <!-- 主题切换 -->
          <Tooltip :title="isDark ? '切换为亮色' : '切换为暗色'">
            <Button type="text" class="header-btn" @click="toggleTheme">
              <BulbOutlined />
            </Button>
          </Tooltip>

          <!-- 增量更新 -->
          <Updater />

          <!-- 通知 -->
          <Dropdown placement="bottomRight">
            <Badge :count="unreadCount" :offset="[-2, 4]">
              <Button type="text" class="header-btn">
                <BellOutlined />
              </Button>
            </Badge>
            <template #overlay>
              <div class="notif-panel">
                <div class="notif-header">
                  <span>通知</span>
                  <Button type="link" size="small" @click="markAllRead">全部已读</Button>
                </div>
                <div class="notif-list">
                  <div v-for="n in notifications" :key="n.id" class="notif-item" :class="{ unread: !n.read }">
                    <div class="notif-title">{{ n.title }}</div>
                    <div class="notif-desc">{{ n.desc }}</div>
                    <div class="notif-time">{{ n.time }}</div>
                  </div>
                </div>
              </div>
            </template>
          </Dropdown>

          <!-- 用户下拉 -->
          <Dropdown placement="bottomRight" :menu="{ items: userMenu, onClick: onUserMenuClick }">
            <div class="user-trigger">
              <Avatar :size="32" :src="userInfo?.avatar">
                {{ userInfo?.username?.charAt(0).toUpperCase() }}
              </Avatar>
              <span v-if="!isMobile" class="user-name">{{ userInfo?.realName }}</span>
            </div>
          </Dropdown>
        </div>
      </LayoutHeader>

      <!-- 多标签 -->
      <div v-if="preferences.tabbar.enable" class="tabbar">
        <TabsView v-model:active="currentActive" :context-menus="createContextMenus"
          :draggable="preferences.tabbar.draggable" :middle-click-to-close="preferences.tabbar.middleClickToClose"
          :show-icon="preferences.tabbar.showIcon" :style-type="preferences.tabbar.styleType" :tabs="currentTabs"
          :wheelable="preferences.tabbar.wheelable" @close="onTabClose" @sort-tabs="onSortTabs" @unpin="onTabUnpin"
          @update:active="onTabActiveChange" />
        <div class="tabbar-tools flex h-full items-center">
          <TabsToolMore v-if="preferences.tabbar.showMore" :menus="moreMenus" @click="onMoreMenuClick" />
          <TabsToolRefresh v-if="preferences.tabbar.showRefresh" @refresh="refreshTab" />
          <TabsToolScreen v-if="preferences.tabbar.showMaximize" :screen="contentIsMaximize" @change="toggleMaximize"
            @update:screen="toggleMaximize" />
        </div>
      </div>

      <!-- 内容区 -->
      <LayoutContent class="layout-content" :class="{ 'is-maximized': contentIsMaximize }">
        <RouterView v-slot="{ Component }">
          <Transition name="fade-slide" mode="out-in">
            <component :is="Component" :key="refreshKey" />
          </Transition>
        </RouterView>
      </LayoutContent>
    </Layout>
  </Layout>
</template>

<style scoped>
.basic-layout {
  --primary: v-bind('preferences.theme.colorPrimary');
  --header-h: 56px;
  --tabbar-h: 38px;
  --sider-bg: #fff;
  --content-bg: #f5f5f5;
}

:global(html.dark) .basic-layout {
  --sider-bg: #1a1a1a;
  --content-bg: #141414;
}

/* 内容最大化：隐藏侧边栏与顶栏 */
.basic-layout.is-content-maximize .layout-sider,
.basic-layout.is-content-maximize .layout-header {
  display: none !important;
}

.layout-sider {
  background: var(--sider-bg) !important;
  box-shadow: 1px 0 0 rgba(0, 0, 0, 0.06);
}

/* 自定义侧边菜单 */
.side-menu-custom {
  list-style: none;
  padding: 8px 0;
  margin: 0;
  background: transparent;
  flex: 1;
  overflow-y: auto;
}

.menu-group {
  margin-bottom: 2px;
}

.menu-title {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 40px;
  padding: 0 16px 0 20px;
  margin: 0 8px;
  border-radius: 6px;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.75);
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;
}

.menu-title:hover {
  background: rgba(0, 0, 0, 0.06);
}

.menu-title.active {
  color: var(--primary);
}

.menu-text {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.menu-arrow {
  transition: transform 0.2s;
  transform: rotate(0deg);
  font-size: 16px;
  color: rgba(0, 0, 0, 0.45);
}

.menu-arrow.open {
  transform: rotate(90deg);
}

.menu-sub {
  list-style: none;
  padding: 0;
  margin: 0;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 36px;
  padding: 0 16px 0 44px;
  margin: 0 8px;
  border-radius: 6px;
  font-size: 13px;
  color: rgba(0, 0, 0, 0.65);
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;
}

.menu-item:hover {
  background: rgba(0, 0, 0, 0.06);
}

.menu-item.selected {
  background: var(--primary);
  color: #fff;
}

/* 折叠态隐藏文字 */
.sider-collapsed .menu-text,
.sider-collapsed .menu-arrow,
.sider-collapsed .menu-sub {
  display: none;
}

.sider-collapsed .menu-title,
.sider-collapsed .menu-item {
  justify-content: center;
  padding: 0;
}

:global(html.dark) .menu-title {
  color: rgba(255, 255, 255, 0.75);
}

:global(html.dark) .menu-title:hover {
  background: rgba(255, 255, 255, 0.08);
}

:global(html.dark) .menu-item {
  color: rgba(255, 255, 255, 0.65);
}

:global(html.dark) .menu-item:hover {
  background: rgba(255, 255, 255, 0.08);
}

/* Logo */
.logo-wrap {
  height: var(--header-h);
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 18px;
  overflow: hidden;
}

.logo-badge {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: linear-gradient(135deg, var(--primary), #e8743c);
  color: #fff;
  font-weight: 700;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.logo-text {
  font-size: 16px;
  font-weight: 600;
  white-space: nowrap;
}

/* Header */
.layout-header {
  height: var(--header-h) !important;
  line-height: var(--header-h) !important;
  padding: 0 16px !important;
  background: var(--sider-bg) !important;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.06);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.collapse-trigger {
  font-size: 18px;
}

.header-breadcrumb {
  font-size: 14px;
}

/* 自定义顶部菜单 */
.top-menu-custom {
  list-style: none;
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
  height: 100%;
  margin: 0;
  padding: 0;
}

.top-menu-group {
  position: relative;
  height: 100%;
  display: flex;
  align-items: center;
}

.top-menu-title {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 36px;
  padding: 0 12px;
  border-radius: 6px;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.75);
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;
}

.top-menu-title:hover {
  background: rgba(0, 0, 0, 0.06);
}

.top-menu-title.active {
  color: var(--primary);
}

.top-menu-sub {
  list-style: none;
  position: absolute;
  top: 100%;
  left: 0;
  min-width: 160px;
  background: var(--sider-bg);
  border-radius: 8px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
  padding: 4px;
  margin: 4px 0 0;
  z-index: 100;
}

.top-menu-item {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 36px;
  padding: 0 12px;
  border-radius: 6px;
  font-size: 13px;
  color: rgba(0, 0, 0, 0.65);
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;
  white-space: nowrap;
}

.top-menu-item:hover {
  background: rgba(0, 0, 0, 0.06);
}

.top-menu-item.selected {
  background: var(--primary);
  color: #fff;
}

:global(html.dark) .top-menu-title,
:global(html.dark) .top-menu-item {
  color: rgba(255, 255, 255, 0.75);
}

:global(html.dark) .top-menu-title:hover,
:global(html.dark) .top-menu-item:hover {
  background: rgba(255, 255, 255, 0.08);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-btn {
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 0 8px;
  border-radius: 6px;
  height: 40px;
}

.user-trigger:hover {
  background: rgba(0, 0, 0, 0.04);
}

.user-name {
  font-size: 14px;
  white-space: nowrap;
}

/* 通知面板 */
.notif-panel {
  width: 320px;
  background: var(--sider-bg);
  border-radius: 8px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
  overflow: hidden;
}

.notif-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  font-weight: 600;
}

.notif-list {
  max-height: 360px;
  overflow-y: auto;
}

.notif-item {
  padding: 10px 14px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
  cursor: pointer;
}

.notif-item.unread {
  background: rgba(22, 119, 255, 0.04);
}

.notif-title {
  font-size: 14px;
  font-weight: 500;
}

.notif-desc {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.45);
  margin-top: 2px;
}

.notif-time {
  font-size: 11px;
  color: rgba(0, 0, 0, 0.35);
  margin-top: 4px;
}

/* Tabbar */
.tabbar {
  --primary: v-bind('preferences.theme.colorPrimary');
  height: var(--tabbar-h);
  background: var(--sider-bg);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: stretch;
  padding: 0;
  overflow: hidden;
}

.tabbar-tools {
  flex-shrink: 0;
  border-left: 1px solid rgba(0, 0, 0, 0.06);
}

:global(html.dark) .tabbar {
  border-bottom-color: rgba(255, 255, 255, 0.08);
}

:global(html.dark) .tabbar-tools {
  border-left-color: rgba(255, 255, 255, 0.08);
}

/* Content */
.layout-content {
  background: var(--content-bg) !important;
  overflow: auto;
  padding: 14px;
}

/* 过渡动画 */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.2s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
