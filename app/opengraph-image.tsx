import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Libro - The User Context Layer'
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
          backgroundColor: '#050505',
          position: 'relative',
        }}
      >
        {/* Background glow effects */}
        <div
          style={{
            position: 'absolute',
            top: '-20%',
            right: '-10%',
            width: '60%',
            height: '60%',
            backgroundColor: 'rgba(99, 102, 241, 0.2)',
            borderRadius: '50%',
            filter: 'blur(100px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-20%',
            left: '-10%',
            width: '60%',
            height: '60%',
            backgroundColor: 'rgba(168, 85, 247, 0.2)',
            borderRadius: '50%',
            filter: 'blur(100px)',
          }}
        />

        {/* Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '40px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
          }}
        >
          {/* Logo icon */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '120px',
              height: '120px',
              background: 'linear-gradient(135deg, #6366f1, #a855f7)',
              borderRadius: '30px',
              marginBottom: '40px',
              boxShadow: '0 10px 30px rgba(99, 102, 241, 0.4)',
            }}
          >
            <span style={{ fontSize: '60px', color: 'white', fontWeight: 'bold' }}>L</span>
          </div>

          <h1
            style={{
              fontSize: '80px',
              fontWeight: 'bold',
              color: 'white',
              marginBottom: '20px',
              textAlign: 'center',
              letterSpacing: '-2px',
            }}
          >
            Libro Engine
          </h1>
          <p
            style={{
              fontSize: '32px',
              color: '#9ca3af',
              textAlign: 'center',
              maxWidth: '800px',
              lineHeight: 1.4,
            }}
          >
            The User Context Layer for AI Agents.
          </p>
          <div
            style={{
              display: 'flex',
              marginTop: '40px',
              gap: '20px',
            }}
          >
            <div style={{ color: '#818cf8', fontSize: '24px', display: 'flex', alignItems: 'center' }}>
              <span style={{ marginRight: '10px' }}>⚡</span> Infinite Memory
            </div>
            <div style={{ color: '#818cf8', fontSize: '24px', display: 'flex', alignItems: 'center' }}>
              <span style={{ marginRight: '10px' }}>⚡</span> MCP Native
            </div>
            <div style={{ color: '#818cf8', fontSize: '24px', display: 'flex', alignItems: 'center' }}>
              <span style={{ marginRight: '10px' }}>⚡</span> Open Source
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
