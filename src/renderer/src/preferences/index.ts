import { computed, reactive, ref, watch, watchEffect } from 'vue'

/** 偏好设置类型定义（参考 vben preferences 简化版） */
export interface AppPreferences {
  /** 应用名称 */
  name: string
  /** 默认头像 */
  defaultAvatar: string
  /** 动态标题 */
  dynamicTitle: boolean
  /** 是否启用水印 */
  watermark: boolean
  /** 紧凑模式 */
  compact: boolean
  /** 布局模式：side-mix-nav / top-nav / side-nav */
  layout: 'mixed-nav' | 'side-nav' | 'top-nav'
}

export interface ThemePreferences {
  /** 主题模式：auto | dark | light */
  mode: 'auto' | 'dark' | 'light'
  /** 主题色 */
  colorPrimary: string
  /** 半透明背景 */
  semiDarkSidebar: boolean
}

export interface SidebarPreferences {
  /** 是否折叠 */
  collapsed: boolean
  /** 宽度 */
  width: number
  /** 折叠宽度 */
  collapsedWidth: number
  /** 是否显示 */
  visible: boolean
}

export interface TabbarPreferences {
  /** 是否开启多标签 */
  enable: boolean
  /** 是否持久化 */
  persist: boolean
  /** 是否显示图标 */
  showIcon: boolean
  /** 标签风格：chrome（浏览器风格）/ plain / card / brisk */
  styleType: 'brisk' | 'card' | 'chrome' | 'plain'
  /** 是否允许拖拽排序 */
  draggable: boolean
  /** 是否允许滚轮滚动 */
  wheelable: boolean
  /** 中键点击关闭 */
  middleClickToClose: boolean
  /** 是否显示「更多」下拉 */
  showMore: boolean
  /** 是否显示刷新按钮 */
  showRefresh: boolean
  /** 是否显示最大化按钮 */
  showMaximize: boolean
}

export interface BreadcrumbPreferences {
  /** 是否开启面包屑 */
  enable: boolean
}

export interface LogoPreferences {
  /** 是否显示 Logo */
  visible: boolean
}

export interface Preferences {
  app: AppPreferences
  theme: ThemePreferences
  sidebar: SidebarPreferences
  tabbar: TabbarPreferences
  breadcrumb: BreadcrumbPreferences
  logo: LogoPreferences
}

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

/** 默认偏好设置 */
const defaultPreferences: Preferences = {
  app: {
    name: 'Vben Admin',
    defaultAvatar: 'https://avatar.vercel.sh/vben.svg',
    dynamicTitle: true,
    watermark: false,
    compact: false,
    layout: 'side-nav'
  },
  theme: {
    mode: 'auto',
    colorPrimary: 'hsl(212 100% 45%)',
    semiDarkSidebar: false
  },
  sidebar: {
    collapsed: false,
    width: 230,
    collapsedWidth: 64,
    visible: true
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
    showMaximize: true
  },
  breadcrumb: {
    enable: true
  },
  logo: {
    visible: true
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
