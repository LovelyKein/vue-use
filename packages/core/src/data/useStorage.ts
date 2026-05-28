import type { Ref } from 'vue'
import { ref, watch } from 'vue'

export type StorageMode = 'local' | 'session'

export interface UseStorageOptions<T> {
  // 初始值
  initialValue: T
  // 过期时间
  // 单位：秒
  // 默认值：0，表示不过期
  expired?: number
  // 存储模式
  // 默认值：local
  mode?: StorageMode
}

export interface UseStorageReturn<T> {
  value: Ref<T>
  set: (key: T, newExpired?: number) => void
  remove: () => void
}

export interface StorageItem<T> {
  value: T
  timestamp: number
}

const prefix: string = 'useStorage#'

// function getAllKeys(storage: Storage, prefix: string): string[] {
//   const items = Object.keys(storage)
//   return items.filter((item) => item.startsWith(prefix))
// }

function existKey(storage: Storage, key: string): boolean {
  return storage.getItem(key) !== null
}

// 判断是否为非负整数
function isNonNegativeInteger(num: number): boolean {
  return Number.isInteger(num) && num >= 0
}

export function useStorage<T>(key: string, options: UseStorageOptions<T>): UseStorageReturn<T> {
  const { mode = 'local', initialValue, expired = 0 } = options

  // 校验过期时间是否为非负整数
  if (!isNonNegativeInteger(expired)) {
    throw new Error('useStorage 过期时间必须为非负数')
  }
  // 校验存储模式是否为 local 或 session
  if (!['local', 'session'].includes(mode)) {
    throw new Error('useStorage 存储模式必须为 local 或 session')
  }
  const storage = mode === 'local' ? localStorage : sessionStorage

  // 校验存储键是否为空
  if (!key) {
    throw new Error('useStorage 存储键不能为空')
  }
  const storageKey = `${prefix}${key}`

  // 内部读取与校验逻辑
  const read = (): T => {
    const raw = storage.getItem(storageKey)
    if (raw !== null && raw) {
      // 校验是否过期 (timestamp 为 0 表示不过期)
      try {
        const data = JSON.parse(raw) as StorageItem<T>
        // 已过期
        if (data.timestamp > 0 && Date.now() > data.timestamp) {
          storage.removeItem(storageKey) // 不能调用 remove() 避免 TDZ
          return initialValue
        }
        return data.value
      } catch (error) {
        console.error('useStorage 读取失败，JSON.parse解析异常', error)
        // 降级处理：解析失败时清理脏数据，不要直接 throw Error 导致组件白屏崩溃
        storage.removeItem(storageKey)
        return initialValue
      }
    }
    return initialValue
  }

  const v = ref<T>(read())

  // 如果初始时没有有效数据，执行一次持久化
  if (!existKey(storage, storageKey)) {
    try {
      storage.setItem(
        storageKey,
        JSON.stringify({
          value: initialValue,
          timestamp: expired === 0 ? 0 : Date.now() + expired * 1000
        })
      )
    } catch (error) {
      console.error('useStorage 初始化序列化失败', error)
    }
  }

  // 锁标志：区分是内部 set/remove 触发的，还是用户直接修改 v.value 触发的
  let isInternalUpdate = false

  const set = (val: T, newExpired: number = expired): void => {
    if (!isNonNegativeInteger(newExpired)) {
      throw new Error('useStorage 过期时间必须为非负数')
    }
    try {
      const data = {
        value: val,
        timestamp: newExpired === 0 ? 0 : Date.now() + newExpired * 1000
      }
      storage.setItem(storageKey, JSON.stringify(data))

      // 同步更新 v.value 并跳过 watch
      isInternalUpdate = true
      v.value = val
      isInternalUpdate = false
    } catch (error: unknown) {
      throw new Error('useStorage 设置失败，值序列化失败' + error)
    }
  }

  const remove = (): void => {
    storage.removeItem(storageKey)

    isInternalUpdate = true
    v.value = initialValue // 刷新值为初始值
    isInternalUpdate = false
  }

  // 使用 watch 替代 watchEffect，解决深度监听和死循环问题
  watch(
    v,
    (newVal) => {
      // 如果是由 set() 或 remove() 触发的，直接跳过，避免重复写
      if (isInternalUpdate) return

      // 用户直接修改了 v.value（如 v.value = 'abc' 或 v.value.a = 1），自动同步
      try {
        const data = {
          value: newVal,
          timestamp: expired === 0 ? 0 : Date.now() + expired * 1000
        }
        storage.setItem(storageKey, JSON.stringify(data))
      } catch (error) {
        console.error('useStorage 自动同步序列化失败', error)
      }
    },
    { deep: true, flush: 'sync' }
  )

  return {
    value: v as Ref<T>,
    set,
    remove
  }
}
