import type { TabsProps } from './types'

import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'

type SortableInstance = any
type SortEmit = (oldIndex: number, newIndex: number) => void

/** 拖拽时找到真正的 tab 元素（带 .group 类的项） */
function findParentElement(element: HTMLElement) {
  const parentCls = 'group'
  return element.classList.contains(parentCls) ? element : element.closest(`.${parentCls}`)
}

/**
 * 标签页拖拽排序 Hook（完全对齐 vben use-tabs-drag）
 * 基于 SortableJS，通过动态 import 加载。
 */
export function useTabsDrag(props: TabsProps, emit: SortEmit) {
  const sortableInstance = ref<SortableInstance | null>(null)

  async function initTabsSortable() {
    await nextTick()

    const el = document.querySelectorAll(`.${props.contentClass}`)?.[0] as HTMLElement

    if (!el) {
      console.warn('Element not found for sortable initialization')
      return
    }

    const resetElState = async () => {
      el.style.cursor = 'default'
      // 移除所有 .dragging 残留（防止透明度问题）
      el.querySelectorAll('.dragging').forEach((node) => {
        node.classList.remove('dragging')
      })
    }

    // 动态加载 sortablejs（与 vben 一致）
    const SortableModule: any = await import('sortablejs/modular/sortable.complete.esm.js')
    const Sortable = SortableModule?.default || SortableModule

    sortableInstance.value = Sortable?.create?.(el, {
      // 对齐 vben useSortable 默认配置
      animation: 300,
      delay: 400,
      delayOnTouchOnly: true,
      filter: (_evt: any, target: HTMLElement) => {
        const parent = findParentElement(target)
        const draggable = parent?.classList.contains('draggable')
        return !draggable || !props.draggable
      },
      onEnd(evt: any) {
        const { newIndex, oldIndex } = evt
        const { srcElement } = evt?.originalEvent ?? {}

        // 立即移除被拖拽元素的 dragging class
        evt.item?.classList?.remove('dragging')
        resetElState()

        if (!srcElement) {
          return
        }

        const srcParent = findParentElement(srcElement)

        if (!srcParent) {
          return
        }

        if (!srcParent.classList.contains('draggable')) {
          return
        }

        if (
          oldIndex !== undefined &&
          newIndex !== undefined &&
          !Number.isNaN(oldIndex) &&
          !Number.isNaN(newIndex) &&
          oldIndex !== newIndex
        ) {
          emit(oldIndex, newIndex)
        }
      },
      onMove(evt: any) {
        const parent = findParentElement(evt.related)
        if (parent?.classList.contains('draggable') && props.draggable) {
          const isCurrentAffix = evt.dragged.classList.contains('affix-tab')
          const isRelatedAffix = evt.related.classList.contains('affix-tab')
          // 不允许在固定的 tab 和非固定的 tab 之间互相拖拽
          return isCurrentAffix === isRelatedAffix
        } else {
          return false
        }
      },
      onStart(evt: any) {
        el.style.cursor = 'grabbing'
        // 精确给被拖拽元素加 dragging class（而非第一个 .draggable）
        evt.item?.classList?.add('dragging')
      }
    })
  }

  async function init() {
    // 桌面端 Electron 默认非移动端
    await nextTick()
    await initTabsSortable()
  }

  onMounted(init)

  watch(
    () => props.styleType,
    () => {
      sortableInstance.value?.destroy()
      init()
    }
  )

  onUnmounted(() => {
    sortableInstance.value?.destroy()
  })
}
