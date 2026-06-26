/**
 * 通用组件适配器（简化版，对应 vben 的 adapter/component）
 * 将 antd 表单组件注册到全局注册表，并附带默认占位符
 */
import type { Component, SetupContext } from 'vue'
import { h } from 'vue'

import {
  AutoComplete,
  Checkbox,
  CheckboxGroup,
  DatePicker,
  Divider,
  Input,
  InputNumber,
  InputPassword,
  Mentions,
  notification,
  Radio,
  RadioGroup,
  RangePicker,
  Rate,
  Select,
  Space,
  Switch,
  Textarea,
  TimePicker,
  TreeSelect,
  Upload
} from 'ant-design-vue'

export type ComponentType =
  | 'AutoComplete'
  | 'Checkbox'
  | 'CheckboxGroup'
  | 'DatePicker'
  | 'Divider'
  | 'Input'
  | 'InputNumber'
  | 'InputPassword'
  | 'Mentions'
  | 'Radio'
  | 'RadioGroup'
  | 'RangePicker'
  | 'Rate'
  | 'Select'
  | 'Space'
  | 'Switch'
  | 'Textarea'
  | 'TimePicker'
  | 'TreeSelect'
  | 'Upload'
  | string

/** 为组件添加默认占位符 */
const withDefaultPlaceholder = <T extends Component>(component: T, type: 'input' | 'select') => {
  return (props: any, { attrs, slots }: Omit<SetupContext, 'expose'>) => {
    const placeholder = props?.placeholder || (type === 'input' ? '请输入' : '请选择')
    return h(component, { ...props, ...attrs, placeholder }, slots)
  }
}

/** 全局组件注册表（供表单等场景按名称取用组件） */
export const globalComponentRegistry: Record<string, Component> = {}

/** 全局消息提示（占位） */
export const globalMessage = {
  /** 复制偏好成功提示 */
  copyPreferencesSuccess(title: string, content: string) {
    notification.success({
      description: content,
      message: title,
      placement: 'bottomRight'
    })
  }
}

/** 初始化组件适配器：将 antd 组件注册到全局注册表 */
export async function initComponentAdapter() {
  const components: Partial<Record<ComponentType, Component>> = {
    AutoComplete,
    Checkbox,
    CheckboxGroup,
    DatePicker,
    Divider,
    Input: withDefaultPlaceholder(Input, 'input'),
    InputNumber: withDefaultPlaceholder(InputNumber, 'input'),
    InputPassword: withDefaultPlaceholder(InputPassword, 'input'),
    Mentions: withDefaultPlaceholder(Mentions, 'input'),
    Radio,
    RadioGroup,
    RangePicker,
    Rate,
    Select: withDefaultPlaceholder(Select, 'select'),
    Space,
    Switch,
    Textarea: withDefaultPlaceholder(Textarea, 'input'),
    TimePicker,
    TreeSelect: withDefaultPlaceholder(TreeSelect, 'select'),
    Upload
  }

  Object.assign(globalComponentRegistry, components)
}
