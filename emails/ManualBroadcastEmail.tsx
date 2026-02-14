import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Heading,
  Text,
  Hr,
} from '@react-email/components';

interface ManualBroadcastEmailProps {
  subject: string;
  body: string;
}

export default function ManualBroadcastEmail({
  subject,
  body,
}: ManualBroadcastEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f5f5f5' }}>
        <Container
          style={{
            maxWidth: '600px',
            margin: '0 auto',
            backgroundColor: '#ffffff',
            padding: '0',
          }}
        >
          {/* Header */}
          <Section
            style={{
              backgroundColor: '#500000',
              padding: '24px',
              textAlign: 'center' as const,
            }}
          >
            <Heading
              style={{
                color: '#ffffff',
                fontSize: '24px',
                margin: '0',
                fontWeight: 'bold',
              }}
            >
              {subject}
            </Heading>
          </Section>

          {/* Body */}
          <Section style={{ padding: '32px 24px' }}>
            <div
              style={{
                fontSize: '16px',
                color: '#1f2937',
                lineHeight: '1.6',
              }}
              dangerouslySetInnerHTML={{ __html: body }}
            />
          </Section>

          {/* Footer */}
          <Hr style={{ margin: '0', borderColor: '#e5e7eb' }} />
          <Section style={{ padding: '24px', backgroundColor: '#f9fafb' }}>
            <Text
              style={{
                fontSize: '12px',
                color: '#9ca3af',
                lineHeight: '1.5',
                margin: '0',
              }}
            >
              This is an announcement from TAMU Research Tracker.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
