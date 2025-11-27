import { ImageResponse } from 'next/og'

// Image metadata
export const alt = 'AI 여행 플래너'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

// Image generation
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 60,
          background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          padding: '40px',
        }}
      >
        <div style={{ fontSize: 120, marginBottom: 20 }}>🌍✈️</div>
        <div style={{
          fontSize: 80,
          fontWeight: 'bold',
          marginBottom: 20,
          textAlign: 'center',
        }}>
          AI 여행 플래너
        </div>
        <div style={{
          fontSize: 40,
          opacity: 0.9,
          textAlign: 'center',
        }}>
          Claude AI가 추천하는 맞춤형 여행지
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
