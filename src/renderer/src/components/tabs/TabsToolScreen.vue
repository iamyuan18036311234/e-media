<script lang="ts" setup>
import { CompressOutlined, ExpandOutlined } from '@ant-design/icons-vue'

defineOptions({ name: 'TabsToolScreen' })

const props = defineProps<{
  screen?: boolean
}>()

const emit = defineEmits<{
  (e: 'change', value: boolean): void
  (e: 'update:screen', value: boolean): void
}>()

function toggle() {
  const next = !props.screen
  emit('change', next)
  emit('update:screen', next)
}
</script>

<template>
  <div
    class="tabs-tool tabs-tool-screen flex h-full cursor-pointer items-center border-l border-border px-2 text-muted-foreground hover:bg-muted hover:text-foreground"
    @click="toggle"
  >
    <CompressOutlined v-if="screen" class="text-base" />
    <ExpandOutlined v-else class="text-base" />
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
