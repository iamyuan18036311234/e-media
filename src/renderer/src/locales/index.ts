import type { App } from 'vue'

import { ref } from 'vue'
import { createI18n } from 'vue-i18n'

import antdEnUS from 'ant-design-vue/es/locale/en_US'
import antdZhCN from 'ant-design-vue/es/locale/zh_CN'
import dayjs from 'dayjs'

type SupportedLanguagesType = 'en-US' | 'zh-CN'

const i18n = createI18n({
  legacy: false,
  locale: 'zh-CN',
  fallbackLocale: 'en-US',
  messages: {
    'zh-CN': {},
    'en-US': {}
  }
})

/** antd 语言包（根据当前 i18n 语言动态返回） */
const antdLocale = ref(antdZhCN)

/** 动态加载所有语言包文件 */
const modules = import.meta.glob('./langs/**/*.json')

/** 按语言分组构建加载函数 */
function buildLocalesMap() {
  const localesMap: Record<string, () => Promise<Record<string, any>>> = {}
  for (const path of Object.keys(modules)) {
    const match = path.match(/\.\/langs\/([^/]+)\/(.*)\.json$/)
    if (!match) continue
    const lang = match[1]
    if (!localesMap[lang]) {
      localesMap[lang] = async () => {
        const all = Object.entries(modules).filter(([p]) => p.includes(`/langs/${lang}/`))
        const merged: Record<string, any> = {}
        for (const [, l] of all) {
          const mod = (await l()) as Record<string, any>
          Object.assign(merged, mod.default ?? mod)
        }
        return merged
      }
    }
  }
  return localesMap
}

const localesMap = buildLocalesMap()

/** 加载应用语言包 */
async function loadMessages(lang: SupportedLanguagesType) {
  const [appLocaleMessages] = await Promise.all([localesMap[lang]?.(), loadThirdPartyMessage(lang)])
  return appLocaleMessages ?? {}
}

/** 加载第三方组件库语言包 */
async function loadThirdPartyMessage(lang: SupportedLanguagesType) {
  await Promise.all([loadAntdLocale(lang), loadDayjsLocale(lang)])
}

/** 加载 dayjs 语言包 */
async function loadDayjsLocale(lang: SupportedLanguagesType) {
  let locale
  switch (lang) {
    case 'en-US': {
      locale = await import('dayjs/locale/en')
      break
    }
    case 'zh-CN': {
      locale = await import('dayjs/locale/zh-cn')
      break
    }
    default: {
      locale = await import('dayjs/locale/en')
    }
  }
  if (locale) {
    dayjs.locale(locale)
  }
}

/** 加载 antd 语言包 */
async function loadAntdLocale(lang: SupportedLanguagesType) {
  switch (lang) {
    case 'en-US': {
      antdLocale.value = antdEnUS
      break
    }
    case 'zh-CN': {
      antdLocale.value = antdZhCN
      break
    }
  }
}

/** 切换语言 */
export async function setLocale(lang: SupportedLanguagesType) {
  const messages = await loadMessages(lang)
  i18n.global.setLocaleMessage(lang, messages)
  i18n.global.locale.value = lang
}

/** 安装 i18n */
export async function setupI18n(app: App) {
  const defaultLocale: SupportedLanguagesType = 'zh-CN'
  const messages = await loadMessages(defaultLocale)
  i18n.global.setLocaleMessage(defaultLocale, messages)
  i18n.global.locale.value = defaultLocale
  app.use(i18n)
}

/** 翻译函数 */
export const $t = i18n.global.t

/** antd 语言包（响应式） */
export { antdLocale }

export { i18n }
