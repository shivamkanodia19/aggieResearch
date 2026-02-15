"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import Link from "next/link";
import { useMemo } from "react";
import { ChevronDown, LogOut, Settings } from "lucide-react";

function initialsFromName(name?: string | null) {
  const n = (name ?? "").trim();
  if (!n) return "U";
  const parts = n.split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "U";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

export function ProfileDropdown({
  name,
  onSignOut,
}: {
  name?: string | null;
  onSignOut: () => void;
}) {
  const initials = useMemo(() => initialsFromName(name), [name]);

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full border border-border bg-white dark:bg-[#1a1a1a] px-2 py-1.5 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-gray-50 dark:hover:bg-[#222] focus:outline-none focus:ring-2 focus:ring-maroon-900/30"
          aria-label="Open profile menu"
        >
          <span className="grid h-7 w-7 place-items-center rounded-full bg-maroon-900 text-xs font-semibold text-white">
            {initials}
          </span>
          <span className="hidden sm:inline max-w-[160px] truncate">{name ?? "Account"}</span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          sideOffset={8}
          align="end"
          className="z-50 min-w-[220px] overflow-hidden rounded-xl border border-border bg-white dark:bg-[#1a1a1a] p-1 shadow-lg"
        >
          <DropdownMenu.Item asChild>
            <Link
              href="/settings"
              className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground outline-none transition-colors hover:bg-muted focus:bg-muted"
            >
              <Settings className="h-4 w-4 text-muted-foreground" />
              Settings
            </Link>
          </DropdownMenu.Item>

          <DropdownMenu.Separator className="my-1 h-px bg-border" />

          <DropdownMenu.Item
            onSelect={(e) => {
              e.preventDefault();
              onSignOut();
            }}
            className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground outline-none transition-colors hover:bg-muted focus:bg-muted"
          >
            <LogOut className="h-4 w-4 text-muted-foreground" />
            Sign out
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

