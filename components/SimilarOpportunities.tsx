"use client";

import { useEffect, useState } from "react";

interface SimilarOpportunity {
  id: string;
  title: string;
  leader_name: string | null;
  relevant_majors: string[] | null;
}

interface Props {
  opportunityId: string;
  onSelect: (id: string) => void;
}

export function SimilarOpportunities({ opportunityId, onSelect }: Props) {
  const [similar, setSimilar] = useState<SimilarOpportunity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/opportunities/${opportunityId}/similar`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setSimilar(data);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [opportunityId]);

  if (loading || similar.length === 0) return null;

  return (
    <section className="mt-8 pt-6 border-t border-gray-200">
      <h2 className="text-sm font-semibold text-gray-900 mb-3">
        Similar Opportunities
      </h2>
      <div className="space-y-2">
        {similar.map((opp) => (
          <button
            key={opp.id}
            onClick={() => {
              onSelect(opp.id);
              window.scrollTo(0, 0);
            }}
            className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <p className="text-sm font-medium text-gray-900 line-clamp-1">
              {opp.title}
            </p>
            <p className="text-xs text-gray-500">{opp.leader_name || "Unknown"}</p>
          </button>
        ))}
      </div>
    </section>
  );
}
