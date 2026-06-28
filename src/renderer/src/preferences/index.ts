import { computed, reactive, ref, watch, watchEffect } from 'vue'

/** 偏好设置类型定义（对齐 web-antd @vben/preferences） */

/** 布局类型 */
export type LayoutType =
  | 'full-content'
  | 'header-mixed-nav'
  | 'header-nav'
  | 'header-sidebar-nav'
  | 'mixed-nav'
  | 'sidebar-mixed-nav'
  | 'sidebar-nav'

/** 主题模式 */
export type ThemeModeType = 'auto' | 'dark' | 'light'

/** 内置主题类型 */
export type BuiltinThemeType =
  | 'custom'
  | 'deep-blue'
  | 'deep-green'
  | 'default'
  | 'gray'
  | 'green'
  | 'neutral'
  | 'orange'
  | 'pink'
  | 'rose'
  | 'sky-blue'
  | 'slate'
  | 'violet'
  | 'yellow'
  | 'zinc'

/** 内容紧凑模式 */
export type ContentCompactType = 'compact' | 'wide'

/** 头部模式 */
export type LayoutHeaderModeType = 'auto' | 'auto-scroll' | 'fixed' | 'static'

/** 头部菜单对齐 */
export type LayoutHeaderMenuAlignType = 'center' | 'end' | 'start'

/** 导航风格 */
export type NavigationStyleType = 'plain' | 'rounded'

/** 面包屑风格 */
export type BreadcrumbStyleType = 'background' | 'normal'

/** 偏好设置按钮位置 */
export type PreferencesButtonPositionType = 'auto' | 'fixed' | 'header' | 'user-dropdown'

export interface AppPreferences {
  name: string
  defaultAvatar: string
  dynamicTitle: boolean
  watermark: boolean
  watermarkContent: string
  compact: boolean
  layout: LayoutType
  contentCompact: ContentCompactType
  colorGrayMode: boolean
  colorWeakMode: boolean
  locale: string
  timezone: string
  enableCheckUpdates: boolean
  enableCopyPreferences: boolean
  enableStickyPreferencesNavigationBar: boolean
  preferencesButtonPosition: PreferencesButtonPositionType
}

export interface ThemePreferences {
  mode: ThemeModeType
  colorPrimary: string
  builtinType: BuiltinThemeType
  radius: string
  fontSize: number
  semiDarkSidebar: boolean
  semiDarkSidebarSub: boolean
  semiDarkHeader: boolean
}

export interface SidebarPreferences {
  /** 点击目录时自动激活子菜单 */
  autoActivateChild: boolean
  /** 侧边栏是否折叠 */
  collapsed: boolean
  /** 侧边栏折叠按钮是否可见 */
  collapsedButton: boolean
  /** 侧边栏折叠时，是否显示title */
  collapsedShowTitle: boolean
  /** 侧边栏折叠宽度 */
  collapseWidth: number
  /** 侧边栏菜单拖拽 */
  draggable: boolean
  /** 侧边栏是否可见 */
  enable: boolean
  /** 菜单自动展开状态 */
  expandOnHover: boolean
  /** 侧边栏扩展区域是否折叠 */
  extraCollapse: boolean
  /** 侧边栏扩展区域折叠宽度 */
  extraCollapsedWidth: number
  /** 侧边栏固定按钮是否可见 */
  fixedButton: boolean
  /** 侧边栏是否隐藏 - css */
  hidden: boolean
  /** 混合侧边栏宽度 */
  mixedWidth: number
  /** 侧边栏宽度 */
  width: number
}

export interface HeaderPreferences {
  /** 顶栏是否启用 */
  enable: boolean
  /** 顶栏高度 */
  height: number
  /** 顶栏是否隐藏,css-隐藏 */
  hidden: boolean
  /** 顶栏菜单位置 */
  menuAlign: LayoutHeaderMenuAlignType
  /** header显示模式 */
  mode: LayoutHeaderModeType
}

export interface TabbarPreferences {
  /** 是否开启多标签页拖拽 */
  draggable: boolean
  /** 是否开启多标签页 */
  enable: boolean
  /** 标签页高度 */
  height: number
  /** 开启标签页缓存功能 */
  keepAlive: boolean
  /** 限制最大数量 */
  maxCount: number
  /** 是否点击中键时关闭标签 */
  middleClickToClose: boolean
  /** 是否持久化标签 */
  persist: boolean
  /** 是否开启多标签页图标 */
  showIcon: boolean
  /** 显示最大化按钮 */
  showMaximize: boolean
  /** 显示更多按钮 */
  showMore: boolean
  /** 显示刷新按钮 */
  showRefresh: boolean
  /** 标签页风格 */
  styleType: 'brisk' | 'card' | 'chrome' | 'plain'
  /** 是否开启访问历史记录 */
  visitHistory: boolean
  /** 是否开启鼠标滚轮响应 */
  wheelable: boolean
}

export interface BreadcrumbPreferences {
  enable: boolean
  showIcon: boolean
  showHome: boolean
  styleType: BreadcrumbStyleType
  hideOnlyOne: boolean
}

export interface NavigationPreferences {
  styleType: NavigationStyleType
  split: boolean
  accordion: boolean
}

export interface FooterPreferences {
  /** 底栏是否可见 */
  enable: boolean
  /** 底栏是否固定 */
  fixed: boolean
  /** 底栏高度 */
  height: number
}

export interface CopyrightPreferences {
  /** 版权公司名 */
  companyName: string
  /** 版权公司名链接 */
  companySiteLink: string
  /** 版权日期 */
  date: string
  /** 版权是否可见 */
  enable: boolean
  /** 备案号 */
  icp: string
  /** 备案号链接 */
  icpLink: string
  /** 设置面板是否显示 */
  settingShow?: boolean
}

export interface LogoPreferences {
  /** logo是否可见 */
  enable: boolean
  /** logo图片适应方式 */
  fit: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down'
  /** logo地址 */
  source: string
  /** 暗色主题logo地址 (可选，若不设置则使用 source) */
  sourceDark?: string
}

export interface TransitionPreferences {
  progress: boolean
  name: string
  loading: boolean
  enable: boolean
}

export interface ShortcutKeysPreferences {
  /** 是否启用快捷键-全局 */
  enable: boolean
  /** 是否启用全局关闭窗口快捷键 */
  globalEscape: boolean
  /** 是否启用全局锁屏快捷键 */
  globalLockScreen: boolean
  /** 是否启用全局注销快捷键 */
  globalLogout: boolean
  /** 是否启用全局偏好设置快捷键 */
  globalPreferences: boolean
  /** 是否启用全局搜索快捷键 */
  globalSearch: boolean
}

export interface WidgetPreferences {
  globalSearch: boolean
  fullscreen: boolean
  languageToggle: boolean
  notification: boolean
  themeToggle: boolean
  sidebarToggle: boolean
  lockScreen: boolean
  refresh: boolean
  timezone: boolean
}

export interface Preferences {
  app: AppPreferences
  theme: ThemePreferences
  sidebar: SidebarPreferences
  header: HeaderPreferences
  tabbar: TabbarPreferences
  breadcrumb: BreadcrumbPreferences
  navigation: NavigationPreferences
  footer: FooterPreferences
  copyright: CopyrightPreferences
  logo: LogoPreferences
  transition: TransitionPreferences
  shortcutKeys: ShortcutKeysPreferences
  widget: WidgetPreferences
}

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

/** 默认偏好设置（对齐 web-antd defaults） */
const defaultPreferences: Preferences = {
  app: {
    name: 'Vben Admin',
    defaultAvatar: 'https://avatar.vercel.sh/vben.svg',
    dynamicTitle: true,
    watermark: false,
    watermarkContent: '',
    compact: false,
    layout: 'sidebar-nav',
    contentCompact: 'wide',
    colorGrayMode: false,
    colorWeakMode: false,
    locale: 'zh-CN',
    timezone: 'Asia/Shanghai',
    enableCheckUpdates: true,
    enableCopyPreferences: true,
    enableStickyPreferencesNavigationBar: true,
    preferencesButtonPosition: 'auto'
  },
  theme: {
    mode: 'dark',
    colorPrimary: 'hsl(212 100% 45%)',
    builtinType: 'default',
    radius: '0.5',
    fontSize: 16,
    semiDarkSidebar: false,
    semiDarkSidebarSub: false,
    semiDarkHeader: false
  },
  sidebar: {
    autoActivateChild: false,
    collapsed: false,
    collapsedButton: true,
    collapsedShowTitle: false,
    collapseWidth: 60,
    draggable: true,
    enable: true,
    expandOnHover: true,
    extraCollapse: false,
    extraCollapsedWidth: 60,
    fixedButton: true,
    hidden: false,
    mixedWidth: 80,
    width: 224
  },
  header: {
    enable: true,
    height: 50,
    hidden: false,
    menuAlign: 'start',
    mode: 'fixed'
  },
  tabbar: {
    draggable: true,
    enable: true,
    height: 38,
    keepAlive: true,
    maxCount: 0,
    middleClickToClose: false,
    persist: true,
    showIcon: true,
    showMaximize: true,
    showMore: true,
    showRefresh: true,
    styleType: 'chrome',
    visitHistory: true,
    wheelable: true
  },
  breadcrumb: {
    enable: true,
    hideOnlyOne: false,
    showHome: false,
    showIcon: true,
    styleType: 'normal'
  },
  navigation: {
    accordion: true,
    split: true,
    styleType: 'rounded'
  },
  footer: {
    enable: false,
    fixed: false,
    height: 32
  },
  copyright: {
    companyName: 'Vben',
    companySiteLink: 'https://www.vben.pro',
    date: '2024',
    enable: true,
    icp: '闽ICP备19024351号',
    icpLink: 'https://beian.miit.gov.cn/',
    settingShow: true
  },
  logo: {
    enable: true,
    fit: 'contain',
    source: 'https://unpkg.com/@vbenjs/static-source@0.1.7/source/logo-v1.webp'
  },
  transition: {
    enable: true,
    loading: true,
    name: 'fade-slide',
    progress: true
  },
  shortcutKeys: {
    enable: true,
    globalEscape: false,
    globalLockScreen: true,
    globalLogout: true,
    globalPreferences: true,
    globalSearch: true
  },
  widget: {
    fullscreen: true,
    globalSearch: true,
    languageToggle: true,
    lockScreen: true,
    notification: true,
    refresh: true,
    sidebarToggle: true,
    themeToggle: true,
    timezone: true
  }
}

/** 响应式偏好设置状态 */
export const preferences = reactive<Preferences>(structuredClone(defaultPreferences))

/** 项目覆盖配置函数 */
export function defineOverridesPreferences(
  overrides: DeepPartial<Preferences>
): DeepPartial<Preferences> {
  return overrides
}

/** 深度合并 */
function mergeDeep<T>(target: T, source: DeepPartial<T>): T {
  if (!source) return target
  for (const key in source) {
    const val = (source as Record<string, unknown>)[key]
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      mergeDeep(
        target[key as keyof T] as unknown as Record<string, unknown>,
        val as DeepPartial<Record<string, unknown>>
      )
    } else if (val !== undefined) {
      ;(target as Record<string, unknown>)[key] = val
    }
  }
  return target
}

/** 从 localStorage 读取缓存的偏好 */
function loadCachedPreferences(namespace: string): DeepPartial<Preferences> {
  try {
    const raw = localStorage.getItem(`${namespace}-preferences`)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

/** 持久化偏好到 localStorage */
function persistPreferences(namespace: string) {
  try {
    localStorage.setItem(`${namespace}-preferences`, JSON.stringify(preferences))
  } catch {
    // ignore
  }
}

/** 是否已初始化 */
let initialized = false

/** 初始化偏好设置 */
export async function initPreferences(options: {
  namespace: string
  overrides: DeepPartial<Preferences>
}): Promise<void> {
  const { namespace, overrides } = options

  // 重置为默认值
  Object.assign(preferences, structuredClone(defaultPreferences))

  // 合并项目覆盖配置
  mergeDeep(preferences, overrides)

  // 合并 localStorage 中的用户缓存
  mergeDeep(preferences, loadCachedPreferences(namespace))

  // 监听变化并持久化
  watch(
    preferences,
    () => {
      persistPreferences(namespace)
    },
    { deep: true }
  )

  // 同步 .dark 类到 <html>，对齐 web-antd 的 updateCSSVariables 逻辑
  // 让 :global(html.dark) 与 antd darkAlgorithm 同时生效
  watchEffect(() => {
    if (typeof document === 'undefined') return
    const dark =
      preferences.theme.mode === 'auto' ? isSystemDark.value : preferences.theme.mode === 'dark'
    document.documentElement.classList.toggle('dark', dark)
  })

  initialized = true
}

/** 更新偏好设置 */
export function updatePreferences(updates: DeepPartial<Preferences>): void {
  mergeDeep(preferences, updates)
}

/** 重置偏好设置为默认值 */
export function resetPreferences(): void {
  Object.assign(preferences, structuredClone(defaultPreferences))
}

/** 清空本地缓存 */
export function clearCache(): void {
  try {
    Object.keys(localStorage).forEach((key) => {
      if (key.endsWith('-preferences')) {
        localStorage.removeItem(key)
      }
    })
  } catch {
    // ignore
  }
}

/** 系统暗色模式媒体查询 */
const mediaQuery =
  typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)') : null

/** 系统是否暗色 */
export const isSystemDark = ref(false)
if (mediaQuery) {
  isSystemDark.value = mediaQuery.matches
  mediaQuery.addEventListener('change', (e) => {
    isSystemDark.value = e.matches
  })
}

/** 偏好设置组合式函数 */
export function usePreferences() {
  const isDark = computed(() => {
    if (preferences.theme.mode === 'auto') return isSystemDark.value
    return preferences.theme.mode === 'dark'
  })

  const isMobile = computed(() => false)

  return {
    preferences,
    isDark,
    isMobile,
    updatePreferences
  }
}

export { initialized as preferencesInitialized }
