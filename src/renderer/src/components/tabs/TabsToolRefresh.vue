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
  --text-muted: rgba(0, 0, 0, 0.45);
  --text-foreground: rgba(0, 0, 0, 0.85);
  --bg-muted: rgba(0, 0, 0, 0.04);
  --border: rgba(0, 0, 0, 0.08);
}

:global(html.dark) .tabs-tool {
  --text-muted: rgba(255, 255, 255, 0.45);
  --text-foreground: rgba(255, 255, 255, 0.85);
  --bg-muted: rgba(255, 255, 255, 0.06);
  --border: rgba(255, 255, 255, 0.1);
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
