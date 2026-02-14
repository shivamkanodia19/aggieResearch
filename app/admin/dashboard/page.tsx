'use client';

import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { OverviewTab } from '@/components/admin/OverviewTab';
import { UserDetailsTab } from '@/components/admin/UserDetailsTab';
import { EmailManagementTab } from '@/components/admin/EmailManagementTab';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  const handleExport = () => {
    alert('Export functionality coming soon!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">User metrics and analytics</p>
        </div>
        <Button variant="outline" className="gap-2" onClick={handleExport}>
          <Download className="h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">User Details</TabsTrigger>
          <TabsTrigger value="emails">Email Management</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OverviewTab />
        </TabsContent>

        <TabsContent value="users">
          <UserDetailsTab />
        </TabsContent>

        <TabsContent value="emails">
          <EmailManagementTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
