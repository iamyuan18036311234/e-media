<script lang="ts" setup>
import type { ContextMenuItem } from './types'
import { computed } from 'vue'
import { Dropdown, Menu } from 'ant-design-vue'
import { AppstoreOutlined } from '@ant-design/icons-vue'

defineOptions({ name: 'TabsToolMore' })

const props = defineProps<{
  menus: ContextMenuItem[]
}>()

const emit = defineEmits<(e: 'click', key: string) => void>()

const menuItems = computed(() =>
  props.menus.map((m) => ({
    key: m.key,
    label: m.text,
    icon: m.icon ? () => m.icon() : undefined,
    disabled: m.disabled
  }))
)

function onClick({ key }: { key: string | number }) {
  emit('click', String(key))
}
</script>

<template>
  <Dropdown :trigger="['click']" placement="bottomRight">
    <div
      class="tabs-tool tabs-tool-more flex h-full cursor-pointer items-center border-l border-border px-2 text-muted-foreground hover:bg-muted hover:text-foreground"
    >
      <AppstoreOutlined class="text-base" />
    </div>
    <template #overlay>
      <Menu :items="menuItems" @click="onClick" />
    </template>
  </Dropdown>
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
