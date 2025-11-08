import { ImageResponse } from 'next/og'

export const alt = 'SSAT Math Prep for Middle School'
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '20px',
          }}
        >
          <div
            style={{
              fontSize: 120,
              fontWeight: 800,
              color: 'white',
              textAlign: 'center',
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
            }}
          >
            SSAT Math Prep
          </div>
          <div
            style={{
              fontSize: 48,
              fontWeight: 500,
              color: 'rgba(255, 255, 255, 0.9)',
              textAlign: 'center',
            }}
          >
            Middle Level Math Training
          </div>
          <div
            style={{
              fontSize: 36,
              fontWeight: 400,
              color: 'rgba(255, 255, 255, 0.8)',
              marginTop: '20px',
            }}
          >
            midssat.com
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
