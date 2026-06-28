<script lang="ts" setup>
import { computed, ref } from 'vue'
import { CheckOutlined, CopyOutlined, ReloadOutlined } from '@ant-design/icons-vue'
import { Button, Drawer, Segmented, Switch, Tooltip, message } from 'ant-design-vue'
import { MoonStar, Pin, PinOff, Sun, SunMoon } from 'lucide-vue-next'
import {
  clearCache,
  preferences,
  resetPreferences,
  updatePreferences
} from '#/preferences'

defineOptions({ name: 'PreferencesDrawer' })

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ 'update:open': [val: boolean] }>()

/** 双向绑定 open */
const drawerOpen = computed({
  get: () => props.open,
  set: (v) => emit('update:open', v)
})

/** 当前激活的 Tab */
const activeTab = ref('appearance')

/** Tab 列表：对齐 web-antd preferences-drawer.vue tabs */
const tabs = [
  { label: '外观', value: 'appearance' },
  { label: '布局', value: 'layout' },
  { label: '快捷键', value: 'shortcutKey' },
  { label: '通用', value: 'general' }
]

/** 主题模式预设：对齐 web-antd theme.vue THEME_PRESET */
const themePresets = [
  { icon: Sun, name: 'light', label: '亮色' },
  { icon: MoonStar, name: 'dark', label: '暗色' },
  { icon: SunMoon, name: 'auto', label: '跟随系统' }
] as const

/** 布局模式预设 */
const layoutPresets = [
  { name: 'side-nav', label: '侧边菜单' },
  { name: 'top-nav', label: '顶部菜单' },
  { name: 'mixed-nav', label: '混合菜单' }
] as const

/** 标签栏风格预设 */
const tabbarStylePresets = [
  { name: 'chrome', label: 'chrome' },
  { name: 'plain', label: 'plain' },
  { name: 'card', label: 'card' },
  { name: 'brisk', label: 'brisk' }
] as const

/** 主题色预设 */
const colorPresets = [
  '#8b4c3b',
  '#1677ff',
  '#00b96b',
  '#722ed1',
  '#eb2f96',
  '#fa8c16',
  '#13c2c2',
  '#f5222d'
]

/** 偏好设置导航栏吸顶 */
const stickyNav = ref(false)

/** 判断是否有改动（简化版：始终启用按钮） */
const hasDiff = computed(() => true)

/** 复制偏好设置 JSON */
async function handleCopy() {
  try {
    const text = JSON.stringify(preferences, null, 2)
    await navigator.clipboard.writeText(text)
    message.success('偏好设置已复制到剪贴板')
  } catch {
    message.error('复制失败')
  }
}

/** 重置偏好设置 */
function handleReset() {
  resetPreferences()
  message.success('已重置为默认偏好设置')
}

/** 清空缓存并退出 */
function handleClearCache() {
  clearCache()
  resetPreferences()
  drawerOpen.value = false
  message.success('已清空缓存')
}

/** 主题色更新 */
function handleColorChange(color: string) {
  updatePreferences({ theme: { colorPrimary: color } })
}
</script>

<template>
  <Drawer v-model:open="drawerOpen" title="偏好设置" placement="right" :width="380" :body-style="{ padding: 0 }"
    class="preferences-drawer">
    <!-- 顶部额外操作（对齐 web-antd extra: 重置 + 吸顶） -->
    <template #extra>
      <div class="drawer-extra">
        <Tooltip title="重置偏好设置">
          <button class="drawer-icon-btn" type="button" @click="handleReset">
            <ReloadOutlined />
            <span v-if="hasDiff" class="drawer-dot"></span>
          </button>
        </Tooltip>
        <Tooltip :title="stickyNav ? '取消吸顶' : '吸顶'">
          <button class="drawer-icon-btn" type="button" @click="stickyNav = !stickyNav">
            <Pin v-if="stickyNav" class="drawer-pin-icon" />
            <PinOff v-else class="drawer-pin-icon" />
          </button>
        </Tooltip>
      </div>
    </template>

    <!-- Segmented Tab 切换（对齐 web-antd VbenSegmented） -->
    <div class="drawer-segmented" :class="{ sticky: stickyNav }">
      <Segmented v-model:value="activeTab" :options="tabs" block />
    </div>

    <!-- 内容区 -->
    <div class="drawer-content">
      <!-- ============ 外观 ============ -->
      <template v-if="activeTab === 'appearance'">
        <section class="pref-block">
          <h3 class="pref-block-title">主题</h3>
          <div class="theme-presets">
            <div v-for="theme in themePresets" :key="theme.name" class="theme-preset-item"
              @click="updatePreferences({ theme: { mode: theme.name } })">
              <div class="theme-preset-box" :class="{ active: preferences.theme.mode === theme.name }">
                <component :is="theme.icon" class="theme-preset-icon" />
              </div>
              <div class="theme-preset-label">{{ theme.label }}</div>
            </div>
          </div>
        </section>

        <section class="pref-block">
          <h3 class="pref-block-title">主题色</h3>
          <div class="color-presets">
            <div v-for="color in colorPresets" :key="color" class="color-preset-item" :style="{ background: color }"
              :class="{ active: preferences.theme.colorPrimary === color }" @click="handleColorChange(color)">
              <CheckOutlined v-if="preferences.theme.colorPrimary === color" class="color-check" />
            </div>
          </div>
        </section>

        <section class="pref-block">
          <h3 class="pref-block-title">半深色侧边栏</h3>
          <div class="pref-switch-row">
            <span class="pref-switch-label">深色侧边栏</span>
            <Switch :checked="preferences.theme.semiDarkSidebar" :disabled="preferences.theme.mode === 'dark'"
              @update:checked="(v: any) => updatePreferences({ theme: { semiDarkSidebar: v } })" />
          </div>
        </section>
      </template>

      <!-- ============ 布局 ============ -->
      <template v-if="activeTab === 'layout'">
        <section class="pref-block">
          <h3 class="pref-block-title">布局模式</h3>
          <div class="layout-presets">
            <div v-for="layout in layoutPresets" :key="layout.name" class="layout-preset-item"
              :class="{ active: preferences.app.layout === layout.name }"
              @click="updatePreferences({ app: { layout: layout.name } })">
              {{ layout.label }}
            </div>
          </div>
        </section>

        <section class="pref-block">
          <h3 class="pref-block-title">侧边栏</h3>
          <div class="pref-switch-row">
            <span class="pref-switch-label">显示侧边栏</span>
            <Switch :checked="preferences.sidebar.visible"
              @update:checked="(v: any) => updatePreferences({ sidebar: { visible: v } })" />
          </div>
          <div class="pref-switch-row">
            <span class="pref-switch-label">折叠侧边栏</span>
            <Switch :checked="preferences.sidebar.collapsed"
              @update:checked="(v: any) => updatePreferences({ sidebar: { collapsed: v } })" />
          </div>
          <div class="pref-switch-row">
            <span class="pref-switch-label">显示 Logo</span>
            <Switch :checked="preferences.logo.visible"
              @update:checked="(v: any) => updatePreferences({ logo: { visible: v } })" />
          </div>
        </section>

        <section class="pref-block">
          <h3 class="pref-block-title">面包屑</h3>
          <div class="pref-switch-row">
            <span class="pref-switch-label">启用面包屑</span>
            <Switch :checked="preferences.breadcrumb.enable"
              @update:checked="(v: any) => updatePreferences({ breadcrumb: { enable: v } })" />
          </div>
        </section>

        <section class="pref-block">
          <h3 class="pref-block-title">标签栏</h3>
          <div class="pref-switch-row">
            <span class="pref-switch-label">启用标签栏</span>
            <Switch :checked="preferences.tabbar.enable"
              @update:checked="(v: any) => updatePreferences({ tabbar: { enable: v } })" />
          </div>
          <div class="pref-switch-row">
            <span class="pref-switch-label">显示图标</span>
            <Switch :checked="preferences.tabbar.showIcon"
              @update:checked="(v: any) => updatePreferences({ tabbar: { showIcon: v } })" />
          </div>
          <div class="pref-switch-row">
            <span class="pref-switch-label">拖拽排序</span>
            <Switch :checked="preferences.tabbar.draggable"
              @update:checked="(v: any) => updatePreferences({ tabbar: { draggable: v } })" />
          </div>
          <div class="pref-switch-row">
            <span class="pref-switch-label">持久化</span>
            <Switch :checked="preferences.tabbar.persist"
              @update:checked="(v: any) => updatePreferences({ tabbar: { persist: v } })" />
          </div>
          <div class="pref-switch-row">
            <span class="pref-switch-label">显示刷新按钮</span>
            <Switch :checked="preferences.tabbar.showRefresh"
              @update:checked="(v: any) => updatePreferences({ tabbar: { showRefresh: v } })" />
          </div>
          <div class="pref-switch-row">
            <span class="pref-switch-label">显示更多按钮</span>
            <Switch :checked="preferences.tabbar.showMore"
              @update:checked="(v: any) => updatePreferences({ tabbar: { showMore: v } })" />
          </div>
          <div class="pref-switch-row">
            <span class="pref-switch-label">显示最大化按钮</span>
            <Switch :checked="preferences.tabbar.showMaximize"
              @update:checked="(v: any) => updatePreferences({ tabbar: { showMaximize: v } })" />
          </div>
          <div class="pref-field-row">
            <span class="pref-switch-label">标签风格</span>
            <div class="tabbar-style-presets">
              <button v-for="style in tabbarStylePresets" :key="style.name" type="button" class="tabbar-style-item"
                :class="{ active: preferences.tabbar.styleType === style.name }"
                @click="updatePreferences({ tabbar: { styleType: style.name } })">
                {{ style.label }}
              </button>
            </div>
          </div>
        </section>
      </template>

      <!-- ============ 快捷键 ============ -->
      <template v-if="activeTab === 'shortcutKey'">
        <section class="pref-block">
          <h3 class="pref-block-title">全局快捷键</h3>
          <div class="pref-shortcut-row">
            <span class="pref-switch-label">快捷键说明</span>
            <span class="pref-shortcut-hint">当前版本暂未启用全局快捷键</span>
          </div>
          <div class="pref-shortcut-row">
            <span class="pref-switch-label">锁屏</span>
            <span class="pref-shortcut-key">Alt + L</span>
          </div>
          <div class="pref-shortcut-row">
            <span class="pref-switch-label">退出登录</span>
            <span class="pref-shortcut-key">Alt + Q</span>
          </div>
          <div class="pref-shortcut-row">
            <span class="pref-switch-label">偏好设置</span>
            <span class="pref-shortcut-key">Alt + ,</span>
          </div>
          <div class="pref-shortcut-row">
            <span class="pref-switch-label">全局搜索</span>
            <span class="pref-shortcut-key">Ctrl + K</span>
          </div>
        </section>
      </template>

      <!-- ============ 通用 ============ -->
      <template v-if="activeTab === 'general'">
        <section class="pref-block">
          <h3 class="pref-block-title">通用</h3>
          <div class="pref-switch-row">
            <span class="pref-switch-label">动态标题</span>
            <Switch :checked="preferences.app.dynamicTitle"
              @update:checked="(v: any) => updatePreferences({ app: { dynamicTitle: v } })" />
          </div>
          <div class="pref-switch-row">
            <span class="pref-switch-label">水印</span>
            <Switch :checked="preferences.app.watermark"
              @update:checked="(v: any) => updatePreferences({ app: { watermark: v } })" />
          </div>
          <div class="pref-switch-row">
            <span class="pref-switch-label">紧凑模式</span>
            <Switch :checked="preferences.app.compact"
              @update:checked="(v: any) => updatePreferences({ app: { compact: v } })" />
          </div>
        </section>

        <section class="pref-block">
          <h3 class="pref-block-title">动画</h3>
          <div class="pref-switch-row">
            <span class="pref-switch-label">页面切换动画</span>
            <Switch :checked="true" disabled />
          </div>
          <div class="pref-switch-row">
            <span class="pref-switch-label">加载动画</span>
            <Switch :checked="true" disabled />
          </div>
          <div class="pref-switch-row">
            <span class="pref-switch-label">进度条</span>
            <Switch :checked="true" disabled />
          </div>
        </section>
      </template>
    </div>

    <!-- 底部操作（对齐 web-antd footer: 复制 + 清空缓存） -->
    <template #footer>
      <div class="drawer-footer">
        <Button block @click="handleCopy">
          <template #icon>
            <CopyOutlined />
          </template>
          复制偏好设置
        </Button>
        <Button block danger @click="handleClearCache">
          清空缓存并退出
        </Button>
      </div>
    </template>
  </Drawer>
</template>

<style scoped>
/* ============ Drawer 头部 extra ============ */
.drawer-extra {
  display: flex;
  align-items: center;
  gap: 4px;
}

.drawer-icon-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  border-radius: 9999px;
  background: transparent;
  color: hsl(var(--foreground));
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.drawer-icon-btn:hover {
  background: hsl(var(--accent));
  color: hsl(var(--accent-foreground));
}

.drawer-dot {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 8px;
  height: 8px;
  border-radius: 2px;
  background: var(--primary);
}

.drawer-pin-icon {
  width: 16px;
  height: 16px;
}

/* ============ Segmented ============ */
.drawer-segmented {
  padding: 12px 16px;
  border-bottom: 1px solid hsl(var(--border));
}

.drawer-segmented.sticky {
  position: sticky;
  top: 0;
  z-index: 10;
  background: hsl(var(--popover));
}

/* ============ 内容区 ============ */
.drawer-content {
  padding: 0 16px 16px;
}

/* ============ Block 区块 ============ */
.pref-block {
  display: flex;
  flex-direction: column;
  padding: 16px 0;
  border-bottom: 1px solid hsl(var(--border));
}

.pref-block:last-child {
  border-bottom: none;
}

.pref-block-title {
  margin: 0 0 12px;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.2;
  color: hsl(var(--foreground));
}

/* ============ 主题预设 ============ */
.theme-presets {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 12px;
}

.theme-preset-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
}

.theme-preset-box {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 56px;
  border-radius: 8px;
  border: 2px solid hsl(var(--border));
  background: hsl(var(--accent));
  transition: all 0.2s;
}

.theme-preset-box.active {
  border-color: var(--primary);
}

.theme-preset-icon {
  width: 20px;
  height: 20px;
  color: hsl(var(--foreground));
}

.theme-preset-label {
  margin-top: 8px;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

/* ============ 主题色预设 ============ */
.color-presets {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.color-preset-item {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.color-preset-item:hover {
  transform: scale(1.1);
}

.color-preset-item.active {
  box-shadow: 0 0 0 2px hsl(var(--popover)), 0 0 0 4px hsl(var(--foreground) / 0.3);
}

.color-check {
  color: #fff;
  font-size: 12px;
}

/* ============ 布局预设 ============ */
.layout-presets {
  display: flex;
  gap: 8px;
}

.layout-preset-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 36px;
  padding: 0 12px;
  border-radius: 6px;
  border: 1px solid hsl(var(--border));
  background: transparent;
  color: hsl(var(--foreground));
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.layout-preset-item:hover {
  background: hsl(var(--accent));
}

.layout-preset-item.active {
  border-color: var(--primary);
  background: hsl(var(--primary) / 0.1);
  color: var(--primary);
}

/* ============ 开关行 ============ */
.pref-switch-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 10px 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}

.pref-switch-row:hover {
  background: hsl(var(--accent));
}

.pref-switch-label {
  font-size: 13px;
  color: hsl(var(--foreground));
}

/* ============ 字段行（标签风格选择） ============ */
.pref-field-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 10px 8px;
  border-radius: 6px;
}

.tabbar-style-presets {
  display: flex;
  gap: 4px;
}

.tabbar-style-item {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 28px;
  padding: 0 10px;
  border-radius: 6px;
  border: 1px solid hsl(var(--border));
  background: transparent;
  color: hsl(var(--foreground));
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.tabbar-style-item:hover {
  background: hsl(var(--accent));
}

.tabbar-style-item.active {
  border-color: var(--primary);
  background: hsl(var(--primary) / 0.1);
  color: var(--primary);
}

/* ============ 快捷键行 ============ */
.pref-shortcut-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 10px 8px;
  border-radius: 6px;
}

.pref-shortcut-hint {
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

.pref-shortcut-key {
  display: inline-flex;
  align-items: center;
  height: 24px;
  padding: 0 8px;
  border-radius: 4px;
  border: 1px solid hsl(var(--border));
  background: hsl(var(--muted));
  color: hsl(var(--muted-foreground));
  font-size: 12px;
  line-height: 1;
}

/* ============ 底部操作 ============ */
.drawer-footer {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 16px;
}
</style>
