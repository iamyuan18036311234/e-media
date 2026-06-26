<script setup lang="ts">
import { ref } from 'vue'
import { message } from 'ant-design-vue'
import {
  CheckCircleOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  CloseCircleOutlined
} from '@ant-design/icons-vue'

// Ant Design Vue 测试数据
const inputValue = ref('')
const switchValue = ref(true)
const radioValue = ref('a')
const checkboxValue = ref<string[]>(['apple'])
const selectValue = ref('apple')
const datePickerValue = ref()
const sliderValue = ref(30)
const loading = ref(false)

const selectOptions = [
  { value: 'apple', label: '苹果' },
  { value: 'banana', label: '香蕉' },
  { value: 'orange', label: '橙子' }
]

const radioOptions = [
  { label: '选项 A', value: 'a' },
  { label: '选项 B', value: 'b' },
  { label: '选项 C', value: 'c' }
]

const checkboxOptions = [
  { label: '苹果', value: 'apple' },
  { label: '香蕉', value: 'banana' },
  { label: '橙子', value: 'orange' }
]

// 表格数据
const columns = [
  { title: '姓名', dataIndex: 'name', key: 'name' },
  { title: '年龄', dataIndex: 'age', key: 'age' },
  { title: '地址', dataIndex: 'address', key: 'address' }
]
const tableData = [
  { key: '1', name: '张三', age: 28, address: '北京市朝阳区' },
  { key: '2', name: '李四', age: 32, address: '上海市浦东新区' },
  { key: '3', name: '王五', age: 25, address: '广州市天河区' }
]

// 标签页
const activeTab = ref('1')

// 消息提示
function showInfo(): void {
  message.info('这是一条信息提示')
}
function showSuccess(): void {
  message.success('操作成功！')
}
function showWarning(): void {
  message.warning('这是一条警告提示')
}
function showError(): void {
  message.error('操作失败！')
}

// 模拟加载
function handleLoading(): void {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    message.success('加载完成！')
  }, 2000)
}

// 提交表单
function handleSubmit(): void {
  if (!inputValue.value) {
    message.warning('请输入内容')
    return
  }
  message.success('提交成功：' + inputValue.value)
  inputValue.value = ''
}
</script>

<template>
  <div class="p-6 max-w-5xl mx-auto bg-white rounded-lg shadow-lg">
    <h1 class="text-3xl font-bold text-gray-800 mb-2">框架集成测试</h1>
    <p class="text-gray-500 mb-6">Ant Design Vue 4 + TailwindCSS 4</p>

    <!-- TailwindCSS 样式测试 -->
    <section class="mb-8">
      <h2 class="text-xl font-semibold text-gray-700 mb-4 border-l-4 border-blue-500 pl-3">
        1. TailwindCSS 样式测试
      </h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bg-blue-100 text-blue-800 p-4 rounded-lg text-center font-medium">蓝色卡片</div>
        <div class="bg-green-100 text-green-800 p-4 rounded-lg text-center font-medium">
          绿色卡片
        </div>
        <div class="bg-yellow-100 text-yellow-800 p-4 rounded-lg text-center font-medium">
          黄色卡片
        </div>
        <div class="bg-red-100 text-red-800 p-4 rounded-lg text-center font-medium">红色卡片</div>
      </div>
      <div class="mt-4 flex gap-2 flex-wrap">
        <span class="px-3 py-1 bg-purple-500 text-white rounded-full text-sm">圆角标签</span>
        <span class="px-3 py-1 bg-pink-500 text-white rounded text-sm">方角标签</span>
        <span class="px-3 py-1 bg-indigo-500 text-white rounded-md text-sm shadow-md"
          >阴影标签</span
        >
        <span
          class="px-3 py-1 bg-teal-500 text-white rounded-lg text-sm hover:bg-teal-600 transition cursor-pointer"
        >
          悬停效果
        </span>
      </div>
    </section>

    <!-- Ant Design Vue 按钮测试 -->
    <section class="mb-8">
      <h2 class="text-xl font-semibold text-gray-700 mb-4 border-l-4 border-green-500 pl-3">
        2. Ant Design Vue 按钮测试
      </h2>
      <div class="flex flex-wrap gap-3">
        <a-button type="primary" @click="showInfo">主要按钮</a-button>
        <a-button @click="showSuccess">默认按钮</a-button>
        <a-button type="dashed" @click="showWarning">虚线按钮</a-button>
        <a-button type="text" @click="showError">文本按钮</a-button>
        <a-button type="link">链接按钮</a-button>
        <a-button type="primary" danger>危险按钮</a-button>
        <a-button type="primary" :loading="loading" @click="handleLoading">加载按钮</a-button>
        <a-button type="primary" shape="circle" size="large">圆</a-button>
      </div>
      <div class="mt-3 flex gap-3">
        <a-button type="primary" :icon="h(CheckCircleOutlined)">成功</a-button>
        <a-button type="default" :icon="h(InfoCircleOutlined)">信息</a-button>
        <a-button type="default" :icon="h(WarningOutlined)">警告</a-button>
        <a-button type="default" danger :icon="h(CloseCircleOutlined)">错误</a-button>
      </div>
    </section>

    <!-- 表单组件测试 -->
    <section class="mb-8">
      <h2 class="text-xl font-semibold text-gray-700 mb-4 border-l-4 border-purple-500 pl-3">
        3. 表单组件测试
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">输入框</label>
          <a-input
            v-model:value="inputValue"
            placeholder="请输入内容"
            allow-clear
            @press-enter="handleSubmit"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">下拉选择</label>
          <a-select
            v-model:value="selectValue"
            :options="selectOptions"
            class="w-full"
            placeholder="请选择"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">开关</label>
          <a-switch v-model:checked="switchValue" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">滑块</label>
          <a-slider v-model:value="sliderValue" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">单选框</label>
          <a-radio-group v-model:value="radioValue" :options="radioOptions" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">复选框</label>
          <a-checkbox-group v-model:value="checkboxValue" :options="checkboxOptions" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">日期选择器</label>
          <a-date-picker v-model:value="datePickerValue" class="w-full" />
        </div>
        <div class="flex items-end">
          <a-button type="primary" @click="handleSubmit">提交表单</a-button>
        </div>
      </div>
    </section>

    <!-- 标签页 + 表格测试 -->
    <section class="mb-8">
      <h2 class="text-xl font-semibold text-gray-700 mb-4 border-l-4 border-orange-500 pl-3">
        4. 标签页 + 表格测试
      </h2>
      <a-tabs v-model:active-key="activeTab">
        <a-tab-pane key="1" tab="用户列表">
          <a-table :columns="columns" :data-source="tableData" :pagination="false" size="middle" />
        </a-tab-pane>
        <a-tab-pane key="2" tab="数据统计">
          <div class="grid grid-cols-3 gap-4">
            <a-card class="text-center">
              <p class="text-3xl font-bold text-blue-600">128</p>
              <p class="text-gray-500 text-sm mt-1">总用户数</p>
            </a-card>
            <a-card class="text-center">
              <p class="text-3xl font-bold text-green-600">96</p>
              <p class="text-gray-500 text-sm mt-1">活跃用户</p>
            </a-card>
            <a-card class="text-center">
              <p class="text-3xl font-bold text-orange-600">32</p>
              <p class="text-gray-500 text-sm mt-1">非活跃用户</p>
            </a-card>
          </div>
        </a-tab-pane>
        <a-tab-pane key="3" tab="操作日志">
          <a-timeline>
            <a-timeline-item color="green">创建用户"张三" - 2026-06-24 10:00</a-timeline-item>
            <a-timeline-item color="blue">更新用户"李四"信息 - 2026-06-24 11:30</a-timeline-item>
            <a-timeline-item color="red">删除用户"赵六" - 2026-06-24 14:00</a-timeline-item>
            <a-timeline-item color="gray">系统维护完成 - 2026-06-24 16:00</a-timeline-item>
          </a-timeline>
        </a-tab-pane>
      </a-tabs>
    </section>

    <!-- 其他组件测试 -->
    <section class="mb-8">
      <h2 class="text-xl font-semibold text-gray-700 mb-4 border-l-4 border-pink-500 pl-3">
        5. 其他组件测试
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 class="text-sm font-medium text-gray-600 mb-2">标签</h3>
          <div class="flex gap-2 flex-wrap">
            <a-tag color="blue">蓝色</a-tag>
            <a-tag color="green">绿色</a-tag>
            <a-tag color="orange">橙色</a-tag>
            <a-tag color="red">红色</a-tag>
            <a-tag color="purple">紫色</a-tag>
          </div>
        </div>
        <div>
          <h3 class="text-sm font-medium text-gray-600 mb-2">徽标数</h3>
          <div class="flex gap-4">
            <a-badge :count="5">
              <a-button>消息</a-button>
            </a-badge>
            <a-badge :count="99" :overflow-count="10">
              <a-button>通知</a-button>
            </a-badge>
            <a-badge dot>
              <a-button>待办</a-button>
            </a-badge>
          </div>
        </div>
        <div>
          <h3 class="text-sm font-medium text-gray-600 mb-2">头像</h3>
          <div class="flex gap-2">
            <a-avatar size="large" style="background-color: #1890ff">U</a-avatar>
            <a-avatar size="default" style="background-color: #52c41a">A</a-avatar>
            <a-avatar size="small" style="background-color: #faad14">B</a-avatar>
          </div>
        </div>
        <div>
          <h3 class="text-sm font-medium text-gray-600 mb-2">进度条</h3>
          <a-progress :percent="70" status="active" />
        </div>
      </div>
    </section>

    <!-- 警告提示 -->
    <section class="mb-8">
      <h2 class="text-xl font-semibold text-gray-700 mb-4 border-l-4 border-indigo-500 pl-3">
        6. 警告提示
      </h2>
      <div class="space-y-2">
        <a-alert message="成功提示" type="success" show-icon />
        <a-alert message="信息提示" type="info" show-icon />
        <a-alert message="警告提示" type="warning" show-icon />
        <a-alert message="错误提示" type="error" show-icon />
        <a-alert
          message="可关闭提示"
          type="info"
          closable
          description="这是一个可关闭的提示框，点击右侧的关闭按钮可以关闭。"
        />
      </div>
    </section>

    <!-- 混合使用 TailwindCSS + Ant Design Vue -->
    <section>
      <h2 class="text-xl font-semibold text-gray-700 mb-4 border-l-4 border-teal-500 pl-3">
        7. 混合使用（TailwindCSS 布局 + Ant Design Vue 组件）
      </h2>
      <div class="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-800">混合布局示例</h3>
          <a-button type="primary" size="small">操作按钮</a-button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            v-for="i in 3"
            :key="i"
            class="bg-white p-4 rounded-lg shadow hover:shadow-lg transition"
          >
            <a-avatar :size="48" style="background-color: #1890ff">{{ i }}</a-avatar>
            <p class="mt-2 font-medium text-gray-800">卡片 {{ i }}</p>
            <p class="text-sm text-gray-500 mt-1">使用 TailwindCSS 布局，Ant Design Vue 组件</p>
            <a-button type="link" size="small" class="p-0 mt-2">查看详情</a-button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import { h } from 'vue'

export default {
  name: 'FrameworkTest'
}
</script>
