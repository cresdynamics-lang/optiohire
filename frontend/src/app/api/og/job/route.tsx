import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const title = searchParams.get('title') || 'Job Opportunity'
    const company = searchParams.get('company') || 'OptioHire'

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'center',
            backgroundColor: '#0f172a', // Tailwind slate-900
            padding: '80px',
            fontFamily: 'sans-serif',
          }}
        >
          {/* Logo / Brand Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '40px',
            }}
          >
            <div
              style={{
                fontSize: 32,
                color: '#38bdf8', // Tailwind sky-400
                fontWeight: 'bold',
                letterSpacing: '-0.02em',
              }}
            >
              OptioHire
            </div>
            <div
              style={{
                fontSize: 32,
                color: '#94a3b8',
                marginLeft: '12px',
                marginRight: '12px',
              }}
            >
              |
            </div>
            <div
              style={{
                fontSize: 32,
                color: '#f8fafc',
              }}
            >
              {company}
            </div>
          </div>

          {/* Job Title */}
          <div
            style={{
              fontSize: 72,
              fontWeight: 800,
              color: '#ffffff',
              lineHeight: 1.1,
              letterSpacing: '-0.04em',
              marginBottom: '20px',
              maxWidth: '900px',
            }}
          >
            {title}
          </div>

          {/* Subtitle / Footer */}
          <div
            style={{
              fontSize: 32,
              color: '#cbd5e1',
              display: 'flex',
              alignItems: 'center',
              marginTop: 'auto',
            }}
          >
            <span style={{ color: '#38bdf8', marginRight: '12px' }}>✦</span> AI-Powered Recruitment
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  } catch (e: any) {
    console.error(e)
    return new Response(`Failed to generate image`, {
      status: 500,
    })
  }
}
