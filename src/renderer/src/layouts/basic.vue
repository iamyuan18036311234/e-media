<script lang="ts" setup>
import type { MenuRecord } from '#/router/access'
import type { ContextMenuItem } from '#/components/tabs'
import { computed, h, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useFullscreen } from '@vueuse/core'
import {
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined
} from '@ant-design/icons-vue'
import {
  Bell,
  Maximize,
  Minimize,
  MoonStar,
  RotateCw,
  Settings,
  Sun
} from 'lucide-vue-next'
import {
  Avatar,
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
import PreferencesDrawer from '#/components/PreferencesDrawer.vue'
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

/** 布局模式（对齐 web-antd LayoutType） */
const isTopNav = computed(() => preferences.app.layout === 'header-nav')
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
const isRefreshing = ref(false)
function refreshTab() {
  isRefreshing.value = true
  refreshKey.value++
  setTimeout(() => (isRefreshing.value = false), 600)
}

/** 全屏切换（对齐 web-antd VbenFullScreen） */
const { isFullscreen, toggle: toggleFullscreen } = useFullscreen()

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

function onSortTabs(oldIndex: number, newIndex: number) {
  tabsStore.sortTabs(oldIndex, newIndex)
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
  { key: 'preferences', icon: () => h(Settings), label: '偏好设置' },
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
const showDot = computed(() => unreadCount.value > 0)
function markAllRead() {
  notifications.forEach((n) => (n.read = true))
}

/** 偏好设置抽屉开关 */
const preferencesOpen = ref(false)
function openPreferences() {
  preferencesOpen.value = true
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
          <Tooltip :title="collapsed ? '展开侧边栏' : '折叠侧边栏'" placement="bottom">
            <button class="header-icon-btn" type="button" aria-label="切换侧边栏" @click="toggleCollapse">
              <component :is="collapsed ? MenuUnfoldOutlined : MenuFoldOutlined" />
            </button>
          </Tooltip>

          <Tooltip title="刷新" placement="bottom">
            <button class="header-icon-btn header-icon-btn--refresh" type="button" aria-label="刷新" @click="refreshTab">
              <RotateCw class="header-icon-svg" :class="{ 'animate-spin': isRefreshing }" />
            </button>
          </Tooltip>

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
          <!-- 偏好设置（对齐 web-antd PreferencesButton：Settings 图标 + mr-1） -->
          <Tooltip title="偏好设置" placement="bottom">
            <button class="header-icon-btn header-icon-btn--mr1" type="button" aria-label="偏好设置"
              @click="openPreferences">
              <Settings class="header-icon-svg" />
            </button>
          </Tooltip>

          <!-- 主题切换（对齐 web-antd ThemeToggle：Sun / MoonStar + mr-1） -->
          <Tooltip :title="isDark ? '切换为亮色' : '切换为暗色'" placement="bottom">
            <button class="header-icon-btn header-icon-btn--mr1" type="button" aria-label="切换主题" @click="toggleTheme">
              <Sun v-if="!isDark" class="header-icon-svg" />
              <MoonStar v-else class="header-icon-svg" />
            </button>
          </Tooltip>

          <!-- 全屏切换（对齐 web-antd VbenFullScreen：Maximize / Minimize + mr-1） -->
          <Tooltip :title="isFullscreen ? '退出全屏' : '全屏'" placement="bottom">
            <button class="header-icon-btn header-icon-btn--mr1" type="button" aria-label="全屏切换"
              @click="toggleFullscreen">
              <Minimize v-if="isFullscreen" class="header-icon-svg" />
              <Maximize v-else class="header-icon-svg" />
            </button>
          </Tooltip>

          <!-- 检查更新（Electron 增量更新入口，mr-1） -->
          <div class="header-icon-btn--mr1">
            <Updater />
          </div>

          <!-- 通知（对齐 web-antd Notification：Bell + 圆点 dot + mr-2） -->
          <Dropdown placement="bottomRight">
            <div class="header-icon-wrap header-icon-wrap--mr2" @click.stop>
              <button class="header-icon-btn header-icon-btn--relative" type="button" aria-label="通知">
                <span v-if="showDot" class="notif-dot"></span>
                <Bell class="header-icon-svg" />
              </button>
            </div>
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

          <!-- 用户下拉（对齐 web-antd UserDropdown：rounded-full p-1.5 + mr-2 ml-1） -->
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
        <TabsView :active="currentActive" :context-menus="createContextMenus" :draggable="preferences.tabbar.draggable"
          :middle-click-to-close="preferences.tabbar.middleClickToClose" :show-icon="preferences.tabbar.showIcon"
          :style-type="preferences.tabbar.styleType" :tabs="currentTabs" :wheelable="preferences.tabbar.wheelable"
          @close="onTabClose" @sort-tabs="onSortTabs" @unpin="onTabUnpin" @update:active="onTabActiveChange" />
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

    <!-- 偏好设置抽屉（对齐 web-antd PreferencesDrawer） -->
    <PreferencesDrawer v-model:open="preferencesOpen" />
  </Layout>
</template>

<style scoped>
.basic-layout {
  --primary: v-bind('preferences.theme.colorPrimary');
  --header-h: 50px;
  --tabbar-h: 38px;
}

/* 内容最大化：隐藏侧边栏与顶栏 */
.basic-layout.is-content-maximize .layout-sider,
.basic-layout.is-content-maximize .layout-header {
  display: none !important;
}

.layout-sider {
  background: hsl(var(--sidebar)) !important;
  box-shadow: 1px 0 0 hsl(var(--border));
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
  color: hsl(var(--foreground));
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;
}

.menu-title:hover {
  background: hsl(var(--accent));
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
  color: hsl(var(--muted-foreground));
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
  color: hsl(var(--foreground));
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;
}

.menu-item:hover {
  background: hsl(var(--accent));
}

.menu-item.selected {
  background: var(--primary);
  color: hsl(var(--primary-foreground));
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
  background: hsl(var(--header)) !important;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 1px 0 hsl(var(--border));
}

.header-left {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
  min-width: 0;
}

/* 头部图标按钮 - 对齐 web-antd VbenIconButton（h-8 w-8 rounded-full ghost） */
.header-icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  margin: 0;
  border: none;
  border-radius: 9999px;
  background: transparent;
  color: hsl(var(--foreground));
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.header-icon-btn:hover {
  background: hsl(var(--accent));
  color: hsl(var(--accent-foreground));
}

/* 刷新按钮：web-antd header.vue 中用 rounded-md 覆盖 rounded-full */
.header-icon-btn--refresh {
  border-radius: 6px;
}

/* lucide 图标尺寸：对齐 web-antd size-4 (16px) */
.header-icon-svg {
  width: 16px;
  height: 16px;
}

/* 间距工具类：对齐 web-antd mr-1 (4px) / mr-2 (8px) */
.header-icon-btn--mr1 {
  margin-right: 4px;
}

.header-icon-btn--relative {
  position: relative;
}

.header-icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.header-icon-wrap--mr2 {
  margin-right: 8px;
}

/* 通知圆点：对齐 web-antd notification.vue dot（size-2 rounded-sm bg-primary） */
.notif-dot {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 8px;
  height: 8px;
  border-radius: 2px;
  background: var(--primary);
}

.header-breadcrumb {
  font-size: 14px;
  margin-left: 4px;
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
  color: hsl(var(--foreground));
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;
}

.top-menu-title:hover {
  background: hsl(var(--accent));
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
  background: hsl(var(--popover));
  border-radius: 8px;
  box-shadow: 0 6px 16px hsl(var(--overlay));
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
  color: hsl(var(--foreground));
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;
  white-space: nowrap;
}

.top-menu-item:hover {
  background: hsl(var(--accent));
}

.top-menu-item.selected {
  background: var(--primary);
  color: hsl(var(--primary-foreground));
}

.header-right {
  display: flex;
  align-items: center;
  height: 100%;
}

/* 用户下拉触发器：对齐 web-antd user-dropdown.vue（mr-2 ml-1 rounded-full p-1.5 hover:bg-accent） */
.user-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 6px;
  border-radius: 9999px;
  margin-right: 8px;
  margin-left: 4px;
  transition: all 0.2s;
}

.user-trigger:hover {
  background: hsl(var(--accent));
}

.user-name {
  font-size: 14px;
  white-space: nowrap;
}

/* 通知面板 */
.notif-panel {
  width: 320px;
  background: hsl(var(--popover));
  border-radius: 8px;
  box-shadow: 0 6px 16px hsl(var(--overlay));
  overflow: hidden;
}

.notif-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  border-bottom: 1px solid hsl(var(--border));
  font-weight: 600;
}

.notif-list {
  max-height: 360px;
  overflow-y: auto;
}

.notif-item {
  padding: 10px 14px;
  border-bottom: 1px solid hsl(var(--border));
  cursor: pointer;
}

.notif-item.unread {
  background: hsl(var(--primary) / 0.08);
}

.notif-title {
  font-size: 14px;
  font-weight: 500;
}

.notif-desc {
  font-size: 12px;
  color: hsl(var(--muted-foreground));
  margin-top: 2px;
}

.notif-time {
  font-size: 11px;
  color: hsl(var(--muted-foreground));
  margin-top: 4px;
}

/* Tabbar */
.tabbar {
  --primary: v-bind('preferences.theme.colorPrimary');
  height: var(--tabbar-h);
  background: hsl(var(--header));
  border-bottom: 1px solid hsl(var(--border));
  display: flex;
  align-items: stretch;
  padding: 0;
  overflow: hidden;
}

.tabbar-tools {
  flex-shrink: 0;
  border-left: 1px solid hsl(var(--border));
}

/* Content */
.layout-content {
  background: hsl(var(--background-deep)) !important;
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
