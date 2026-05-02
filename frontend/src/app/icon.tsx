import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const size = {
  width: 32,
  height: 32,
}

export const contentType = 'image/png'

/** Serves /icon; paired with redirect /favicon.ico → /icon in next.config.js */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#2D2DDD',
          color: 'white',
          fontSize: 18,
          fontWeight: 700,
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        O
      </div>
    ),
    { ...size }
  )
}
