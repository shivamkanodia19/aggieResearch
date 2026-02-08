"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Standalone application detail page removed for consistency.
 * All stages (including Accepted/Rejected) use the pipeline side panel.
 * Redirect to pipeline; optional ?applicationId= opens the side panel.
 */
export default function ApplicationRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  useEffect(() => {
    router.replace(`/pipeline?applicationId=${encodeURIComponent(id)}`);
  }, [id, router]);

  return (
    <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">
      Redirecting to pipeline...
    </div>
  );
}
