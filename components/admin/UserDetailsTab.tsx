'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { X, User, BookOpen, Mail, BarChart3 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { EmailPreferences } from '@/lib/types/database';

interface UserListItem {
  id: string;
  name: string | null;
  email: string;
  major: string | null;
  interests: string[] | null;
  email_preferences: EmailPreferences | null;
  last_active_at: string | null;
  last_email_sent: string | null;
  created_at: string;
}

interface UserDetail {
  user: {
    id: string;
    name: string | null;
    email: string;
    major: string | null;
    interests: string[] | null;
    email_preferences: EmailPreferences | null;
    last_active_at: string | null;
    created_at: string;
    applications: any[];
    positions: any[];
    weeklyLogs: any[];
    emailLogs: any[];
  };
  stats: {
    totalSaved: number;
    activeResearch: number;
    stageBreakdown: Record<string, number>;
    totalJournalEntries: number;
    emailsSent: number;
    lastActive: string | null;
  };
}

export function UserDetailsTab() {
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [optInFilter, setOptInFilter] = useState<'all' | 'opted_in' | 'opted_out'>('all');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/users')
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || `HTTP ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setUsers(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch users:', err);
        setError(err.message || 'Failed to load users');
        setLoading(false);
      });
  }, []);

  const loadUserDetail = async (userId: string) => {
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`);
      const data = await res.json();
      setSelectedUser(data);
    } catch (error) {
      console.error('Failed to load user detail:', error);
    } finally {
      setDetailLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    // Opt-in filter
    if (optInFilter === 'opted_in' && user.email_preferences?.newOpportunities === false) return false;
    if (optInFilter === 'opted_out' && user.email_preferences?.newOpportunities !== false) return false;

    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (user.name?.toLowerCase().includes(q)) ||
      user.email.toLowerCase().includes(q) ||
      (user.major?.toLowerCase().includes(q))
    );
  });

  if (loading) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Loading users...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 font-medium">{error}</p>
        <p className="text-sm text-muted-foreground mt-2">Make sure you are logged in as an admin.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">All Users</h2>
          <p className="text-sm text-muted-foreground">
            {users.length} registered users
            {optInFilter !== 'all' && ` · ${filteredUsers.length} shown`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={optInFilter} onValueChange={(v) => setOptInFilter(v as 'all' | 'opted_in' | 'opted_out')}>
            <SelectTrigger className="w-40 bg-background text-foreground">
              <SelectValue placeholder="Email status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              <SelectItem value="opted_in">Opted In</SelectItem>
              <SelectItem value="opted_out">Opted Out</SelectItem>
            </SelectContent>
          </Select>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or major..."
            className="w-72 px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-maroon-900"
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Name
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Email
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Major
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Last Active
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Email Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    onClick={() => loadUserDetail(user.id)}
                    className="border-b border-border hover:bg-muted/50 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 text-sm font-medium text-foreground">
                      {user.name || 'No name'}
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {user.email}
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {user.major || 'Not set'}
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {user.last_active_at
                        ? formatDistanceToNow(new Date(user.last_active_at), {
                            addSuffix: true,
                          })
                        : 'Never'}
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          user.email_preferences?.newOpportunities !== false
                            ? 'default'
                            : 'outline'
                        }
                        className="text-xs"
                      >
                        {user.email_preferences?.newOpportunities !== false
                          ? 'Opted In'
                          : 'Opted Out'}
                      </Badge>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-8 text-center text-muted-foreground"
                    >
                      {search ? 'No users match your search' : 'No users found'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="relative w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-xl bg-background border border-border shadow-xl mx-4">
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background px-6 py-4">
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  {selectedUser.user.name || 'Unknown User'}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {selectedUser.user.email}
                  {selectedUser.user.major && (
                    <> &bull; {selectedUser.user.major}</>
                  )}
                </p>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="rounded-lg p-2 hover:bg-muted transition-colors"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            {detailLoading ? (
              <div className="flex justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-maroon-900 border-t-transparent" />
              </div>
            ) : (
              <div className="space-y-6 p-6">
                {/* Quick Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="rounded-lg bg-muted/50 p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">Total Saved</p>
                    </div>
                    <p className="text-2xl font-bold text-foreground">
                      {selectedUser.stats.totalSaved}
                    </p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">Active Research</p>
                    </div>
                    <p className="text-2xl font-bold text-green-600">
                      {selectedUser.stats.activeResearch}
                    </p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">Journal Entries</p>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">
                      {selectedUser.stats.totalJournalEntries}
                    </p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">Emails Sent</p>
                    </div>
                    <p className="text-2xl font-bold text-foreground">
                      {selectedUser.stats.emailsSent}
                    </p>
                  </div>
                </div>

                {/* Interests */}
                {selectedUser.user.interests && selectedUser.user.interests.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-2">Research Interests</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedUser.user.interests.map((interest: string) => (
                        <Badge key={interest} variant="outline" className="text-xs">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Application Pipeline */}
                {Object.keys(selectedUser.stats.stageBreakdown).length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-3">
                      Application Pipeline
                    </h3>
                    <div className="space-y-2">
                      {Object.entries(selectedUser.stats.stageBreakdown).map(
                        ([stage, count]) => (
                          <div
                            key={stage}
                            className="flex justify-between items-center p-3 rounded-lg bg-muted/50"
                          >
                            <span className="text-sm font-medium text-foreground">
                              {stage}
                            </span>
                            <span className="text-sm font-bold text-foreground">
                              {count as number}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* Recent Journal Entries */}
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3">
                    Recent Journal Entries
                  </h3>
                  {selectedUser.user.weeklyLogs.length > 0 ? (
                    <div className="space-y-2">
                      {selectedUser.user.weeklyLogs.map((log: any) => (
                        <div
                          key={log.id}
                          className="p-3 rounded-lg bg-muted/50 text-sm"
                        >
                          <p className="text-muted-foreground">
                            {new Date(log.week_start).toLocaleDateString()} &mdash;{' '}
                            <span className="font-medium text-foreground">
                              {log.hours_worked ?? 0} hours
                            </span>
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No journal entries yet
                    </p>
                  )}
                </div>

                {/* Email History */}
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3">
                    Email History ({selectedUser.stats.emailsSent} sent)
                  </h3>
                  {selectedUser.user.emailLogs.length > 0 ? (
                    <div className="space-y-2">
                      {selectedUser.user.emailLogs.map((log: any) => (
                        <div
                          key={log.id}
                          className="p-3 rounded-lg bg-muted/50 text-sm"
                        >
                          <p className="font-medium text-foreground">
                            {log.subject}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(log.sent_at).toLocaleString()} &bull; {log.type}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No emails sent yet
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
