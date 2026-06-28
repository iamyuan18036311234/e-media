<script lang="ts" setup>
import { ReloadOutlined } from '@ant-design/icons-vue'

defineOptions({ name: 'TabsToolRefresh' })

const emit = defineEmits<(e: 'refresh') => void>()

function onClick() {
  emit('refresh')
}
</script>

<template>
  <div
    class="tabs-tool tabs-tool-refresh flex h-full cursor-pointer items-center border-l border-border px-2 text-muted-foreground hover:bg-muted hover:text-foreground"
    @click="onClick"
  >
    <ReloadOutlined class="text-base" />
  </div>
</template>

<style scoped>
.tabs-tool {
  --text-muted: hsl(var(--muted-foreground));
  --text-foreground: hsl(var(--foreground));
  --bg-muted: hsl(var(--accent));
  --border: hsl(var(--border));
}

.text-muted-foreground {
  color: var(--text-muted);
}

.hover\:bg-muted:hover {
  background: var(--bg-muted);
}

.hover\:text-foreground:hover {
  color: var(--text-foreground);
}

.border-border {
  border-color: var(--border);
}
</style>
