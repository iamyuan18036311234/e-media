<script lang="ts" setup>
import { Button, Result } from 'ant-design-vue'
import { useRouter } from 'vue-router'

defineOptions({ name: 'FallbackNotFound' })

const router = useRouter()
function goHome() {
  router.push('/')
}
</script>

<template>
  <div class="flex h-full w-full items-center justify-center p-8">
    <Result status="404" title="404" sub-title="抱歉，您访问的页面不存在。">
      <template #extra>
        <Button type="primary" @click="goHome">返回首页</Button>
      </template>
    </Result>
  </div>
</template>
