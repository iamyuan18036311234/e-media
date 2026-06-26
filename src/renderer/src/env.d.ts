/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_APP_NAMESPACE: string
  readonly VITE_APP_VERSION: string
  readonly VITE_BASE: string
  readonly VITE_GLOB_API_URL: string
  readonly VITE_USE_MOCK: string
  readonly VITE_DEVTOOLS: string
  readonly VITE_ROUTER_HISTORY: string
  readonly VITE_INJECT_APP_LOADING: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
