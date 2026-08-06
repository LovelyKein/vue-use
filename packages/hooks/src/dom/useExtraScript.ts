// 缓存 Promise，避免重复插入 <script>
const scriptPromiseMap: Map<string, Promise<unknown>> = new Map()

type ScriptAttrs = Record<string, string | boolean>

// 获取 window 上的全局变量值，支持多级路径查询，例如 'navigator.userAgent'
function getWindowValue(globalVarName?: string): unknown {
  if (!globalVarName) {
    return undefined
  }
  const segments = globalVarName.split('.')
  let current = window
  for (const segment of segments) {
    if (current === null || current === undefined) {
      return undefined
    }
    current = current[segment as keyof typeof current]
  }
  return current
}

// 构建缓存键
function buildCacheKey(scriptUrl: string, globalVarName?: string): string {
  return `${scriptUrl}::${globalVarName || ''}`
}

// // 检查脚本是否已加载
// function isScriptLoaded(script: HTMLScriptElement): boolean {
//   return script.dataset.loaded === 'true'
// }

// 应用脚本属性
function applyScriptAttrs(script: HTMLScriptElement, attrs?: ScriptAttrs) {
  if (typeof attrs !== 'object' || attrs === null) {
    return
  }
  Object.keys(attrs).forEach((key) => {
    const value = attrs[key]
    script.setAttribute(key, value as string)
    // boolean 类型属性，设置为 true 时添加空字符串，false 时移除属性
    if (typeof value === 'boolean') {
      if (value) {
        script.setAttribute(key, '')
      } else {
        script.removeAttribute(key)
      }
    }
  })
}

/**
 * 按需加载额外的 script 脚本，支持传入脚本路径和挂载后的全局变量名。
 * 同一会话内相同脚本复用同一个 Promise，避免重复插入 <script>
 * @returns 传入 globalVarName 时返回对应全局变量，否则返回 script 节点
 * @throws 脚本加载失败或全局变量未挂载
 */
export function useExtraScript(scriptUrl: string, globalVarName?: string, attrs?: ScriptAttrs): Promise<unknown> {
  // 非浏览器环境
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('useExtraScript 仅支持浏览器环境'))
  }

  // 已挂载全局变量，直接返回
  const loadedGlobal = getWindowValue(globalVarName)
  if (loadedGlobal) {
    return Promise.resolve(loadedGlobal)
  }

  // 缓存 Promise，避免重复插入 <script>
  const cacheKey = buildCacheKey(scriptUrl, globalVarName)
  if (scriptPromiseMap.has(cacheKey)) {
    return scriptPromiseMap.get(cacheKey)!
  }

  const loadingPromise = new Promise((resolve, reject) => {
    // 检查是否已存在相同 src 的 script 节点
    const exist = document.querySelector(`script[src="${scriptUrl}"]`) as HTMLScriptElement | null
    const script = exist || document.createElement('script')

    // 已存在同路径脚本（非该函数添加，意外某处手动添加）且已加载完成时，直接按当前契约返回结果
    if (exist) {
      if (!globalVarName) {
        resolve(script)
        return
      }
      const globalVar = getWindowValue(globalVarName)
      if (globalVar) {
        resolve(globalVar)
        return
      }
      scriptPromiseMap.delete(cacheKey)
      reject(new Error(`${scriptUrl} 已存在且已加载完成，但 window.${globalVarName} 未挂载`))
      return
    }

    // 不存在脚本
    if (!exist) {
      script.src = scriptUrl
      applyScriptAttrs(script, attrs)
      script.dataset.loaded = 'false'
    }

    // 脚本加载完成时，检查全局变量是否已挂载
    const handleLoad = () => {
      const globalVar = getWindowValue(globalVarName)
      if (globalVarName && !globalVar) {
        scriptPromiseMap.delete(cacheKey)
        reject(new Error(`${scriptUrl} 加载完成，但 window.${globalVarName} 未挂载`))
        return
      }
      script.dataset.loaded = 'true'
      resolve(globalVar || script)
    }

    // 脚本加载失败
    const handleError = () => {
      scriptPromiseMap.delete(cacheKey)
      reject(new Error(`Failed to load script: ${scriptUrl}`))
    }

    script.addEventListener('load', handleLoad, { once: true })
    script.addEventListener('error', handleError, { once: true })

    if (!exist) {
      document.head.appendChild(script)
    }
  })

  scriptPromiseMap.set(cacheKey, loadingPromise)
  return loadingPromise
}
