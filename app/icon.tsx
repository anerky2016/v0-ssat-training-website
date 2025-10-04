import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const size = {
  width: 48,
  height: 48,
}

export const contentType = 'image/png'

// This generates the default favicon for browsers
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 32,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          fontWeight: 700,
          borderRadius: '8px',
        }}
      >
        M
      </div>
    ),
    {
      ...size,
    }
  )
}
