/** 用户信息类型 */
export interface UserInfo {
  /** 头像 */
  avatar: string
  /** 首页路径 */
  homePath?: string
  /** 真实姓名 */
  realName: string
  /** 角色列表 */
  roles: string[]
  /** 用户名 */
  username: string
  /** 邮箱 */
  email?: string
  [key: string]: any
}

/** 访问码类型 */
export type AccessCodesType = string[]
