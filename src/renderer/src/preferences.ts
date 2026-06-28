import { defineOverridesPreferences } from '#/preferences/index'

// 透传 preferences 引擎的所有导出，使 `#/preferences` 同时可用
export {
  clearCache,
  initPreferences,
  preferences,
  preferencesInitialized,
  resetPreferences,
  updatePreferences,
  usePreferences
} from '#/preferences/index'
export type { Preferences } from '#/preferences/index'

/**
 * @description 项目配置文件
 * 只需要覆盖项目中的一部分配置，不需要的配置不用覆盖，会自动使用默认配置
 * !!! 更改配置后请清空缓存，否则可能不生效
 */
export const overridesPreferences = defineOverridesPreferences({
  app: {
    name: import.meta.env.VITE_APP_TITLE,
    defaultAvatar: 'https://avatar.vercel.sh/lx-video.svg',
    dynamicTitle: true,
    watermark: false,
    layout: 'sidebar-nav'
  },
  theme: {
    mode: 'light',
    colorPrimary: '#8b4c3b'
  },
  sidebar: {
    collapsed: false,
    width: 230
  },
  tabbar: {
    enable: true
  },
  breadcrumb: {
    enable: true
  },
  logo: {
    visible: true
  }
})
