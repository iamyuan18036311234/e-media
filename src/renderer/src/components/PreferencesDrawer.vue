<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { CopyOutlined, ReloadOutlined, QuestionCircleOutlined } from '@ant-design/icons-vue'
import LayoutIcon from './LayoutIcons.vue'
import {
  Button,
  Drawer,
  InputNumber,
  Segmented,
  Select,
  Switch,
  Tooltip,
  message
} from 'ant-design-vue'
import { MoonStar, Pin, PinOff, Sun, SunMoon, UserRoundPen } from 'lucide-vue-next'
import {
  clearCache,
  preferences,
  resetPreferences,
  updatePreferences
} from '#/preferences'
import type {
  BreadcrumbStyleType,
  BuiltinThemeType,
  ContentCompactType,
  LayoutHeaderMenuAlignType,
  LayoutHeaderModeType,
  LayoutType,
  NavigationStyleType,
  PreferencesButtonPositionType
} from '#/preferences/index'

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

/** 偏好设置导航栏吸顶 */
const stickyNav = computed({
  get: () => preferences.app.enableStickyPreferencesNavigationBar,
  set: (v) => updatePreferences({ app: { enableStickyPreferencesNavigationBar: v } })
})

/** 判断是否有改动 */
const hasDiff = computed(() => true)

/* ============ 主题模式预设 ============ */
const themePresets = [
  { icon: Sun, name: 'light', label: '亮色' },
  { icon: MoonStar, name: 'dark', label: '暗色' },
  { icon: SunMoon, name: 'auto', label: '跟随系统' }
] as const

/* ============ 内置主题预设（对齐 web-antd BUILT_IN_THEME_PRESETS 顺序） ============ */
const builtinThemePresets: Array<{ type: BuiltinThemeType; label: string; color: string }> = [
  { type: 'default', label: '默认', color: '#1677ff' },
  { type: 'violet', label: '紫色', color: '#722ed1' },
  { type: 'pink', label: '粉色', color: '#eb2f96' },
  { type: 'rose', label: '玫红', color: '#f43f5e' },
  { type: 'sky-blue', label: '天蓝', color: '#0ea5e9' },
  { type: 'deep-blue', label: '深蓝', color: '#1e3a8a' },
  { type: 'green', label: '绿色', color: '#16a34a' },
  { type: 'deep-green', label: '深绿', color: '#14532d' },
  { type: 'orange', label: '橙色', color: '#f97316' },
  { type: 'yellow', label: '黄色', color: '#eab308' },
  { type: 'neutral', label: '中性', color: '#737373' },
  { type: 'slate', label: '青灰', color: '#475569' },
  { type: 'zinc', label: '锌色', color: '#52525b' },
  { type: 'gray', label: '灰色', color: '#6b7280' },
  { type: 'custom', label: '自定义', color: '#8b4c3b' }
]

/** 颜色选择器 ref（用于自定义主题色触发） */
const colorInputRef = ref<HTMLInputElement | null>(null)

/** 自定义主题色输入框当前 hex 值 */
const customColorHex = computed(() => {
  // 尽量将 colorPrimary（可能是 hsl）转成 hex，失败则回退原值
  try {
    return preferences.theme.colorPrimary
  } catch {
    return preferences.theme.colorPrimary
  }
})

/** 触发自定义颜色选择器点击 */
function openColorPicker() {
  colorInputRef.value?.click()
}

/** 自定义颜色选择器输入事件（对齐 web-antd handleInputChange） */
function handleCustomColorInput(e: Event) {
  const target = e.target as HTMLInputElement
  // 直接以 hex 写入 colorPrimary，并将 builtinType 置为 custom
  updatePreferences({ theme: { colorPrimary: target.value, builtinType: 'custom' } })
}

/* ============ 圆角预设（对齐 web-antd radius.vue） ============ */
const radiusItems = [
  { label: '0', value: '0' },
  { label: '0.25', value: '0.25' },
  { label: '0.5', value: '0.5' },
  { label: '0.75', value: '0.75' },
  { label: '1', value: '1' }
]

/* ============ 布局模式预设（对齐 web-antd layout.vue 顺序与 tip） ============ */
const layoutPresets: Array<{ name: string; type: LayoutType; tip: string }> = [
  { name: '垂直', type: 'sidebar-nav', tip: '所有菜单全部显示在左侧' },
  { name: '双列', type: 'sidebar-mixed-nav', tip: '双列菜单布局，主菜单在左侧，子菜单在右侧' },
  { name: '水平', type: 'header-nav', tip: '所有菜单全部显示在顶部' },
  { name: '头部+侧边', type: 'header-sidebar-nav', tip: '头部菜单与侧边栏混合布局' },
  { name: '混合菜单', type: 'mixed-nav', tip: '菜单混合布局，顶部和左侧都有菜单' },
  { name: '头部双列', type: 'header-mixed-nav', tip: '头部双列菜单布局' },
  { name: '全内容', type: 'full-content', tip: '没有菜单，只有内容区域' }
]

/* ============ 内容紧凑模式 ============ */
const contentCompactPresets: Array<{ name: string; type: ContentCompactType }> = [
  { name: '宽屏', type: 'wide' },
  { name: '紧凑', type: 'compact' }
]

/* ============ 头部模式 ============ */
const headerModeItems = [
  { label: '静态', value: 'static' },
  { label: '固定', value: 'fixed' },
  { label: '自动', value: 'auto' },
  { label: '自动滚动', value: 'auto-scroll' }
]

const headerMenuAlignItems = [
  { label: '起始', value: 'start' },
  { label: '居中', value: 'center' },
  { label: '结束', value: 'end' }
]

/* ============ 导航风格 ============ */
const navigationStyleItems = [
  { label: '圆角', value: 'rounded' },
  { label: '朴素', value: 'plain' }
]

/* ============ 面包屑风格 ============ */
const breadcrumbStyleItems = [
  { label: '常规', value: 'normal' },
  { label: '背景', value: 'background' }
]

/* ============ 标签栏风格 ============ */
const tabbarStyleItems = [
  { label: 'chrome', value: 'chrome' },
  { label: 'plain', value: 'plain' },
  { label: 'card', value: 'card' },
  { label: 'brisk', value: 'brisk' }
]

/* ============ 偏好按钮位置 ============ */
const positionItems = [
  { label: '自动', value: 'auto' },
  { label: '头部', value: 'header' },
  { label: '固定', value: 'fixed' },
  { label: '用户下拉', value: 'user-dropdown' }
]

/* ============ 语言选项（对齐 web-antd SUPPORT_LANGUAGES） ============ */
const localeItems = [
  { label: '简体中文', value: 'zh-CN' },
  { label: 'English', value: 'en-US' }
]

/* ============ 时区选项（对齐 web-antd useTimezoneStore.getTimezoneOptions） ============ */
const timezoneItems = [
  { label: 'Africa/Abidjan (GMT)', value: 'Africa/Abidjan' },
  { label: 'America/New_York (EST)', value: 'America/New_York' },
  { label: 'America/Los_Angeles (PST)', value: 'America/Los_Angeles' },
  { label: 'America/Chicago (CST)', value: 'America/Chicago' },
  { label: 'America/Denver (MST)', value: 'America/Denver' },
  { label: 'America/Sao_Paulo (BRT)', value: 'America/Sao_Paulo' },
  { label: 'Asia/Shanghai (CST)', value: 'Asia/Shanghai' },
  { label: 'Asia/Hong_Kong (HKT)', value: 'Asia/Hong_Kong' },
  { label: 'Asia/Tokyo (JST)', value: 'Asia/Tokyo' },
  { label: 'Asia/Seoul (KST)', value: 'Asia/Seoul' },
  { label: 'Asia/Singapore (SGT)', value: 'Asia/Singapore' },
  { label: 'Asia/Bangkok (ICT)', value: 'Asia/Bangkok' },
  { label: 'Asia/Dubai (GST)', value: 'Asia/Dubai' },
  { label: 'Asia/Kolkata (IST)', value: 'Asia/Kolkata' },
  { label: 'Europe/London (GMT)', value: 'Europe/London' },
  { label: 'Europe/Paris (CET)', value: 'Europe/Paris' },
  { label: 'Europe/Berlin (CET)', value: 'Europe/Berlin' },
  { label: 'Europe/Moscow (MSK)', value: 'Europe/Moscow' },
  { label: 'Australia/Sydney (AEDT)', value: 'Australia/Sydney' },
  { label: 'Pacific/Auckland (NZDT)', value: 'Pacific/Auckland' }
]

/* ============ 动画预设 ============ */
const transitionPresets = ['fade', 'fade-slide', 'fade-up', 'fade-down']

/* ============ 布局相关计算（对齐 web-antd usePreferences） ============ */
const isFullContent = computed(() => preferences.app.layout === 'full-content')
const isHeaderNav = computed(() => preferences.app.layout === 'header-nav')
const isMixedNav = computed(() => preferences.app.layout === 'mixed-nav')
const isSideNav = computed(() => preferences.app.layout === 'sidebar-nav')
const isSideMixedNav = computed(() => preferences.app.layout === 'sidebar-mixed-nav')
const isHeaderSidebarNav = computed(() => preferences.app.layout === 'header-sidebar-nav')
const isHeaderMixedNav = computed(() => preferences.app.layout === 'header-mixed-nav')
const isSideMode = computed(() => !isFullContent.value && !isHeaderNav.value)

/* ============ 主题侧边栏联动（对齐 web-antd theme.vue watch） ============ */
// 关闭深色侧边栏时，同步关闭深色次级侧边栏
watch(
  () => preferences.theme.semiDarkSidebar,
  (val) => {
    if (!val) {
      updatePreferences({ theme: { semiDarkSidebarSub: false } })
    }
  }
)

const showBreadcrumbConfig = computed(() => {
  return (
    !isFullContent.value &&
    !isMixedNav.value &&
    !isHeaderNav.value &&
    preferences.header.enable
  )
})

/** 面包屑区块整体禁用（对齐 web-antd Breadcrumb :disabled） */
const breadcrumbDisabled = computed(
  () => !showBreadcrumbConfig.value || !(isSideNav.value || isSideMixedNav.value || isHeaderSidebarNav.value)
)

/** 面包屑单项禁用（对齐 web-antd breadcrumb.vue disableItem） */
const breadcrumbItemDisabled = computed(
  () => !preferences.breadcrumb.enable || breadcrumbDisabled.value
)

/* ============ 侧边栏按钮组（对齐 web-antd sidebar.vue CheckboxItem 多选） ============ */
/** 侧边栏按钮勾选项：'collapsed' 折叠按钮 / 'fixed' 固定按钮 */
const sidebarButtons = computed<string[]>({
  get() {
    const arr: string[] = []
    if (preferences.sidebar.collapsedButton) arr.push('collapsed')
    if (preferences.sidebar.fixedButton) arr.push('fixed')
    return arr
  },
  set(val: string[]) {
    updatePreferences({
      sidebar: {
        collapsedButton: val.includes('collapsed'),
        fixedButton: val.includes('fixed')
      }
    })
  }
})

/** 切换侧边栏按钮勾选状态（多选 toggle） */
function toggleSidebarBtn(key: 'collapsed' | 'fixed'): string[] {
  const current = sidebarButtons.value
  return current.includes(key)
    ? current.filter((k) => k !== key)
    : [...current, key]
}

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

/** 选择内置主题 */
function handleBuiltinThemeSelect(theme: { type: BuiltinThemeType; color: string }) {
  updatePreferences({ theme: { builtinType: theme.type, colorPrimary: theme.color } })
}
</script>

<template>
  <Drawer v-model:open="drawerOpen" title="偏好设置" description="系统偏好设置，实时预览效果" placement="right" :width="380"
    :body-style="{ padding: 0 }" :root-style="{ '--primary': preferences.theme.colorPrimary }"
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
      <!-- ==================== 外观 ==================== -->
      <template v-if="activeTab === 'appearance'">
        <!-- 主题 -->
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
          <div class="pref-switch-row">
            <span class="pref-switch-label">深色侧边栏</span>
            <Switch :checked="preferences.theme.semiDarkSidebar"
              :disabled="preferences.theme.mode === 'dark' || isHeaderNav || isFullContent"
              @update:checked="(v: any) => updatePreferences({ theme: { semiDarkSidebar: v } })" />
          </div>
          <div class="pref-switch-row">
            <span class="pref-switch-label">深色次级侧边栏</span>
            <Switch :checked="preferences.theme.semiDarkSidebarSub"
              :disabled="preferences.theme.mode === 'dark' || (!isSideMixedNav && !isHeaderMixedNav) || !preferences.theme.semiDarkSidebar"
              @update:checked="(v: any) => updatePreferences({ theme: { semiDarkSidebarSub: v } })" />
          </div>
          <div class="pref-switch-row">
            <span class="pref-switch-label">深色头部</span>
            <Switch :checked="preferences.theme.semiDarkHeader" :disabled="preferences.theme.mode === 'dark'"
              @update:checked="(v: any) => updatePreferences({ theme: { semiDarkHeader: v } })" />
          </div>
        </section>

        <!-- 内置主题 -->
        <section class="pref-block">
          <h3 class="pref-block-title">内置主题</h3>
          <div class="builtin-theme-presets">
            <div v-for="theme in builtinThemePresets" :key="theme.type" class="builtin-theme-item"
              @click="theme.type === 'custom' ? openColorPicker() : handleBuiltinThemeSelect(theme)">
              <div class="builtin-theme-box group" :class="{ active: preferences.theme.builtinType === theme.type }">
                <template v-if="theme.type !== 'custom'">
                  <div class="builtin-theme-color" :style="{ backgroundColor: theme.color }"></div>
                </template>
                <template v-else>
                  <div class="builtin-theme-custom">
                    <UserRoundPen class="builtin-theme-custom-icon" />
                    <input ref="colorInputRef" :value="customColorHex" class="builtin-theme-color-input" type="color"
                      @input="handleCustomColorInput" />
                  </div>
                </template>
              </div>
              <div class="builtin-theme-label">{{ theme.label }}</div>
            </div>
          </div>
        </section>

        <!-- 圆角 -->
        <section class="pref-block">
          <h3 class="pref-block-title">圆角</h3>
          <div class="toggle-group">
            <button v-for="item in radiusItems" :key="item.value" type="button" class="toggle-item"
              :class="{ active: preferences.theme.radius === item.value }"
              @click="updatePreferences({ theme: { radius: item.value } })">
              {{ item.label }}
            </button>
          </div>
        </section>

        <!-- 字体大小 -->
        <section class="pref-block">
          <h3 class="pref-block-title">字体大小</h3>
          <div class="pref-number-row">
            <InputNumber :value="preferences.theme.fontSize" :min="15" :max="22" :step="1" size="small"
              @update:value="(v: any) => updatePreferences({ theme: { fontSize: Number(v) || 16 } })" />
            <span class="pref-number-suffix">px</span>
          </div>
          <div class="pref-tip">字体大小范围 15-22px</div>
        </section>

        <!-- 其他 -->
        <section class="pref-block">
          <h3 class="pref-block-title">其他</h3>
          <div class="pref-switch-row">
            <span class="pref-switch-label">色弱模式</span>
            <Switch :checked="preferences.app.colorWeakMode"
              @update:checked="(v: any) => updatePreferences({ app: { colorWeakMode: v } })" />
          </div>
          <div class="pref-switch-row">
            <span class="pref-switch-label">灰色模式</span>
            <Switch :checked="preferences.app.colorGrayMode"
              @update:checked="(v: any) => updatePreferences({ app: { colorGrayMode: v } })" />
          </div>
        </section>
      </template>

      <!-- ==================== 布局 ==================== -->
      <template v-if="activeTab === 'layout'">
        <!-- 布局模式 -->
        <section class="pref-block">
          <h3 class="pref-block-title">布局</h3>
          <div class="layout-presets">
            <div v-for="layout in layoutPresets" :key="layout.type" class="layout-preset-item"
              :class="{ active: preferences.app.layout === layout.type }"
              @click="updatePreferences({ app: { layout: layout.type } })">
              <div class="layout-preset-box">
                <LayoutIcon :type="layout.type" />
              </div>
              <div class="layout-preset-label">
                {{ layout.name }}
                <Tooltip v-if="layout.tip" :title="layout.tip">
                  <QuestionCircleOutlined class="layout-preset-tip" />
                </Tooltip>
              </div>
            </div>
          </div>
        </section>

        <!-- 内容 -->
        <section class="pref-block">
          <h3 class="pref-block-title">内容</h3>
          <div class="layout-presets">
            <div v-for="item in contentCompactPresets" :key="item.type" class="layout-preset-item"
              :class="{ active: preferences.app.contentCompact === item.type }"
              @click="updatePreferences({ app: { contentCompact: item.type } })">
              <div class="layout-preset-box">
                <LayoutIcon :type="`content-${item.type}` as any" />
              </div>
              <div class="layout-preset-label">{{ item.name }}</div>
            </div>
          </div>
        </section>

        <!-- 侧边栏 -->
        <section class="pref-block">
          <h3 class="pref-block-title">侧边栏</h3>
          <div class="pref-switch-row">
            <span class="pref-switch-label">显示侧边栏</span>
            <Switch :checked="preferences.sidebar.visible" :disabled="!isSideMode"
              @update:checked="(v: any) => updatePreferences({ sidebar: { visible: v } })" />
          </div>
          <div class="pref-switch-row">
            <span class="pref-switch-label">可拖拽</span>
            <Switch :checked="preferences.sidebar.draggable" :disabled="!preferences.sidebar.visible || !isSideMode"
              @update:checked="(v: any) => updatePreferences({ sidebar: { draggable: v } })" />
          </div>
          <div class="pref-switch-row">
            <span class="pref-switch-label">折叠</span>
            <Switch :checked="preferences.sidebar.collapsed" :disabled="!preferences.sidebar.visible || !isSideMode"
              @update:checked="(v: any) => updatePreferences({ sidebar: { collapsed: v } })" />
          </div>
          <div class="pref-switch-row">
            <span class="pref-switch-label">悬停展开</span>
            <Switch :checked="preferences.sidebar.expandOnHover"
              :disabled="!preferences.sidebar.visible || !isSideMode || !preferences.sidebar.collapsed"
              @update:checked="(v: any) => updatePreferences({ sidebar: { expandOnHover: v } })" />
          </div>
          <div class="pref-switch-row">
            <span class="pref-switch-label">折叠显示标题</span>
            <Switch :checked="preferences.sidebar.collapsedShowTitle"
              :disabled="!preferences.sidebar.visible || !isSideMode || !preferences.sidebar.collapsed"
              @update:checked="(v: any) => updatePreferences({ sidebar: { collapsedShowTitle: v } })" />
          </div>
          <div class="pref-switch-row">
            <span class="pref-switch-label">自动激活子菜单</span>
            <Switch :checked="preferences.sidebar.autoActivateChild"
              :disabled="!preferences.sidebar.visible || !['sidebar-mixed-nav', 'mixed-nav', 'header-mixed-nav'].includes(preferences.app.layout) || !isSideMode"
              @update:checked="(v: any) => updatePreferences({ sidebar: { autoActivateChild: v } })" />
          </div>
          <div class="pref-checkbox-row">
            <span class="pref-switch-label">侧边栏按钮</span>
            <div class="sidebar-btn-group">
              <button type="button" class="sidebar-btn-toggle" :class="{ active: sidebarButtons.includes('collapsed') }"
                :disabled="!preferences.sidebar.visible || !isSideMode"
                @click="sidebarButtons = toggleSidebarBtn('collapsed')">
                折叠
              </button>
              <button type="button" class="sidebar-btn-toggle" :class="{ active: sidebarButtons.includes('fixed') }"
                :disabled="!preferences.sidebar.visible || !isSideMode"
                @click="sidebarButtons = toggleSidebarBtn('fixed')">
                固定
              </button>
            </div>
          </div>
          <div class="pref-number-row">
            <span class="pref-switch-label">宽度</span>
            <InputNumber :value="preferences.sidebar.width" :min="160" :max="320" :step="10" size="small"
              :disabled="!preferences.sidebar.visible || !isSideMode"
              @update:value="(v: any) => updatePreferences({ sidebar: { width: Number(v) || 230 } })" />
          </div>
        </section>

        <!-- 头部 -->
        <section class="pref-block">
          <h3 class="pref-block-title">头部</h3>
          <div class="pref-switch-row">
            <span class="pref-switch-label">显示头部</span>
            <Switch :checked="preferences.header.enable" :disabled="isFullContent"
              @update:checked="(v: any) => updatePreferences({ header: { enable: v } })" />
          </div>
          <div class="pref-field-row">
            <span class="pref-switch-label">模式</span>
            <Select :value="preferences.header.mode" size="small" style="width: 140px" :options="headerModeItems"
              :disabled="!preferences.header.enable"
              @update:value="(v: any) => updatePreferences({ header: { mode: v as LayoutHeaderModeType } })" />
          </div>
          <div class="pref-field-row">
            <span class="pref-switch-label">菜单对齐</span>
            <div class="toggle-group">
              <button v-for="item in headerMenuAlignItems" :key="item.value" type="button" class="toggle-item"
                :class="{ active: preferences.header.menuAlign === item.value }" :disabled="!preferences.header.enable"
                @click="updatePreferences({ header: { menuAlign: item.value as LayoutHeaderMenuAlignType } })">
                {{ item.label }}
              </button>
            </div>
          </div>
        </section>

        <!-- 导航菜单 -->
        <section class="pref-block">
          <h3 class="pref-block-title">导航菜单</h3>
          <div class="pref-field-row">
            <span class="pref-switch-label">风格</span>
            <div class="toggle-group">
              <button v-for="item in navigationStyleItems" :key="item.value" type="button" class="toggle-item"
                :class="{ active: preferences.navigation.styleType === item.value }" :disabled="isFullContent"
                @click="updatePreferences({ navigation: { styleType: item.value as NavigationStyleType } })">
                {{ item.label }}
              </button>
            </div>
          </div>
          <div class="pref-switch-row">
            <span class="pref-switch-label">分割菜单</span>
            <Switch :checked="preferences.navigation.split" :disabled="!isMixedNav || isFullContent"
              @update:checked="(v: any) => updatePreferences({ navigation: { split: v } })" />
          </div>
          <div class="pref-switch-row">
            <span class="pref-switch-label">手风琴模式</span>
            <Switch :checked="preferences.navigation.accordion" :disabled="isFullContent"
              @update:checked="(v: any) => updatePreferences({ navigation: { accordion: v } })" />
          </div>
        </section>

        <!-- 面包屑 -->
        <section class="pref-block">
          <h3 class="pref-block-title">面包屑</h3>
          <div class="pref-switch-row">
            <span class="pref-switch-label">启用面包屑</span>
            <Switch :checked="preferences.breadcrumb.enable" :disabled="breadcrumbDisabled"
              @update:checked="(v: any) => updatePreferences({ breadcrumb: { enable: v } })" />
          </div>
          <div class="pref-switch-row">
            <span class="pref-switch-label">仅一条时隐藏</span>
            <Switch :checked="preferences.breadcrumb.hideOnlyOne" :disabled="breadcrumbItemDisabled"
              @update:checked="(v: any) => updatePreferences({ breadcrumb: { hideOnlyOne: v } })" />
          </div>
          <div class="pref-switch-row">
            <span class="pref-switch-label">显示图标</span>
            <Switch :checked="preferences.breadcrumb.showIcon" :disabled="breadcrumbItemDisabled"
              @update:checked="(v: any) => updatePreferences({ breadcrumb: { showIcon: v } })" />
          </div>
          <div class="pref-switch-row">
            <span class="pref-switch-label">显示主页</span>
            <Switch :checked="preferences.breadcrumb.showHome"
              :disabled="breadcrumbItemDisabled || !preferences.breadcrumb.showIcon"
              @update:checked="(v: any) => updatePreferences({ breadcrumb: { showHome: v } })" />
          </div>
          <div class="pref-field-row">
            <span class="pref-switch-label">风格</span>
            <div class="toggle-group">
              <button v-for="item in breadcrumbStyleItems" :key="item.value" type="button" class="toggle-item"
                :class="{ active: preferences.breadcrumb.styleType === item.value }" :disabled="breadcrumbItemDisabled"
                @click="updatePreferences({ breadcrumb: { styleType: item.value as BreadcrumbStyleType } })">
                {{ item.label }}
              </button>
            </div>
          </div>
        </section>

        <!-- 标签栏 -->
        <section class="pref-block">
          <h3 class="pref-block-title">标签栏</h3>
          <div class="pref-switch-row">
            <span class="pref-switch-label">启用标签栏</span>
            <Switch :checked="preferences.tabbar.enable"
              @update:checked="(v: any) => updatePreferences({ tabbar: { enable: v } })" />
          </div>
          <div class="pref-switch-row">
            <span class="pref-switch-label">持久化</span>
            <Switch :checked="preferences.tabbar.persist" :disabled="!preferences.tabbar.enable"
              @update:checked="(v: any) => updatePreferences({ tabbar: { persist: v } })" />
          </div>
          <div class="pref-switch-row">
            <span class="pref-switch-label">访问历史</span>
            <Switch :checked="preferences.tabbar.visitHistory" :disabled="!preferences.tabbar.enable"
              @update:checked="(v: any) => updatePreferences({ tabbar: { visitHistory: v } })" />
          </div>
          <div class="pref-number-row">
            <span class="pref-switch-label">最大数量</span>
            <InputNumber :value="preferences.tabbar.maxCount" :min="0" :max="30" :step="5" size="small"
              :disabled="!preferences.tabbar.enable"
              @update:value="(v: any) => updatePreferences({ tabbar: { maxCount: Number(v) || 30 } })" />
          </div>
          <div class="pref-switch-row">
            <span class="pref-switch-label">拖拽排序</span>
            <Switch :checked="preferences.tabbar.draggable" :disabled="!preferences.tabbar.enable"
              @update:checked="(v: any) => updatePreferences({ tabbar: { draggable: v } })" />
          </div>
          <div class="pref-switch-row">
            <span class="pref-switch-label">滚轮可滚动</span>
            <Switch :checked="preferences.tabbar.wheelable" :disabled="!preferences.tabbar.enable"
              @update:checked="(v: any) => updatePreferences({ tabbar: { wheelable: v } })" />
          </div>
          <div class="pref-switch-row">
            <span class="pref-switch-label">中键点击关闭</span>
            <Switch :checked="preferences.tabbar.middleClickToClose" :disabled="!preferences.tabbar.enable"
              @update:checked="(v: any) => updatePreferences({ tabbar: { middleClickToClose: v } })" />
          </div>
          <div class="pref-switch-row">
            <span class="pref-switch-label">显示图标</span>
            <Switch :checked="preferences.tabbar.showIcon" :disabled="!preferences.tabbar.enable"
              @update:checked="(v: any) => updatePreferences({ tabbar: { showIcon: v } })" />
          </div>
          <div class="pref-switch-row">
            <span class="pref-switch-label">显示更多</span>
            <Switch :checked="preferences.tabbar.showMore" :disabled="!preferences.tabbar.enable"
              @update:checked="(v: any) => updatePreferences({ tabbar: { showMore: v } })" />
          </div>
          <div class="pref-switch-row">
            <span class="pref-switch-label">显示最大化</span>
            <Switch :checked="preferences.tabbar.showMaximize" :disabled="!preferences.tabbar.enable"
              @update:checked="(v: any) => updatePreferences({ tabbar: { showMaximize: v } })" />
          </div>
          <div class="pref-field-row">
            <span class="pref-switch-label">标签风格</span>
            <Select :value="preferences.tabbar.styleType" size="small" style="width: 140px" :options="tabbarStyleItems"
              @update:value="(v: any) => updatePreferences({ tabbar: { styleType: v } })" />
          </div>
        </section>

        <!-- 小部件 -->
        <section class="pref-block">
          <h3 class="pref-block-title">小部件</h3>
          <div class="pref-switch-row">
            <span class="pref-switch-label">全局搜索</span>
            <Switch :checked="preferences.widget.globalSearch"
              @update:checked="(v: any) => updatePreferences({ widget: { globalSearch: v } })" />
          </div>
          <div class="pref-switch-row">
            <span class="pref-switch-label">主题切换</span>
            <Switch :checked="preferences.widget.themeToggle"
              @update:checked="(v: any) => updatePreferences({ widget: { themeToggle: v } })" />
          </div>
          <div class="pref-switch-row">
            <span class="pref-switch-label">语言切换</span>
            <Switch :checked="preferences.widget.languageToggle"
              @update:checked="(v: any) => updatePreferences({ widget: { languageToggle: v } })" />
          </div>
          <div class="pref-switch-row">
            <span class="pref-switch-label">全屏</span>
            <Switch :checked="preferences.widget.fullscreen"
              @update:checked="(v: any) => updatePreferences({ widget: { fullscreen: v } })" />
          </div>
          <div class="pref-switch-row">
            <span class="pref-switch-label">通知</span>
            <Switch :checked="preferences.widget.notification"
              @update:checked="(v: any) => updatePreferences({ widget: { notification: v } })" />
          </div>
          <div class="pref-switch-row">
            <span class="pref-switch-label">锁屏</span>
            <Switch :checked="preferences.widget.lockScreen"
              @update:checked="(v: any) => updatePreferences({ widget: { lockScreen: v } })" />
          </div>
          <div class="pref-switch-row">
            <span class="pref-switch-label">侧边栏切换</span>
            <Switch :checked="preferences.widget.sidebarToggle"
              @update:checked="(v: any) => updatePreferences({ widget: { sidebarToggle: v } })" />
          </div>
          <div class="pref-switch-row">
            <span class="pref-switch-label">刷新</span>
            <Switch :checked="preferences.widget.refresh"
              @update:checked="(v: any) => updatePreferences({ widget: { refresh: v } })" />
          </div>
          <div class="pref-switch-row">
            <span class="pref-switch-label">时区</span>
            <Switch :checked="preferences.widget.timezone"
              @update:checked="(v: any) => updatePreferences({ widget: { timezone: v } })" />
          </div>
          <div class="pref-field-row">
            <span class="pref-switch-label">偏好按钮位置</span>
            <Select :value="preferences.app.preferencesButtonPosition" size="small" style="width: 140px"
              :options="positionItems"
              @update:value="(v: any) => updatePreferences({ app: { preferencesButtonPosition: v as PreferencesButtonPositionType } })" />
          </div>
        </section>

        <!-- 页脚 -->
        <section class="pref-block">
          <h3 class="pref-block-title">页脚</h3>
          <div class="pref-switch-row">
            <span class="pref-switch-label">显示页脚</span>
            <Switch :checked="preferences.footer.enable"
              @update:checked="(v: any) => updatePreferences({ footer: { enable: v } })" />
          </div>
          <div class="pref-switch-row">
            <span class="pref-switch-label">固定页脚</span>
            <Switch :checked="preferences.footer.fixed" :disabled="!preferences.footer.enable"
              @update:checked="(v: any) => updatePreferences({ footer: { fixed: v } })" />
          </div>
        </section>

        <!-- 版权 -->
        <section v-if="preferences.copyright.settingShow" class="pref-block">
          <h3 class="pref-block-title">版权</h3>
          <div class="pref-switch-row">
            <span class="pref-switch-label">启用版权</span>
            <Switch :checked="preferences.copyright.enable" :disabled="!preferences.footer.enable"
              @update:checked="(v: any) => updatePreferences({ copyright: { enable: v } })" />
          </div>
          <div class="pref-field-row">
            <span class="pref-switch-label">公司名称</span>
            <input class="pref-input" type="text" :value="preferences.copyright.companyName"
              :disabled="!preferences.copyright.enable || !preferences.footer.enable"
              @input="(e: any) => updatePreferences({ copyright: { companyName: e.target.value } })" />
          </div>
          <div class="pref-field-row">
            <span class="pref-switch-label">公司链接</span>
            <input class="pref-input" type="text" :value="preferences.copyright.companySiteLink"
              :disabled="!preferences.copyright.enable || !preferences.footer.enable"
              @input="(e: any) => updatePreferences({ copyright: { companySiteLink: e.target.value } })" />
          </div>
          <div class="pref-field-row">
            <span class="pref-switch-label">日期</span>
            <input class="pref-input" type="text" :value="preferences.copyright.date"
              :disabled="!preferences.copyright.enable || !preferences.footer.enable"
              @input="(e: any) => updatePreferences({ copyright: { date: e.target.value } })" />
          </div>
          <div class="pref-field-row">
            <span class="pref-switch-label">ICP</span>
            <input class="pref-input" type="text" :value="preferences.copyright.icp"
              :disabled="!preferences.copyright.enable || !preferences.footer.enable"
              @input="(e: any) => updatePreferences({ copyright: { icp: e.target.value } })" />
          </div>
          <div class="pref-field-row">
            <span class="pref-switch-label">ICP链接</span>
            <input class="pref-input" type="text" :value="preferences.copyright.icpLink"
              :disabled="!preferences.copyright.enable || !preferences.footer.enable"
              @input="(e: any) => updatePreferences({ copyright: { icpLink: e.target.value } })" />
          </div>
        </section>
      </template>

      <!-- ==================== 快捷键 ==================== -->
      <template v-if="activeTab === 'shortcutKey'">
        <section class="pref-block">
          <h3 class="pref-block-title">全局</h3>
          <div class="pref-switch-row">
            <span class="pref-switch-label">启用快捷键</span>
            <Switch :checked="preferences.shortcutKeys.enable"
              @update:checked="(v: any) => updatePreferences({ shortcutKeys: { enable: v } })" />
          </div>
          <div class="pref-shortcut-row">
            <span class="pref-switch-label">全局搜索</span>
            <span class="pref-shortcut-key">Ctrl K</span>
            <Switch :checked="preferences.shortcutKeys.globalSearch" :disabled="!preferences.shortcutKeys.enable"
              size="small" @update:checked="(v: any) => updatePreferences({ shortcutKeys: { globalSearch: v } })" />
          </div>
          <div class="pref-shortcut-row">
            <span class="pref-switch-label">退出登录</span>
            <span class="pref-shortcut-key">Alt Q</span>
            <Switch :checked="preferences.shortcutKeys.logout" :disabled="!preferences.shortcutKeys.enable" size="small"
              @update:checked="(v: any) => updatePreferences({ shortcutKeys: { logout: v } })" />
          </div>
          <div class="pref-shortcut-row">
            <span class="pref-switch-label">锁屏</span>
            <span class="pref-shortcut-key">Alt L</span>
            <Switch :checked="preferences.shortcutKeys.lockScreen" :disabled="!preferences.shortcutKeys.enable"
              size="small" @update:checked="(v: any) => updatePreferences({ shortcutKeys: { lockScreen: v } })" />
          </div>
          <div class="pref-shortcut-row">
            <span class="pref-switch-label">退出</span>
            <span class="pref-shortcut-key">Esc</span>
            <Switch :checked="preferences.shortcutKeys.escape" :disabled="!preferences.shortcutKeys.enable" size="small"
              @update:checked="(v: any) => updatePreferences({ shortcutKeys: { escape: v } })" />
          </div>
        </section>
      </template>

      <!-- ==================== 通用 ==================== -->
      <template v-if="activeTab === 'general'">
        <!-- 通用 -->
        <section class="pref-block">
          <h3 class="pref-block-title">通用</h3>
          <div class="pref-field-row">
            <span class="pref-switch-label">语言</span>
            <Select :value="preferences.app.locale" size="small" style="width: 140px" :options="localeItems"
              @update:value="(v: any) => updatePreferences({ app: { locale: v } })" />
          </div>
          <div class="pref-field-row">
            <span class="pref-switch-label">时区</span>
            <Select :value="preferences.app.timezone" size="small" style="width: 180px" :options="timezoneItems"
              show-search
              :filter-option="(input: string, option: any) => option.label.toLowerCase().includes(input.toLowerCase())"
              @update:value="(v: any) => updatePreferences({ app: { timezone: v } })" />
          </div>
          <div class="pref-switch-row">
            <span class="pref-switch-label">动态标题</span>
            <Switch :checked="preferences.app.dynamicTitle"
              @update:checked="(v: any) => updatePreferences({ app: { dynamicTitle: v } })" />
          </div>
          <div class="pref-switch-row">
            <span class="pref-switch-label">水印</span>
            <Switch :checked="preferences.app.watermark"
              @update:checked="(v: any) => { updatePreferences({ app: { watermark: v } }); if (!v) updatePreferences({ app: { watermarkContent: '' } }) }" />
          </div>
          <div v-if="preferences.app.watermark" class="pref-field-row">
            <span class="pref-switch-label">水印内容</span>
            <input class="pref-input" type="text" placeholder="水印内容" :value="preferences.app.watermarkContent"
              @input="(e: any) => updatePreferences({ app: { watermarkContent: e.target.value } })" />
          </div>
          <div class="pref-switch-row">
            <span class="pref-switch-label">检查更新</span>
            <Switch :checked="preferences.app.enableCheckUpdates"
              @update:checked="(v: any) => updatePreferences({ app: { enableCheckUpdates: v } })" />
          </div>
          <div class="pref-switch-row">
            <span class="pref-switch-label">启用复制偏好设置</span>
            <Switch :checked="preferences.app.enableCopyPreferences"
              @update:checked="(v: any) => updatePreferences({ app: { enableCopyPreferences: v } })" />
          </div>
        </section>

        <!-- 动画 -->
        <section class="pref-block">
          <h3 class="pref-block-title">动画</h3>
          <div class="pref-switch-row">
            <span class="pref-switch-label">进度条</span>
            <Switch :checked="preferences.transition.progress"
              @update:checked="(v: any) => updatePreferences({ transition: { progress: v } })" />
          </div>
          <div class="pref-switch-row">
            <span class="pref-switch-label">加载动画</span>
            <Switch :checked="preferences.transition.loading"
              @update:checked="(v: any) => updatePreferences({ transition: { loading: v } })" />
          </div>
          <div class="pref-switch-row">
            <span class="pref-switch-label">切换动画</span>
            <Switch :checked="preferences.transition.enable"
              @update:checked="(v: any) => updatePreferences({ transition: { enable: v } })" />
          </div>
          <div v-if="preferences.transition.enable" class="transition-presets">
            <div v-for="item in transitionPresets" :key="item" class="transition-preset-box"
              :class="{ 'outline-box-active': preferences.transition.name === item }"
              @click="updatePreferences({ transition: { name: item } })">
              <div class="transition-preset-anim" :class="`${item}-slow`"></div>
            </div>
          </div>
        </section>
      </template>
    </div>

    <!-- 底部操作（对齐 web-antd footer: 复制 + 清空缓存） -->
    <template #footer>
      <div class="drawer-footer">
        <Button v-if="preferences.app.enableCopyPreferences" block :disabled="!hasDiff" @click="handleCopy">
          <template #icon>
            <CopyOutlined />
          </template>
          复制偏好设置
        </Button>
        <Button block danger :disabled="!hasDiff" @click="handleClearCache">
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
  margin-bottom: 8px;
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

/* ============ 内置主题预设 ============ */
.builtin-theme-presets {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
}

.builtin-theme-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
}

.builtin-theme-box {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 40px;
  border-radius: 8px;
  border: 2px solid hsl(var(--border));
  background: hsl(var(--accent));
  transition: all 0.2s;
}

.builtin-theme-box.active {
  border-color: var(--primary);
}

.builtin-theme-color {
  width: 20px;
  height: 20px;
  border-radius: 6px;
}

/* ============ 自定义主题色选择器 ============ */
.builtin-theme-custom {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 6px;
}

.builtin-theme-custom-icon {
  position: absolute;
  z-index: 1;
  width: 20px;
  height: 20px;
  color: hsl(var(--foreground));
  opacity: 0.6;
  transition: opacity 0.2s;
}

.builtin-theme-box.group:hover .builtin-theme-custom-icon {
  opacity: 1;
}

.builtin-theme-color-input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  padding: 0;
  border: none;
  background: transparent;
  opacity: 0;
  cursor: pointer;
}

.builtin-theme-label {
  margin-top: 6px;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

/* ============ 布局预设（对齐 web-antd outline-box，一行3个） ============ */
.layout-presets {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.layout-preset-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 0 0 calc((100% - 24px) / 3);
  max-width: calc((100% - 24px) / 3);
  cursor: pointer;
  transition: all 0.2s;
}

.layout-preset-box {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 4px;
  border-radius: 6px;
  border: 1px solid hsl(var(--border));
  transition: all 0.2s;
}

.layout-preset-item:hover .layout-preset-box {
  background: hsl(var(--accent));
}

.layout-preset-item.active .layout-preset-box {
  border-color: var(--primary);
}

.layout-preset-label {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 8px;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
  text-align: center;
}

.layout-preset-item:hover .layout-preset-label {
  color: hsl(var(--foreground));
}

.layout-preset-tip {
  font-size: 12px;
  color: hsl(var(--muted-foreground));
  cursor: help;
}

/* 兼容旧样式 */
.layout-preset-name {
  font-size: 12px;
}

/* ============ Toggle Group ============ */
.toggle-group {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.toggle-item {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 28px;
  padding: 0 12px;
  border-radius: 6px;
  border: 1px solid hsl(var(--border));
  background: transparent;
  color: hsl(var(--foreground));
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.toggle-item:hover {
  background: hsl(var(--accent));
}

.toggle-item.active {
  border-color: var(--primary);
  background: var(--primary);
  color: hsl(var(--primary-foreground));
}

.toggle-item:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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

/* ============ 字段行 ============ */
.pref-field-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 10px 8px;
  border-radius: 6px;
  gap: 8px;
}

.pref-switch-label {
  font-size: 13px;
  color: hsl(var(--foreground));
}

/* ============ 数字输入行 ============ */
.pref-number-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 10px 8px;
  border-radius: 6px;
  gap: 8px;
}

.pref-number-suffix {
  font-size: 12px;
  color: hsl(var(--muted-foreground));
  white-space: nowrap;
}

.pref-tip {
  margin-top: 4px;
  padding: 0 8px;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

/* ============ 输入框 ============ */
.pref-input {
  flex: 1;
  max-width: 180px;
  height: 28px;
  padding: 0 8px;
  border-radius: 6px;
  border: 1px solid hsl(var(--border));
  background: transparent;
  color: hsl(var(--foreground));
  font-size: 12px;
  outline: none;
  transition: border-color 0.2s;
}

.pref-input:focus {
  border-color: var(--primary);
}

.pref-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ============ 快捷键行 ============ */
.pref-shortcut-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 10px 8px;
  border-radius: 6px;
  gap: 8px;
}

/* ============ 复选框行（侧边栏按钮组） ============ */
.pref-checkbox-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 10px 8px;
  border-radius: 6px;
  gap: 8px;
}

.pref-checkbox-row:hover {
  background: hsl(var(--accent));
}

.sidebar-btn-group {
  display: inline-flex;
  gap: 4px;
}

.sidebar-btn-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 28px;
  padding: 0 12px;
  border-radius: 6px;
  border: 1px solid hsl(var(--border));
  background: transparent;
  color: hsl(var(--foreground));
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.sidebar-btn-toggle:hover:not(:disabled) {
  background: hsl(var(--accent));
}

.sidebar-btn-toggle.active {
  border-color: var(--primary);
  background: var(--primary);
  color: hsl(var(--primary-foreground));
}

.sidebar-btn-toggle:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pref-shortcut-key {
  display: inline-flex;
  align-items: center;
  height: 24px;
  padding: 0 8px;
  margin-left: auto;
  margin-right: 8px;
  border-radius: 4px;
  border: 1px solid hsl(var(--border));
  background: hsl(var(--muted));
  color: hsl(var(--muted-foreground));
  font-size: 12px;
  line-height: 1;
  white-space: nowrap;
}

/* ============ 动画预览框（完全对齐 web-antd animation.vue + outline-box） ============ */
.transition-presets {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-top: 12px;
  margin-bottom: 8px;
  padding: 0 8px;
}

/* 对齐 web-antd 的 .outline-box 类（tailwind-config/theme.css） */
.transition-preset-box {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: 6px;
  outline: 1px solid hsl(var(--border));
  outline-offset: 0px;
  cursor: pointer;
  transition: all 0.2s;
}

.transition-preset-box:hover {
  outline-color: var(--primary);
}

.transition-preset-box.outline-box-active {
  outline: 2px solid var(--primary);
}

/* 对齐 web-antd：h-10 w-12 rounded-md bg-primary */
.transition-preset-anim {
  width: 48px;
  height: 40px;
  border-radius: 6px;
  background: var(--primary);
}

/* ============ 底部操作 ============ */
.drawer-footer {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 16px;
}
</style>
