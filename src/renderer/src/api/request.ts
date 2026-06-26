/** 是否启用 Mock 数据 */
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

/** 接口基础地址 */
const BASE_API_URL = import.meta.env.VITE_GLOB_API_URL || '/api'

/** Mock 处理器 */
type MockHandler = (body?: any) => Promise<any> | any
const mockHandlers = new Map<string, MockHandler>()

/** 注册 Mock 处理器 */
export function registerMock(url: string, handler: MockHandler) {
  mockHandlers.set(url, handler)
}

/** 模拟网络延迟 */
function delay(ms = 300) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** 统一请求方法 */
async function doRequest<T>(method: string, url: string, data?: any): Promise<T> {
  // Mock 模式：命中已注册的 mock 处理器
  if (USE_MOCK && mockHandlers.has(url)) {
    await delay()
    return mockHandlers.get(url)!(data) as T
  }

  // 真实请求
  const resp = await fetch(`${BASE_API_URL}${url}`, {
    method,
    headers: {
      'Content-Type': 'application/json'
    },
    body: data ? JSON.stringify(data) : undefined
  })
  if (!resp.ok) {
    throw new Error(`请求失败: ${resp.status} ${resp.statusText}`)
  }
  return (await resp.json()) as T
}

/** 业务请求客户端（带 token 等） */
export const requestClient = {
  get<T>(url: string): Promise<T> {
    return doRequest<T>('GET', url)
  },
  post<T>(url: string, data?: any): Promise<T> {
    return doRequest<T>('POST', url, data)
  },
  put<T>(url: string, data?: any): Promise<T> {
    return doRequest<T>('PUT', url, data)
  },
  delete<T>(url: string): Promise<T> {
    return doRequest<T>('DELETE', url)
  }
}

/** 基础请求客户端（不带业务拦截，如登录、登出） */
export const baseRequestClient = requestClient
