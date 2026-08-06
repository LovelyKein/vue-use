import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

describe('useExtraScript', () => {
  let useExtraScript: (
    scriptUrl: string,
    globalVarName?: string,
    attrs?: Record<string, string | boolean>
  ) => Promise<unknown>
  let happyDomSettings: any
  let originalDisableJavaScriptFileLoading: any
  let originalEnableJavaScriptEvaluation: any
  let originalFetchInterceptor: any

  beforeEach(async () => {
    vi.resetModules()
    ;({ useExtraScript } = await import('../useExtraScript'))

    happyDomSettings = (window as any).happyDOM?.settings
    if (happyDomSettings) {
      originalDisableJavaScriptFileLoading = happyDomSettings.disableJavaScriptFileLoading
      originalEnableJavaScriptEvaluation = happyDomSettings.enableJavaScriptEvaluation
      originalFetchInterceptor = happyDomSettings.fetch?.interceptor

      happyDomSettings.disableJavaScriptFileLoading = false
      happyDomSettings.enableJavaScriptEvaluation = true
    }
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    if (happyDomSettings) {
      happyDomSettings.disableJavaScriptFileLoading = originalDisableJavaScriptFileLoading
      happyDomSettings.enableJavaScriptEvaluation = originalEnableJavaScriptEvaluation
      if (happyDomSettings.fetch) {
        happyDomSettings.fetch.interceptor = originalFetchInterceptor
      }
    }

    document.querySelectorAll('script').forEach((script) => {
      const src = script.getAttribute('src')
      if (src?.startsWith('https://example.com/')) {
        script.remove()
      }
    })

    delete (window as any).TestLib
    delete (window as any).TestLib2
    delete (window as any).test
  })

  it('should reject in non-browser environment', async () => {
    vi.stubGlobal('window', undefined as any)
    const scriptUrl = 'https://example.com/non-browser.js'
    await expect(useExtraScript(scriptUrl)).rejects.toThrowError('useExtraScript 仅支持浏览器环境')
  })

  it('should resolve immediately when global var already exists (nested path)', async () => {
    const scriptUrl = 'https://example.com/exist-global.js'
    ;(window as any).test = { ns: { value: 123 } }

    await expect(useExtraScript(scriptUrl, 'test.ns')).resolves.toEqual({ value: 123 })
    expect(document.querySelectorAll(`script[src="${scriptUrl}"]`).length).toBe(0)
  })

  it('should insert script and resolve script element on load when no globalVarName', async () => {
    const scriptUrl = 'https://example.com/no-global.js'

    happyDomSettings.fetch.interceptor = {
      beforeAsyncRequest: async ({ window: requestWindow }: any) => {
        return new requestWindow.Response('', {
          status: 200,
          headers: { 'content-type': 'text/javascript' }
        })
      }
    }

    const promise = useExtraScript(scriptUrl, undefined, {
      async: true,
      defer: false,
      'data-test': '1'
    })

    const script = document.querySelector(`script[src="${scriptUrl}"]`) as HTMLScriptElement | null
    expect(script).not.toBeNull()
    expect(script?.getAttribute('async')).toBe('')
    expect(script?.hasAttribute('defer')).toBe(false)
    expect(script?.getAttribute('data-test')).toBe('1')
    expect(script?.dataset.loaded).toBe('false')

    await expect(promise).resolves.toBe(script)
    expect(script?.dataset.loaded).toBe('true')
  })

  it('should reuse the same Promise for the same scriptUrl/globalVarName', async () => {
    const scriptUrl = 'https://example.com/cache.js'

    happyDomSettings.fetch.interceptor = {
      beforeAsyncRequest: async ({ window: requestWindow }: any) => {
        return new requestWindow.Response('', {
          status: 200,
          headers: { 'content-type': 'text/javascript' }
        })
      }
    }

    const p1 = useExtraScript(scriptUrl, undefined, { async: true })
    const p2 = useExtraScript(scriptUrl, undefined, { async: true })

    expect(p1).toBe(p2)
    expect(document.querySelectorAll(`script[src="${scriptUrl}"]`).length).toBe(1)
    const script = document.querySelector(`script[src="${scriptUrl}"]`) as HTMLScriptElement
    await expect(p1).resolves.toBe(script)
  })

  it('should resolve global var after load when globalVarName is provided', async () => {
    const scriptUrl = 'https://example.com/global.js'
    const globalVarName = 'TestLib'

    happyDomSettings.fetch.interceptor = {
      beforeAsyncRequest: async ({ window: requestWindow }: any) => {
        return new requestWindow.Response('window.TestLib = { version: "1.0.0" }', {
          status: 200,
          headers: { 'content-type': 'text/javascript' }
        })
      }
    }

    const promise = useExtraScript(scriptUrl, globalVarName, { async: true })
    await expect(promise).resolves.toEqual({ version: '1.0.0' })
  })

  it('should reject when loaded but globalVarName is not mounted and clear cache', async () => {
    const scriptUrl = 'https://example.com/missing-global.js'
    const globalVarName = 'TestLib2'

    happyDomSettings.fetch.interceptor = {
      beforeAsyncRequest: async ({ window: requestWindow }: any) => {
        return new requestWindow.Response('', {
          status: 200,
          headers: { 'content-type': 'text/javascript' }
        })
      }
    }

    const p1 = useExtraScript(scriptUrl, globalVarName, { async: true })

    await expect(p1).rejects.toThrowError(`${scriptUrl} 加载完成，但 window.${globalVarName} 未挂载`)

    const p2 = useExtraScript(scriptUrl, globalVarName)
    expect(p2).not.toBe(p1)
    await expect(p2).rejects.toThrowError(`${scriptUrl} 已存在且已加载完成，但 window.${globalVarName} 未挂载`)
  })

  it('should reject on script error and allow retry after removing script', async () => {
    const scriptUrl = 'https://example.com/error.js'
    const globalVarName = 'TestLib'
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    happyDomSettings.fetch.interceptor = {
      beforeAsyncRequest: async () => {
        throw new Error('Network error')
      }
    }

    const p1 = useExtraScript(scriptUrl, globalVarName, { async: true })

    await expect(p1).rejects.toThrowError(`Failed to load script: ${scriptUrl}`)

    const script = document.querySelector(`script[src="${scriptUrl}"]`) as HTMLScriptElement
    script.remove()

    happyDomSettings.fetch.interceptor = {
      beforeAsyncRequest: async ({ window: requestWindow }: any) => {
        return new requestWindow.Response('window.TestLib = { ok: true }', {
          status: 200,
          headers: { 'content-type': 'text/javascript' }
        })
      }
    }

    const p2 = useExtraScript(scriptUrl, globalVarName, { async: true })
    expect(p2).not.toBe(p1)

    await expect(p2).resolves.toEqual({ ok: true })
    errorSpy.mockRestore()
  })
})
