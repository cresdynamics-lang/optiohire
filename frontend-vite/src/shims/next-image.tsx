import { type ImgHTMLAttributes, forwardRef } from 'react'

export type StaticImageData = {
  src: string
  height: number
  width: number
  blurDataURL?: string
}

type NextImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  src: string | StaticImageData
  alt: string
  width?: number
  height?: number
  fill?: boolean
  priority?: boolean
  quality?: number
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  unoptimized?: boolean
  sizes?: string
  onLoadingComplete?: (img: HTMLImageElement) => void
  loader?: (p: { src: string; width: number; quality?: number }) => string
}

function resolveSrc(src: string | StaticImageData): string {
  return typeof src === 'string' ? src : src.src
}

/**
 * Minimal next/image shim — renders a standard <img>.
 */
const Image = forwardRef<HTMLImageElement, NextImageProps>(function Image(
  {
    fill,
    priority,
    quality: _q,
    placeholder: _ph,
    blurDataURL: _blur,
    unoptimized: _u,
    loader: _l,
    style,
    width,
    height,
    src,
    onLoadingComplete,
    onLoad,
    ...rest
  },
  ref
) {
  const resolvedSrc = resolveSrc(src)
  const imgStyle = fill
    ? { position: 'absolute' as const, inset: 0, width: '100%', height: '100%', objectFit: 'cover' as const, ...style }
    : style

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    onLoad?.(e)
    onLoadingComplete?.(e.currentTarget)
  }

  return (
    <img
      ref={ref}
      src={resolvedSrc}
      width={width}
      height={height}
      style={imgStyle}
      loading={priority ? 'eager' : 'lazy'}
      onLoad={handleLoad}
      {...rest}
    />
  )
})

export default Image
