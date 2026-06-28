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
