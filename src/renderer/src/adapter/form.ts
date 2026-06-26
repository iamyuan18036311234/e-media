/**
 * 表单适配器（简化版，对应 vben 的 adapter/form）
 * 完整版需要 @vben/common-ui 的 setupVbenForm，这里仅记录组件配置
 */
import type { ComponentType } from './component'

export type { ComponentType }

/** antd 组件的 v-model 属性名映射 */
export const modelPropNameMap: Record<string, string> = {
  // antd 默认 v-model:value
  Checkbox: 'checked',
  Radio: 'checked',
  Switch: 'checked',
  Upload: 'fileList'
}

/** 表单校验规则（简化版） */
export const formRules = {
  required: (value: any, _params: any, ctx: any) => {
    if (value === undefined || value === null || value.length === 0) {
      return `${ctx.label}不能为空`
    }
    return true
  },
  selectRequired: (value: any, _params: any, ctx: any) => {
    if (value === undefined || value === null) {
      return `请选择${ctx.label}`
    }
    return true
  }
}

/** 安装表单适配器（占位：完整版需 @vben/common-ui） */
export function setupFormAdapter() {
  // antd 组件库默认 v-model:value
  // modelPropNameMap 已在上方导出供表单使用
}
