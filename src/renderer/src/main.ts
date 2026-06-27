import './assets/main.css'

import { createApp } from 'vue'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'

import App from './App.vue'
import { initComponentAdapter } from '#/adapter/component'
import { setupMock } from '#/api/mock'
import { setupI18n } from '#/locales'
import { initPreferences } from '#/preferences/index'
import { overridesPreferences } from '#/preferences'
import { initStores } from '#/store'

/** 应用命名空间 */
const namespace = import.meta.env.VITE_APP_NAMESPACE || 'lx-video'

async function bootstrap() {
  const app = createApp(App)

  // 1. 偏好设置（同步至 localStorage）
  await initPreferences({ namespace, overrides: overridesPreferences })

  // 2. 国际化（必须在路由之前：路由定义中会调用 $t，需要 messages 已就绪）
  await setupI18n(app)

  // 3. 状态管理（Pinia）
  await initStores(app, { namespace })

  // 4. 组件适配器（注册 antd 表单组件）
  await initComponentAdapter()

  // 5. 注册 Mock 处理器（VITE_USE_MOCK=true 时生效）
  setupMock()

  // 6. 路由（动态加载，确保在 i18n 之后，守卫内部完成动态路由注册）
  const { router } = await import('#/router')
  app.use(router)

  // 7. 全量注册 antd（除表单组件外，message/notification 等也需挂载）
  app.use(Antd)

  // 8. 挂载
  app.mount('#app')
}

bootstrap()
