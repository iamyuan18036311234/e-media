<script lang="ts" setup>
import { computed } from 'vue'
import { preferences } from '#/preferences'

defineOptions({ name: 'AuthPageLayout' })

const appName = computed(() => preferences.app.name)
</script>

<template>
  <div class="auth-layout h-screen w-screen overflow-hidden">
    <!-- 背景装饰 -->
    <div class="auth-bg">
      <div class="blob blob-1"></div>
      <div class="blob blob-2"></div>
      <div class="blob blob-3"></div>
    </div>

    <div class="auth-container">
      <!-- 左侧品牌区 -->
      <div class="auth-brand">
        <div class="brand-logo">
          <div class="logo-badge">流</div>
          <span class="logo-text">流光视频</span>
        </div>
        <h1 class="brand-title">{{ appName }}</h1>
        <p class="brand-desc">
          高效、智能的视频处理工作站<br />
          参照 vben web-antd 架构对齐布局
        </p>
        <div class="brand-footer">
          <span>© {{ new Date().getFullYear() }} 流光视频</span>
        </div>
      </div>

      <!-- 右侧表单区 -->
      <div class="auth-panel">
        <RouterView v-slot="{ Component }">
          <Transition name="fade-slide" mode="out-in">
            <component :is="Component" />
          </Transition>
        </RouterView>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-layout {
  --primary: v-bind('preferences.theme.colorPrimary');
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background: hsl(var(--background-deep));
  overflow: hidden;
}

.auth-bg {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.4;
}

.blob-1 {
  width: 400px;
  height: 400px;
  background: var(--primary);
  top: -100px;
  left: -100px;
}

.blob-2 {
  width: 360px;
  height: 360px;
  background: #e8743c;
  bottom: -120px;
  right: -80px;
}

.blob-3 {
  width: 280px;
  height: 280px;
  background: #f5a623;
  top: 40%;
  right: 30%;
  opacity: 0.25;
}

.auth-container {
  position: relative;
  z-index: 1;
  display: flex;
  width: min(960px, 92vw);
  height: min(560px, 86vh);
  background: hsl(var(--card) / 0.7);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 60px hsl(var(--overlay));
}

.auth-brand {
  flex: 1;
  padding: 48px 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  color: hsl(var(--foreground));
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 32px;
}

.logo-badge {
  width: 36px;
  height: 36px;
  border-radius: 9px;
  background: linear-gradient(135deg, var(--primary), #e8743c);
  color: #fff;
  font-weight: 700;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-text {
  font-size: 18px;
  font-weight: 600;
}

.brand-title {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 16px;
}

.brand-desc {
  font-size: 14px;
  line-height: 1.8;
  color: hsl(var(--muted-foreground));
}

.brand-footer {
  margin-top: auto;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

.auth-panel {
  flex: 1;
  padding: 48px 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.2s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
