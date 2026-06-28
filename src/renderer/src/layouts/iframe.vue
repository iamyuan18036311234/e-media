<script lang="ts" setup>
import { useRoute } from 'vue-router'

defineOptions({ name: 'IFrameView' })

const route = useRoute()
const src = (route.meta?.link as string) || (route.meta?.iframeSrc as string)
</script>

<template>
  <div class="iframe-view h-full w-full">
    <iframe v-if="src" :src="src" class="iframe" frameborder="0" allowfullscreen />
    <div v-else class="iframe-empty">无可用 iframe 地址</div>
  </div>
</template>

<style scoped>
.iframe-view {
  display: flex;
  background: hsl(var(--background-deep));
}

.iframe {
  flex: 1;
  border: none;
  background: hsl(var(--card));
  border-radius: 8px;
}

.iframe-empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: hsl(var(--muted-foreground));
}
</style>
