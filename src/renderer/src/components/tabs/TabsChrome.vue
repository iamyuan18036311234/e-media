<script lang="ts" setup>
import type { TabConfig, TabsProps } from './types'
import { computed } from 'vue'
import { Dropdown, Menu } from 'ant-design-vue'
import { CloseOutlined, PushpinFilled } from '@ant-design/icons-vue'
import Icon from '#/components/Icon.vue'

interface Props extends TabsProps { }

defineOptions({
  name: 'VbenTabsChrome',
  inheritAttrs: false
})

const props = withDefaults(defineProps<Props>(), {
  contentClass: 'vben-tabs-content',
  contextMenus: () => [] as any,
  gap: 7,
  middleClickToClose: true,
  showIcon: true,
  styleType: 'chrome',
  tabs: () => [],
  wheelable: true
})

const emit = defineEmits<{
  (e: 'close', key: string): void
  (e: 'sort-tabs', oldIndex: number, newIndex: number): void
  (e: 'unpin', tab: TabConfig): void
  (e: 'update:active', key: string): void
}>()

const active = defineModel<string>('active', { default: '' })

const style = computed(() => {
  const { gap } = props
  return {
    '--gap': `${gap}px`
  }
})

const tabsView = computed(() => props.tabs as TabConfig[])

function onClickTab(tab: TabConfig) {
  if (tab.key !== active.value) {
    active.value = tab.key
    emit('update:active', tab.key)
  }
}

function onClose(tab: TabConfig) {
  emit('close', tab.key)
}

function onUnpin(tab: TabConfig) {
  emit('unpin', tab)
}

function onMouseDown(e: MouseEvent, tab: TabConfig) {
  // 中键关闭
  if (
    e.button === 1 &&
    tab.closable !== false &&
    !tab.affixTab &&
    tabsView.value.length > 1 &&
    props.middleClickToClose
  ) {
    e.preventDefault()
    e.stopPropagation()
    emit('close', tab.key)
  }
}

/* ---------- 右键菜单 ---------- */
function buildMenu(tab: TabConfig) {
  return (props.contextMenus?.(tab) ?? []).map((m) => ({
    key: m.key,
    label: m.text,
    icon: m.icon ? () => m.icon!() : undefined,
    disabled: m.disabled
  }))
}

function onMenuClick({ key }: { key: string | number }, tab: TabConfig) {
  const menus = props.contextMenus?.(tab) ?? []
  const item = menus.find((m) => m.key === String(key))
  item?.handler?.()
}
</script>

<template>
  <div :class="contentClass" :style="style" class="tabs-chrome flex h-full w-max overflow-y-hidden pr-6">
    <TransitionGroup name="slide-left">
      <div v-for="(tab, i) in tabsView" :key="tab.key" :class="[
        {
          'is-active': tab.key === active,
          draggable: !tab.affixTab && draggable,
          'affix-tab': tab.affixTab
        }
      ]" :data-active-tab="active" :data-index="i"
        class="group tabs-chrome__item translate-all relative -mr-3 flex h-full items-center select-none"
        data-tab-item="true" @click="onClickTab(tab)" @mousedown="onMouseDown($event, tab)">
        <Dropdown :trigger="['contextmenu']" placement="bottomLeft">
          <div class="relative size-full px-1">
            <!-- divider -->
            <div v-if="i !== 0 && tab.key !== active"
              class="tabs-chrome__divider absolute top-1/2 left-[var(--gap)] z-0 h-4 w-px -translate-y-1/2 bg-border transition-all">
            </div>
            <!-- background -->
            <div
              class="tabs-chrome__background absolute z-[-1] size-full px-[calc(var(--gap)-1px)] py-0 transition-opacity duration-150">
              <div
                class="tabs-chrome__background-content h-full rounded-tl-[var(--gap)] rounded-tr-[var(--gap)] duration-150">
              </div>
              <svg
                class="tabs-chrome__background-before absolute bottom-0 -left-px fill-transparent transition-all duration-150"
                height="7" width="7">
                <path d="M 0 7 A 7 7 0 0 0 7 0 L 7 7 Z" />
              </svg>
              <svg
                class="tabs-chrome__background-after absolute -right-px bottom-0 fill-transparent transition-all duration-150"
                height="7" width="7">
                <path d="M 0 0 A 7 7 0 0 0 7 7 L 0 7 Z" />
              </svg>
            </div>

            <!-- extra -->
            <div class="tabs-chrome__extra absolute top-1/2 right-[var(--gap)] z-3 size-4 -translate-y-1/2">
              <CloseOutlined v-show="!tab.affixTab && tabs.length > 1 && tab.closable !== false"
                class="tabs-chrome__close mt-0.5 size-3 cursor-pointer rounded-full text-base/80 transition-all"
                @click.stop="onClose(tab)" />
              <PushpinFilled v-show="tab.affixTab && tabs.length > 1 && tab.closable !== false"
                class="tabs-chrome__pin mt-px size-3.5 cursor-pointer rounded-full text-base/80 transition-all"
                @click.stop="onUnpin(tab)" />
            </div>

            <!-- tab-item-main -->
            <div
              class="tabs-chrome__item-main z-2 mx-[calc(var(--gap)*2)] my-0 flex h-full items-center overflow-hidden rounded-tl-[5px] rounded-tr-[5px] pr-4 pl-2 text-base duration-150">
              <Icon v-if="showIcon && tab.icon" :icon="tab.icon" :size="14" class="mr-1 shrink-0" />
              <span class="flex-1 overflow-hidden text-sm whitespace-nowrap">
                {{ tab.title }}
              </span>
            </div>
          </div>
          <template #overlay>
            <Menu :items="buildMenu(tab)" @click="(info) => onMenuClick(info, tab)" />
          </template>
        </Dropdown>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.tabs-chrome {
  --tab-bg-active: color-mix(in srgb, var(--primary) 15%, transparent);
  --tab-bg-hover: color-mix(in srgb, var(--primary) 8%, transparent);
  --text-muted: rgba(0, 0, 0, 0.65);
  --border-color: rgba(0, 0, 0, 0.08);
}

:global(html.dark) .tabs-chrome {
  --text-muted: rgba(255, 255, 255, 0.65);
  --border-color: rgba(255, 255, 255, 0.1);
}

/* 关键：让 Dropdown 包裹层不破坏 flex 布局，且不干扰 sortable */
.tabs-chrome :deep(.ant-dropdown-trigger) {
  display: contents !important;
}

/* tab 项基础 */
.tabs-chrome__item {
  cursor: pointer;
  color: var(--text-muted);
}

/* hover - 非激活（排除拖拽中） */
.tabs-chrome__item:not(.dragging):not(.is-active):hover .tabs-chrome__background {
  padding-bottom: 2px;
}

.tabs-chrome__item:not(.dragging):not(.is-active):hover .tabs-chrome__background-content {
  background: var(--tab-bg-hover);
  margin: 0 2px;
  border-radius: 6px;
}

.tabs-chrome__item:not(.dragging):not(.is-active):hover .tabs-chrome__divider {
  opacity: 0;
}

/* hover 后一个 tab 的 divider 隐藏 */
.tabs-chrome__item:not(.dragging):not(.is-active):hover+.tabs-chrome__item .tabs-chrome__divider {
  opacity: 0;
}

/* 激活态 */
.tabs-chrome__item.is-active {
  z-index: 2;
  color: var(--primary);
}

.tabs-chrome__item.is-active .tabs-chrome__background-content {
  background: var(--tab-bg-active);
}

.tabs-chrome__item.is-active .tabs-chrome__background-before,
.tabs-chrome__item.is-active .tabs-chrome__background-after {
  fill: var(--tab-bg-active);
}

/* 激活后下一个 tab 的 divider 隐藏 */
.tabs-chrome__item.is-active+.tabs-chrome__item .tabs-chrome__divider {
  opacity: 0 !important;
}

/* 关闭按钮 */
.tabs-chrome__close,
.tabs-chrome__pin {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  font-size: 12px;
}

.tabs-chrome__item.is-active .tabs-chrome__close,
.tabs-chrome__item.is-active .tabs-chrome__pin {
  color: var(--primary);
}

.tabs-chrome__close:hover {
  background: color-mix(in srgb, var(--primary) 20%, transparent);
  color: var(--primary);
}

/* 拖拽中 */
.tabs-chrome__item.dragging {
  opacity: 0.4;
}

/* 过渡动画 */
.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.25s ease;
}

.slide-left-enter-from {
  opacity: 0;
  transform: translateX(-12px);
}

.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-12px);
}
</style>
