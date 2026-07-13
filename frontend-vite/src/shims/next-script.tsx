import { useEffect } from 'react'

type ScriptProps = {
  src?: string
  id?: string
  strategy?: 'afterInteractive' | 'lazyOnload' | 'beforeInteractive' | 'worker'
  onLoad?: () => void
  onReady?: () => void
  dangerouslySetInnerHTML?: { __html: string }
  children?: string
}

export default function Script({ src, id, onLoad, onReady, dangerouslySetInnerHTML, children }: ScriptProps) {
  useEffect(() => {
    if (!src) return
    const existing = document.querySelector(`script[src="${src}"]`)
    if (existing) {
      onLoad?.()
      onReady?.()
      return
    }
    const el = document.createElement('script')
    el.src = src
    if (id) el.id = id
    el.async = true
    el.onload = () => {
      onLoad?.()
      onReady?.()
    }
    document.body.appendChild(el)
    return () => {
      el.remove()
    }
  }, [src, id, onLoad, onReady])

  if (dangerouslySetInnerHTML) {
    return <script id={id} dangerouslySetInnerHTML={dangerouslySetInnerHTML} />
  }
  if (children) {
    return <script id={id}>{children}</script>
  }
  return null
}
