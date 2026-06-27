<script lang="ts" setup>
import type { TabConfig, TabsProps } from './types'
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { DoubleLeftOutlined, DoubleRightOutlined } from '@ant-design/icons-vue'
import TabsChrome from './TabsChrome.vue'
import { useTabsDrag } from './use-tabs-drag'

interface Props extends TabsProps { }

defineOptions({ name: 'TabsView' })

const props = withDefaults(defineProps<Props>(), {
  contentClass: 'vben-tabs-content',
  draggable: true,
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

/* 拖拽排序：基于 SortableJS，对齐 vben use-tabs-drag */
useTabsDrag(props, (oldIndex, newIndex) => {
  emit('sort-tabs', oldIndex, newIndex)
})

const active = defineModel<string>('active', { default: '' })

/* ---------- 滚动逻辑 ---------- */
const scrollContainerRef = ref<HTMLElement | null>(null)
const scrollViewportRef = ref<HTMLElement | null>(null)
const showScrollButton = ref(false)
const scrollIsAtLeft = ref(true)
const scrollIsAtRight = ref(false)

let resizeObserver: ResizeObserver | null = null
let mutationObserver: MutationObserver | null = null
let lastTabCount = 0

function getScrollWidths() {
  if (!scrollContainerRef.value || !scrollViewportRef.value) {
    return { containerWidth: 0, contentWidth: 0 }
  }
  return {
    containerWidth: scrollContainerRef.value.clientWidth,
    contentWidth: scrollViewportRef.value.scrollWidth
  }
}

function calcShowScrollButton() {
  const { containerWidth, contentWidth } = getScrollWidths()
  showScrollButton.value = contentWidth > containerWidth + 1
  updateScrollAt()
}

function updateScrollAt() {
  if (!scrollViewportRef.value) return
  const { scrollLeft, scrollWidth, clientWidth } = scrollViewportRef.value
  scrollIsAtLeft.value = scrollLeft <= 0
  scrollIsAtRight.value = scrollLeft + clientWidth >= scrollWidth - 1
}

function scrollDirection(direction: 'left' | 'right', distance = 150) {
  if (!scrollViewportRef.value) return
  scrollViewportRef.value.scrollBy({
    behavior: 'smooth',
    left: direction === 'left' ? -distance : distance
  })
}

function scrollToActiveIntoView() {
  if (!scrollViewportRef.value) return
  const viewport = scrollViewportRef.value
  const { containerWidth, contentWidth } = getScrollWidths()
  if (containerWidth >= contentWidth) return
  requestAnimationFrame(() => {
    const activeEl = viewport.querySelector('.is-active') as HTMLElement | null
    activeEl?.scrollIntoView({ behavior: 'smooth', inline: 'nearest' })
  })
}

function handleWheel(e: WheelEvent) {
  if (!props.wheelable) return
  if (!scrollViewportRef.value) return
  scrollViewportRef.value.scrollBy({ left: e.deltaY * 3 })
  e.preventDefault()
  e.stopPropagation()
}

const onScrollDebounced = useDebounceFn(() => {
  updateScrollAt()
}, 50)

function onScroll() {
  onScrollDebounced()
}

async function initObservers() {
  await nextTick()
  if (!scrollContainerRef.value) return
  const viewport = scrollContainerRef.value.querySelector(
    '[data-tabs-viewport]'
  ) as HTMLElement | null
  scrollViewportRef.value = viewport
  calcShowScrollButton()
  await nextTick()
  scrollToActiveIntoView()

  resizeObserver?.disconnect()
  resizeObserver = new ResizeObserver(
    useDebounceFn(() => {
      calcShowScrollButton()
      scrollToActiveIntoView()
    }, 100)
  )
  if (viewport) resizeObserver.observe(viewport)
  if (scrollContainerRef.value) {
    resizeObserver.observe(scrollContainerRef.value)
  }

  lastTabCount = props.tabs?.length || 0
  mutationObserver?.disconnect()
  mutationObserver = new MutationObserver(() => {
    const count = viewport?.querySelectorAll('[data-tab-item="true"]').length || 0
    if (count > lastTabCount) {
      scrollToActiveIntoView()
    }
    if (count !== lastTabCount) {
      calcShowScrollButton()
      lastTabCount = count
    }
  })
  if (viewport) {
    mutationObserver.observe(viewport, { childList: true, subtree: true })
  }
}

watch(
  () => active.value,
  () => {
    nextTick(() => scrollToActiveIntoView())
  },
  { flush: 'post' }
)

watch(
  () => props.styleType,
  () => {
    initObservers()
  }
)

onMounted(initObservers)

onUnmounted(() => {
  resizeObserver?.disconnect()
  mutationObserver?.disconnect()
  resizeObserver = null
  mutationObserver = null
})
</script>

<template>
  <div class="flex h-full flex-1 overflow-hidden">
    <!-- 左侧滚动按钮 -->
    <span v-show="showScrollButton" :class="{
      'cursor-pointer text-muted-foreground hover:bg-muted': !scrollIsAtLeft,
      'pointer-events-none opacity-30': scrollIsAtLeft
    }" class="border-r border-border px-2 flex items-center" @click="scrollDirection('left')">
      <DoubleLeftOutlined class="text-sm" />
    </span>

    <div :class="{
      'pt-0.75': styleType === 'chrome'
    }" class="size-full flex-1 overflow-hidden">
      <div ref="scrollContainerRef" class="tabs-scroll-container h-full overflow-x-auto overflow-y-hidden"
        @scroll="onScroll" @wheel="handleWheel">
        <div data-tabs-viewport class="h-full inline-block">
          <TabsChrome v-model:active="active" :content-class="contentClass" :context-menus="contextMenus"
            :draggable="draggable" :gap="gap" :middle-click-to-close="middleClickToClose" :show-icon="showIcon"
            :style-type="styleType" :tabs="tabs" :wheelable="wheelable" @close="(k) => emit('close', k)"
            @sort-tabs="(o, n) => emit('sort-tabs', o, n)" @unpin="(t) => emit('unpin', t)"
            @update:active="(k) => emit('update:active', k)" />
        </div>
      </div>
    </div>

    <!-- 右侧滚动按钮 -->
    <span v-show="showScrollButton" :class="{
      'cursor-pointer text-muted-foreground hover:bg-muted': !scrollIsAtRight,
      'pointer-events-none opacity-30': scrollIsAtRight
    }" class="cursor-pointer border-l border-border px-2 flex items-center text-muted-foreground hover:bg-muted"
      @click="scrollDirection('right')">
      <DoubleRightOutlined class="text-sm" />
    </span>
  </div>
</template>

<style scoped>
.tabs-scroll-container {
  scrollbar-width: thin;
  scrollbar-color: transparent transparent;
}

.tabs-scroll-container::-webkit-scrollbar {
  height: 4px;
}

.tabs-scroll-container::-webkit-scrollbar-track {
  background: transparent;
}

.tabs-scroll-container::-webkit-scrollbar-thumb {
  background: transparent;
  border-radius: 4px;
}

.tabs-scroll-container:hover::-webkit-scrollbar-thumb {
  background: var(--scrollbar-color, rgba(0, 0, 0, 0.2));
}

:global(html.dark) .tabs-scroll-container:hover::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
}

.text-muted-foreground {
  color: rgba(0, 0, 0, 0.45);
}

:global(html.dark) .text-muted-foreground {
  color: rgba(255, 255, 255, 0.45);
}

.border-border {
  border-color: rgba(0, 0, 0, 0.08);
}

:global(html.dark) .border-border {
  border-color: rgba(255, 255, 255, 0.1);
}

.hover\:bg-muted:hover {
  background: rgba(0, 0, 0, 0.04);
}

:global(html.dark) .hover\:bg-muted:hover {
  background: rgba(255, 255, 255, 0.06);
}

.pt-0\.75 {
  padding-top: 3px;
}
</style>
