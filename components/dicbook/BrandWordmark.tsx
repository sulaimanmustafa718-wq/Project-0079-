'use client';

import React from 'react';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BrandWordmarkProps {
  className?: string;
  size?: 'sm' | 'md';
}

export function BrandWordmark({ className, size = 'md' }: BrandWordmarkProps) {
  return (
    <Link
      href="/"
      className={cn(
        'inline-flex items-center gap-2.5 whitespace-nowrap shrink-0 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600',
        className
      )}
      aria-label="DICBOOK home"
    >
      <span
        className={cn(
          'inline-flex items-center justify-center rounded-lg bg-[var(--dicbook-brand)] text-white shadow-xs',
          size === 'sm' ? 'h-8 w-8' : 'h-9 w-9'
        )}
        aria-hidden="true"
      >
        <BookOpen className={size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'} />
      </span>
      <span
        className={cn(
          'font-bold tracking-tight text-slate-900 dark:text-slate-50',
          size === 'sm' ? 'text-lg' : 'text-xl'
        )}
      >
        DICBOOK
      </span>
    </Link>
  );
}
