"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import { Shield } from "lucide-react";

export function PrivacyDataCard() {
  const [showExportModal, setShowExportModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleExportData = async () => {
    setExporting(true);
    try {
      const res = await fetch("/api/user/export-data", { credentials: "same-origin" });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const disposition = res.headers.get("Content-Disposition");
      const match = disposition?.match(/filename="?([^";]+)"?/);
      a.download = match?.[1] ?? `tamu-research-tracker-data-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error(err);
      alert("Failed to export data");
    } finally {
      setExporting(false);
      setShowExportModal(false);
    }
  };

  const handleDeletePipelineData = async () => {
    try {
      const res = await fetch("/api/user/delete-pipeline", {
        method: "DELETE",
        credentials: "same-origin",
      });
      if (!res.ok) throw new Error("Delete failed");
      setShowDeleteModal(false);
      alert(
        "Your pipeline data (saved opportunities, stages, and notes) has been deleted for this account. Opportunities are still available on the Browse page."
      );
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Failed to delete data");
    }
  };

  return (
    <>
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="h-5 w-5 text-maroon-700" />
            Account Actions
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Export your data or delete your pipeline and account.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-col gap-3 rounded-lg bg-muted/50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 flex-1">
              <div className="font-medium text-foreground">Export your data</div>
              <div className="text-sm text-muted-foreground">
                Download all your saved opportunities, applications, and notes as JSON
              </div>
            </div>
            <Button
              variant="outline"
              className="shrink-0"
              onClick={() => setShowExportModal(true)}
              disabled={exporting}
            >
              {exporting ? "Exporting…" : "Export Data"}
            </Button>
          </div>

          <div className="flex flex-col gap-3 rounded-lg border border-red-200 bg-red-50/50 p-4 dark:border-red-900/50 dark:bg-red-950/20 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 flex-1">
              <div className="font-medium text-foreground">Delete pipeline data</div>
              <div className="text-sm text-muted-foreground">
                Remove all saved opportunities in your pipeline, application stages, and notes.
                This does not delete any opportunities from the Browse page.
              </div>
            </div>
            <Button
              variant="outline"
              className="shrink-0 border-red-300 text-red-700 hover:bg-red-100 hover:text-red-800 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/50"
              onClick={() => setShowDeleteModal(true)}
            >
              Delete Pipeline Data
            </Button>
          </div>

          <div className="flex flex-col gap-3 rounded-lg border border-red-200 bg-red-50/50 p-4 dark:border-red-900/50 dark:bg-red-950/20 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 flex-1">
              <div className="font-medium text-foreground">Delete account</div>
              <div className="text-sm text-muted-foreground">
                Permanently delete your account and all associated data
              </div>
            </div>
            <Button
              variant="outline"
              className="shrink-0 border-red-300 text-red-700 hover:bg-red-100 hover:text-red-800 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/50"
              onClick={() => alert("Account deletion is not yet implemented. Please contact support.")}
            >
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>

      <ConfirmationModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onConfirm={handleExportData}
        title="Export Your Data"
        message="This will download a JSON file containing all your opportunities, applications, and notes. You can use this as a backup."
        confirmText="Export"
        cancelText="Cancel"
        variant="warning"
      />
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeletePipelineData}
        title="Delete All Pipeline Data?"
        message="This will permanently delete your pipeline data for this account (saved opportunities, application stages, and notes). It will not remove any opportunities from the Browse page. This action cannot be undone."
        confirmText="Delete Pipeline Data"
        cancelText="Cancel"
        variant="danger"
      />
    </>
  );
}
