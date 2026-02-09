'use client';

import { useAnalytics } from '@/hooks/useAnalytics';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';

interface TrackedTabProps {
  href: string;
  children: React.ReactNode;
  tabName: string;
  className?: string;
}

export function TrackedTab({ href, children, tabName, className }: TrackedTabProps) {
  const { trackEvent } = useAnalytics();
  const pathname = usePathname();
  const isActive = pathname === href;

  const handleClick = () => {
    trackEvent('tab_click', {
      tab_name: tabName,
      from_tab: pathname,
      to_tab: href,
    });
  };

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={className}
    >
      {children}
    </Link>
  );
}
