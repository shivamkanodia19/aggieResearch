'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Send, Mail, AlertTriangle } from 'lucide-react';

export function EmailManagementTab() {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [targetAudience, setTargetAudience] = useState('OPT_IN_ONLY');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ sent: number; failed: number } | null>(null);
  const [recentEmails, setRecentEmails] = useState<any[]>([]);

  useEffect(() => {
    // Could fetch recent email logs here if an endpoint exists
  }, []);

  const handleSend = async () => {
    if (!subject || !body) {
      alert('Please fill in subject and body');
      return;
    }

    const confirmed = confirm(
      `Are you sure you want to send this email to ${
        targetAudience === 'ALL'
          ? 'ALL users'
          : targetAudience === 'OPT_IN_ONLY'
          ? 'opted-in users only'
          : `${targetAudience} majors`
      }?`
    );
    if (!confirmed) return;

    setSending(true);
    setResult(null);
    try {
      const res = await fetch('/api/admin/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, body, targetAudience }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send emails');
      }

      setResult(data);
      if (data.sent > 0) {
        setSubject('');
        setBody('');
      }
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : 'Failed to send emails');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Email Management</h2>
        <p className="text-sm text-muted-foreground">
          Send announcements to users. HTML is supported in the email body.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compose */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Send className="h-5 w-5 text-maroon-700" />
              Compose Broadcast
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Target Audience
              </label>
              <Select value={targetAudience} onValueChange={setTargetAudience}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OPT_IN_ONLY">Opted-in users only</SelectItem>
                  <SelectItem value="ALL">All users</SelectItem>
                  <SelectItem value="Computer Science">Computer Science majors</SelectItem>
                  <SelectItem value="Biology">Biology majors</SelectItem>
                  <SelectItem value="Engineering">Engineering majors</SelectItem>
                  <SelectItem value="Biomedical">Biomedical majors</SelectItem>
                  <SelectItem value="Chemistry">Chemistry majors</SelectItem>
                  <SelectItem value="Physics">Physics majors</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Subject Line
              </label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Important announcement about research opportunities"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Email Body (HTML supported)
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={10}
                placeholder="<p>Your message here...</p>"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-maroon-900 resize-y"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Use HTML for formatting: &lt;p&gt;, &lt;strong&gt;, &lt;a href=&quot;...&quot;&gt;, etc.
              </p>
            </div>

            {targetAudience === 'ALL' && (
              <div className="flex items-start gap-2 rounded-lg bg-yellow-50 dark:bg-yellow-950/30 p-3 text-sm">
                <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 shrink-0" />
                <p className="text-yellow-800 dark:text-yellow-200">
                  This will send to ALL users including those who opted out.
                  Consider using &quot;Opted-in users only&quot; instead.
                </p>
              </div>
            )}

            <Button
              onClick={handleSend}
              disabled={sending || !subject || !body}
              className="w-full bg-maroon-900 hover:bg-tamu-maroonDark text-white"
            >
              {sending ? 'Sending...' : 'Send Broadcast Email'}
            </Button>

            {result && (
              <div
                className={`p-4 rounded-lg border ${
                  result.failed > 0
                    ? 'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800'
                    : 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800'
                }`}
              >
                <p className="font-medium text-foreground">
                  Successfully sent {result.sent} emails.
                </p>
                {result.failed > 0 && (
                  <p className="text-sm text-yellow-800 dark:text-yellow-200 mt-1">
                    {result.failed} failed. Check server logs for details.
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Mail className="h-5 w-5 text-maroon-700" />
              Email Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            {subject || body ? (
              <div className="rounded-lg border border-border overflow-hidden">
                {/* Email header preview */}
                <div className="bg-tamu-maroon p-4 text-center">
                  <h3 className="text-white font-bold text-lg">
                    {subject || 'Subject line...'}
                  </h3>
                </div>
                {/* Email body preview */}
                <div className="p-4 bg-background">
                  {body ? (
                    <div
                      className="text-sm text-foreground prose prose-sm max-w-none dark:prose-invert"
                      dangerouslySetInnerHTML={{ __html: body }}
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      Start typing to see a preview...
                    </p>
                  )}
                </div>
                {/* Email footer preview */}
                <div className="border-t border-border p-3 bg-muted/50">
                  <p className="text-xs text-muted-foreground">
                    This is an announcement from TAMU Research Tracker.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Mail className="h-12 w-12 mb-3 opacity-30" />
                <p className="text-sm">Compose an email to see the preview</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
