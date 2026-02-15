import {
  Html,
  Head,
  Body,
  Container,
  Heading,
  Text,
  Button,
  Hr,
  Section,
  Link,
} from '@react-email/components';

interface LogReminderEmailProps {
  userName: string;
  positionTitle: string;
  piName: string;
  weekRange: string;
  logUrl: string;
  unsubscribeUrl?: string;
}

export default function LogReminderEmail({
  userName,
  positionTitle,
  piName,
  weekRange,
  logUrl,
  unsubscribeUrl,
}: LogReminderEmailProps) {
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
                fontSize: '22px',
                margin: '0',
                fontWeight: 'bold',
              }}
            >
              Weekly Log Reminder
            </Heading>
          </Section>

          {/* Body */}
          <Section style={{ padding: '32px 24px' }}>
            <Text style={{ fontSize: '16px', color: '#1f2937', lineHeight: '1.5' }}>
              Hi {userName},
            </Text>

            <Text style={{ fontSize: '16px', color: '#1f2937', lineHeight: '1.5' }}>
              This is a friendly reminder to log your weekly progress for:
            </Text>

            {/* Position Card */}
            <Section
              style={{
                backgroundColor: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '20px',
                marginTop: '16px',
                marginBottom: '24px',
              }}
            >
              <Heading
                style={{
                  fontSize: '18px',
                  color: '#500000',
                  margin: '0 0 6px 0',
                  fontWeight: 'bold',
                }}
              >
                {positionTitle}
              </Heading>
              <Text
                style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  margin: '0 0 8px 0',
                }}
              >
                with {piName}
              </Text>
              <Text
                style={{
                  fontSize: '13px',
                  color: '#9ca3af',
                  margin: '0',
                }}
              >
                Week of {weekRange}
              </Text>
            </Section>

            <div style={{ textAlign: 'center' as const }}>
              <Button
                href={logUrl}
                style={{
                  backgroundColor: '#500000',
                  color: '#ffffff',
                  padding: '12px 32px',
                  textDecoration: 'none',
                  borderRadius: '6px',
                  fontSize: '16px',
                  fontWeight: '600',
                  display: 'inline-block',
                }}
              >
                Log This Week
              </Button>
            </div>
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
              You enabled this reminder for this position.{' '}
              <Link
                href="https://aggieresearchfinder.com/settings"
                style={{ color: '#500000', textDecoration: 'underline' }}
              >
                Manage preferences
              </Link>
              {unsubscribeUrl && (
                <>
                  {' '}&bull;{' '}
                  <Link
                    href={unsubscribeUrl}
                    style={{ color: '#6b7280', textDecoration: 'underline' }}
                  >
                    Unsubscribe from all emails
                  </Link>
                </>
              )}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
