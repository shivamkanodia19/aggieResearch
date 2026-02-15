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

interface NewOpportunityEmailProps {
  userName: string;
  opportunity: {
    title: string;
    department: string;
    piName: string;
    description: string;
  };
  unsubscribeUrl?: string;
}

export default function NewOpportunityEmail({
  userName,
  opportunity,
  unsubscribeUrl,
}: NewOpportunityEmailProps) {
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
              New Research Opportunity
            </Heading>
          </Section>

          {/* Body */}
          <Section style={{ padding: '32px 24px' }}>
            <Text style={{ fontSize: '16px', color: '#1f2937', lineHeight: '1.5' }}>
              Hi {userName},
            </Text>

            <Text style={{ fontSize: '16px', color: '#1f2937', lineHeight: '1.5' }}>
              We found a new research opportunity that matches your interests:
            </Text>

            {/* Opportunity Card */}
            <Section
              style={{
                backgroundColor: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '20px',
                marginTop: '20px',
                marginBottom: '20px',
              }}
            >
              <Heading
                style={{
                  fontSize: '20px',
                  color: '#500000',
                  margin: '0 0 8px 0',
                  fontWeight: 'bold',
                }}
              >
                {opportunity.title}
              </Heading>

              <Text
                style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  margin: '0 0 12px 0',
                }}
              >
                {opportunity.department} &bull; {opportunity.piName}
              </Text>

              <Text
                style={{
                  fontSize: '14px',
                  color: '#374151',
                  lineHeight: '1.6',
                  margin: '0',
                }}
              >
                {opportunity.description.length > 200
                  ? opportunity.description.slice(0, 200) + '...'
                  : opportunity.description}
              </Text>
            </Section>

            <Button
              href="https://aggieresearchfinder.com/opportunities"
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
              View Full Details
            </Button>
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
              You&apos;re receiving this because you opted in at Aggie Research Finder.{' '}
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
                    Unsubscribe
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
