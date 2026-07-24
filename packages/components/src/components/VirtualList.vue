<template>
  <div ref="container" class="virtual-list-container" @scroll.passive="handleScroll">
    <div class="list-phantom" :style="{ height: totalHeight + 'px' }" />
    <div class="list-content" :style="{ transform: `translate3d(0, ${offsetY}px, 0)` }">
      <div
        v-for="(item, index) in renderList"
        :key="getKey(item, index)"
        :style="{ paddingBottom: `${gap}px` }"
        :data-index="startIndex + index"
        class="list-item"
      >
        <slot name="default" :item="item" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

defineOptions({
  name: 'VirtualList'
})

interface ItemPosition {
  top: number
  height: number
  bottom: number
  measure: boolean
}

type Item = Record<string, unknown>

export interface VirtualListProps {
  // 列表数据
  data: Item[]
  // 列表项高度
  itemHeight?: number
  // 列表项间距
  gap?: number
  // 是否需要动态高度修正更新
  dynamic?: boolean
  // 列表项唯一标识字段
  fieldKey?: string
  // 前后缓冲区个数
  buffer?: number
}

// 3.5 版本新写法，直接解构 props 也具有响应式，不需要 withDefaults，编译后会在字段前加 props.
// 例如：props.itemHeight
const { data, itemHeight = 80, gap = 0, dynamic = false, fieldKey = 'id', buffer = 4 } = defineProps<VirtualListProps>()

// 真实渲染的可见列表
const renderList = ref<Item[]>([])
// 所有列表项的 top/height/bottom 值
const positions = ref<ItemPosition[]>([])
// 可见列表起始索引
const startIndex = ref<number>(0)
// 可见列表结束索引
const endIndex = ref<number>(0)
// 列表项偏移量
const offsetY = ref<number>(0)
// 列表容器元素
const container = ref<HTMLDivElement>()
// 列表容器高度（仅在 render 中读取，无需响应式）
let containerHeight: number = 0
// observer 实例（仅在命令式函数中使用，无需响应式）
let observer: ResizeObserver | null = null
// 动态更新的加权平均高度值（仅在 render / handleResize 间传递，无需响应式）
let weightedAverageHeight: number = 0

// 数组总长度
const dataLength = computed(() => data.length)
// 列表项高度（包含间距）
const fixedHeight = computed(() => Number(itemHeight) + Number(gap))
// 列表总高度
const totalHeight = computed(() => {
  const noDynamicHeight = dataLength.value * fixedHeight.value
  if (!dynamic) return noDynamicHeight
  // 动态高度修正更新
  const last = positions.value.at(-1)!
  return last.bottom || noDynamicHeight
})

watch(
  () => data,
  (newVal) => {
    if (Array.isArray(newVal)) {
      initPositions()
      render()
    }
  }
)

onMounted(() => {
  containerHeight = container.value?.clientHeight || 0
  initPositions()
  initObserver()
  render()
})

onUnmounted(() => {
  destroyObserver()
})

// 获取列表项唯一标识值
const getKey = (item: Item, index: number) => String(item[fieldKey]).trim() ?? String(index)

// 更新列表项位置
const initPositions = () => {
  if (!dynamic || !Array.isArray(data)) {
    positions.value = []
    return
  }
  // 先根据计算高度初始化列表项位置
  positions.value = data.map((_, index) => {
    const top = index * fixedHeight.value
    return {
      top,
      height: fixedHeight.value,
      bottom: top + fixedHeight.value,
      measure: false
    }
  })
}

// （核心）查找第一个可见列表索引，即第一个 bottom >= scrollTop 的索引
const findVisibleIndex = (scrollTop: number) => {
  if (!dynamic) {
    return Math.floor(scrollTop / fixedHeight.value)
  } else {
    return binarySearchIndex(scrollTop)
  }
}
// （核心）二分查找（动态模式—查找第一个可见列表索引）
const binarySearchIndex = (scrollTop: number) => {
  if (!dataLength.value) return 0
  let left = 0
  let right = dataLength.value - 1
  while (left <= right) {
    const middleIndex = Math.floor((left + right) / 2)
    const middleBottom = positions.value[middleIndex]?.bottom ?? 0
    if (scrollTop === middleBottom) return middleIndex + 1
    if (middleBottom < scrollTop) {
      // 在右侧
      left = middleIndex + 1
    } else {
      // 在左侧
      right = middleIndex - 1
    }
  }
  return left
}

// 滚轮滚动事件的处理函数，用于触发渲染
const handleScroll = () => {
  requestAnimationFrame(() => {
    render()
  })
}

// 预估列表项的高度（包含间距），用于预估计算可见列表索引 startIndex 和 endIndex
const getEstimateHeight = () => {
  if (!dynamic) return fixedHeight.value
  return weightedAverageHeight ? weightedAverageHeight : fixedHeight.value
}

// 更新列表项 transform 偏移，用于实现滚动时的平滑动画
const updateTransform = () => {
  if (!dynamic) {
    offsetY.value = startIndex.value * fixedHeight.value
  } else {
    offsetY.value = positions.value[startIndex.value]?.top ?? 0
  }
}

// （核心）渲染可见列表项
const render = () => {
  // 1. 计算可视区域列表数量
  const estimateHeight = getEstimateHeight()
  const visibleCount = Math.ceil(containerHeight / estimateHeight)

  // 2. 计算可见列表范围索引 startIndex 和 endIndex，截取可见列表项
  const scrollTop = container.value?.scrollTop || 0
  const visibleIndex = findVisibleIndex(scrollTop)
  startIndex.value = Math.max(0, visibleIndex - buffer)
  endIndex.value = Math.min(dataLength.value - 1, startIndex.value + visibleCount + buffer)
  renderList.value = data.slice(startIndex.value, endIndex.value + 1) // 只渲染可见列表

  // 3. 更新列表项偏移量，用于实现滚动时的平滑动画
  updateTransform()

  // 4. 高度修正，ResizeObserver 订阅可见节点尺寸变化（异步，不阻塞渲染），用于高度修正值
  if (!dynamic) return
  if (!observer) return
  const nodes = container.value?.querySelectorAll('.list-item')
  nodes && nodes.forEach((node) => observer?.observe(node))
}

// 初始化 ResizeObserver 监听
const initObserver = () => {
  if (typeof ResizeObserver === 'undefined') return
  if (observer) return

  observer = new ResizeObserver(handleResize)

  // 监听 container 容器尺寸变化，用于动态更新 containerHeight
  if (container.value) observer.observe(container.value)
}
// 销毁 ResizeObserver 监听
const destroyObserver = () => {
  observer && observer.disconnect()
  observer = null
}
// 处理 ResizeObserver 的监听事件
const handleResize = (entries: ResizeObserverEntry[]) => {
  // 容器尺寸变化：更新 containerHeight 并触发重新渲染
  if (container.value) {
    const containerEntry = entries.find((e) => e.target === container.value)
    if (containerEntry) {
      const newHeight = container.value.clientHeight
      if (newHeight !== containerHeight) {
        containerHeight = newHeight
        render()
        return
      }
    }
  }

  // 记录是否有变化
  let hasChange = false
  // 记录最小索引，用于更新受影响的后续列表
  let minIndex = dataLength.value - 1
  // 遍历所有可见列表项，记录真实高度
  for (const entry of entries) {
    const target = entry.target as HTMLElement
    const position_index = Number(target.dataset.index)
    // 过滤无效索引
    if (!positions.value[position_index]) continue
    // 过滤未连接的节点
    if (!target.isConnected) continue
    // 真实列表项高度
    const realHeight = entry.borderBoxSize[0]?.blockSize ?? fixedHeight.value
    // 过滤无效高度
    if (realHeight <= 0) continue
    // 无变化，无需修正
    if (realHeight === positions.value[position_index].height) continue
    // 有变化
    hasChange = true
    // 更新最小索引
    minIndex = Math.min(minIndex, position_index)
    // 此处只更新高度 height
    positions.value[position_index].height = realHeight
    positions.value[position_index].measure = true
  }
  if (!hasChange) return
  // 求 startIndex ~ endIndex 的加权平均高度值
  weightedAverageHeight = Math.round(
    positions.value.slice(startIndex.value, endIndex.value + 1).reduce((acc, { height }) => acc + height, 0) /
      (endIndex.value - startIndex.value + 1)
  )
  // 更新受影响的后续列表项的 top 和 bottom 值，用于实现滚动时的平滑动画
  positions.value[minIndex].bottom = positions.value[minIndex].top + positions.value[minIndex].height
  for (let i = minIndex + 1; i < dataLength.value; i++) {
    positions.value[i].top = positions.value[i - 1].bottom
    positions.value[i].bottom = positions.value[i].top + positions.value[i].height
  }
}
</script>

<style scoped lang="scss">
@mixin absolute($z-index: 0) {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  z-index: $z-index;
}
.virtual-list-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow-x: hidden;
  overflow-y: auto;

  .list-phantom {
    @include absolute(-1);
  }

  .list-content {
    @include absolute(1);
    will-change: transform; /* 开启合成层优化 */

    .list-item {
      box-sizing: border-box;
    }
  }
}
</style>
