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
  collapsed: boolean
  width: number
  collapsedWidth: number
  collapsedShowTitle: boolean
  visible: boolean
  autoActivateChild: boolean
  expandOnHover: boolean
  draggable: boolean
  collapsedButton: boolean
  fixedButton: boolean
}

export interface HeaderPreferences {
  enable: boolean
  mode: LayoutHeaderModeType
  menuAlign: LayoutHeaderMenuAlignType
}

export interface TabbarPreferences {
  enable: boolean
  persist: boolean
  showIcon: boolean
  styleType: 'brisk' | 'card' | 'chrome' | 'plain'
  draggable: boolean
  wheelable: boolean
  middleClickToClose: boolean
  showMore: boolean
  showRefresh: boolean
  showMaximize: boolean
  visitHistory: boolean
  maxCount: number
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
  enable: boolean
  fixed: boolean
}

export interface CopyrightPreferences {
  settingShow: boolean
  enable: boolean
  companyName: string
  companySiteLink: string
  date: string
  icp: string
  icpLink: string
}

export interface LogoPreferences {
  visible: boolean
}

export interface TransitionPreferences {
  progress: boolean
  name: string
  loading: boolean
  enable: boolean
}

export interface ShortcutKeysPreferences {
  enable: boolean
  globalSearch: boolean
  logout: boolean
  lockScreen: boolean
  escape: boolean
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
    enableStickyPreferencesNavigationBar: false,
    preferencesButtonPosition: 'auto'
  },
  theme: {
    mode: 'auto',
    colorPrimary: 'hsl(212 100% 45%)',
    builtinType: 'default',
    radius: '0.5',
    fontSize: 16,
    semiDarkSidebar: false,
    semiDarkSidebarSub: false,
    semiDarkHeader: false
  },
  sidebar: {
    collapsed: false,
    width: 230,
    collapsedWidth: 64,
    collapsedShowTitle: false,
    visible: true,
    autoActivateChild: false,
    expandOnHover: false,
    draggable: false,
    collapsedButton: true,
    fixedButton: false
  },
  header: {
    enable: true,
    mode: 'fixed',
    menuAlign: 'start'
  },
  tabbar: {
    enable: true,
    persist: true,
    showIcon: true,
    styleType: 'chrome',
    draggable: true,
    wheelable: true,
    middleClickToClose: true,
    showMore: true,
    showRefresh: true,
    showMaximize: true,
    visitHistory: false,
    maxCount: 30
  },
  breadcrumb: {
    enable: true,
    showIcon: true,
    showHome: false,
    styleType: 'normal',
    hideOnlyOne: false
  },
  navigation: {
    styleType: 'rounded',
    split: false,
    accordion: false
  },
  footer: {
    enable: false,
    fixed: false
  },
  copyright: {
    settingShow: true,
    enable: true,
    companyName: '',
    companySiteLink: '',
    date: '',
    icp: '',
    icpLink: ''
  },
  logo: {
    visible: true
  },
  transition: {
    progress: false,
    name: 'fade-slide',
    loading: true,
    enable: true
  },
  shortcutKeys: {
    enable: true,
    globalSearch: true,
    logout: false,
    lockScreen: false,
    escape: true
  },
  widget: {
    globalSearch: false,
    fullscreen: true,
    languageToggle: false,
    notification: true,
    themeToggle: true,
    sidebarToggle: true,
    lockScreen: false,
    refresh: true,
    timezone: false
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
