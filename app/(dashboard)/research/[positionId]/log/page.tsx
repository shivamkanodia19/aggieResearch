"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { WeeklyLogForm } from "../../components/WeeklyLogForm";
import { Loader2 } from "lucide-react";

export default function LogEntryPage() {
  const params = useParams();
  const router = useRouter();
  const positionId = params.positionId as string;
  const [position, setPosition] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!positionId) return;
    fetch(`/api/research/${positionId}`)
      .then((res) => res.json())
      .then((data) => setPosition(data))
      .finally(() => setLoading(false));
  }, [positionId]);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#500000]" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link
        href={`/research/${positionId}`}
        className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to {position?.title || "Position"}
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Log Weekly Progress</h1>
        <p className="mt-1 text-gray-600">{position?.title}</p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <WeeklyLogForm positionId={positionId} />
      </div>
    </div>
  );
}
