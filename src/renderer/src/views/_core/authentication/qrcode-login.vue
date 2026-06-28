<script lang="ts" setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Button, Spin } from 'ant-design-vue'
import { $t } from '#/locales'

defineOptions({ name: 'QrCodeLogin' })

const router = useRouter()
const loading = ref(false)
const refreshKey = ref(0)

function refresh() {
  refreshKey.value++
}

function handleScanSim() {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    window.location.href = '/auth/login'
  }, 1500)
}
</script>

<template>
  <div class="qr-login">
    <div class="head">
      <h2>{{ $t('page.auth.qrcodeLogin') }}</h2>
      <p>使用流光视频 App 扫码登录</p>
    </div>

    <div class="qr-wrap">
      <Spin :spinning="loading">
        <div :key="refreshKey" class="qr-box">
          <div class="qr-mock">
            <div class="qr-grid">
              <div v-for="i in 64" :key="i" class="qr-cell" :class="{ on: (i * 7 + refreshKey) % 3 === 0 }"></div>
            </div>
          </div>
        </div>
      </Spin>
      <div class="qr-actions">
        <Button type="link" size="small" @click="refresh">刷新二维码</Button>
        <Button type="link" size="small" @click="handleScanSim">模拟扫码</Button>
      </div>
    </div>

    <div class="back">
      <Button type="link" size="small" @click="router.push('/auth/login')"> 返回账号登录 </Button>
    </div>
  </div>
</template>

<style scoped>
.head {
  text-align: center;
  margin-bottom: 24px;
}

.head h2 {
  font-size: 22px;
  margin-bottom: 6px;
}

.head p {
  font-size: 13px;
  color: hsl(var(--muted-foreground));
}

.qr-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.qr-box {
  width: 200px;
  height: 200px;
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
  padding: 10px;
  background: hsl(var(--card));
}

.qr-mock {
  width: 100%;
  height: 100%;
}

.qr-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 2px;
  width: 100%;
  height: 100%;
}

.qr-cell {
  background: hsl(var(--muted));
  border-radius: 2px;
}

.qr-cell.on {
  background: hsl(var(--foreground));
}

.qr-actions {
  display: flex;
  gap: 8px;
}

.back {
  text-align: center;
  margin-top: 16px;
}
</style>
