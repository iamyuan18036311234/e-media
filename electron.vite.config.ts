import { resolve } from 'path'
import { defineConfig } from 'electron-vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  main: {},
  preload: {},
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src'),
        '#': resolve('src/renderer/src')
      },
      // 确保 vue / vue-router / pinia 只有一个实例，避免 provide/inject 断链
      dedupe: ['vue', 'vue-router', 'pinia']
    },
    optimizeDeps: {
      // 明确预构建 ant-design-vue，避免子路径被拆分成多个模块实例
      include: ['ant-design-vue']
    },
    plugins: [vue(), tailwindcss()]
  }
})
