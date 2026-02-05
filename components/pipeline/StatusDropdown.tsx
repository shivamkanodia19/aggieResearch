"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ApplicationStage } from "@/lib/types/database";

const STAGE_LABELS: Record<ApplicationStage, string> = {
  Saved: "Saved",
  "First Email": "Contacted",
  Responded: "Responded",
  Interview: "Interview",
  Accepted: "Accepted",
  Rejected: "Rejected",
  Withdrawn: "Withdrawn",
};

const ACTIVE_STAGES: ApplicationStage[] = [
  "Saved",
  "First Email",
  "Responded",
  "Interview",
];

interface StatusDropdownProps {
  value: ApplicationStage;
  onChange: (stage: ApplicationStage) => void;
  /** When true, only show active pipeline stages (for cards in columns). */
  activeOnly?: boolean;
  disabled?: boolean;
}

export function StatusDropdown({
  value,
  onChange,
  activeOnly = false,
  disabled = false,
}: StatusDropdownProps) {
  const options = activeOnly
    ? ACTIVE_STAGES
    : (["Saved", "First Email", "Responded", "Interview", "Accepted", "Rejected", "Withdrawn"] as ApplicationStage[]);

  return (
    <Select
      value={value}
      onValueChange={(v) => onChange(v as ApplicationStage)}
      disabled={disabled}
    >
      <SelectTrigger
        className="h-8 border-gray-200 bg-gray-50 text-xs text-gray-700"
        style={{
          backgroundColor: "var(--gray-50)",
          borderColor: "var(--gray-200)",
        }}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((stage) => (
          <SelectItem key={stage} value={stage}>
            {STAGE_LABELS[stage]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export { STAGE_LABELS };
