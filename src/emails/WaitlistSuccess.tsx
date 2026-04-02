import {
  Html,
  Head,
  Body,
  Container,
  Text,
  Link,
  Hr,
  Preview,
} from '@react-email/components'

interface WaitlistEmailProps {
  serialKey: string
}

export function WaitlistEmail({ serialKey }: WaitlistEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>SIGNAL_RECEIVED // Your Kamikaze serial: #{serialKey}</Preview>
      <Body
        style={{
          backgroundColor: '#050505',
          color: '#ff0000',
          fontFamily:
            'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
          padding: '20px',
        }}
      >
        <Container
          style={{
            border: '1px solid #333',
            padding: '40px',
            backgroundColor: '#000',
            maxWidth: '600px',
          }}
        >
          <Text style={{ fontSize: '12px', color: '#666', margin: '0 0 20px 0' }}>
            [ KAMIKAZE_MAIN_TERMINAL // VER_1.0 ]
          </Text>

          <Hr style={{ borderColor: '#333', margin: '20px 0' }} />

          <Text
            style={{
              fontSize: '18px',
              fontWeight: 'bold',
              letterSpacing: '2px',
              color: '#00ff00',
              margin: '0 0 16px 0',
            }}
          >
            SIGNAL_RECOGNIZED
          </Text>

          <Text
            style={{
              color: '#ccc',
              lineHeight: '1.6',
              fontSize: '14px',
              margin: '0 0 20px 0',
            }}
          >
            Uplink successful. You have been integrated into the acquisition
            buffer for Drop_01. Your signal is currently locked in the queue.
          </Text>

          <Container
            style={{
              background: '#111',
              padding: '15px',
              borderLeft: '4px solid #ff0000',
              margin: '20px 0',
            }}
          >
            <Text style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#fff' }}>
              SERIAL_ID: <span style={{ color: '#ff0000' }}>#{serialKey}</span>
            </Text>
            <Text style={{ margin: 0, fontSize: '10px', color: '#444' }}>
              STATUS: ACCESS_QUEUED
            </Text>
          </Container>

          <Text style={{ fontSize: '11px', color: '#444', margin: '20px 0' }}>
            [!] WARNING: SIGNAL PATH IS MONITORED. DO NOT DISCLOSE.
          </Text>

          <Hr style={{ borderColor: '#333', margin: '20px 0' }} />

          <Link
            href="https://kamikaze.host"
            style={{
              color: '#ff0000',
              textDecoration: 'none',
              fontSize: '12px',
            }}
          >
            [ RETURN_TO_VOID ]
          </Link>
        </Container>
      </Body>
    </Html>
  )
}

export default WaitlistEmail
