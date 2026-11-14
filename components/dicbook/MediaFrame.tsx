'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ImageOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MediaFrameProps {
  src: string;
  alt: string;
  className?: string;
  aspectClass?: string;
  priority?: boolean;
  sizes?: string;
}

export function MediaFrame({
  src,
  alt,
  className,
  aspectClass = 'aspect-[16/9]',
  priority = false,
  sizes = '(max-width: 768px) 100vw, 680px',
}: MediaFrameProps) {
  const [hasError, setHasError] = useState(false);

  return (
    <div
      className={cn(
        'relative overflow-hidden bg-slate-100 dark:bg-slate-800',
        aspectClass,
        className
      )}
    >
      {!hasError && src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          referrerPolicy="no-referrer"
          className="object-cover"
          onError={() => setHasError(true)}
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 p-4 text-center">
          <ImageOff
            className="h-6 w-6 text-slate-400 dark:text-slate-500"
            aria-hidden="true"
          />
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {alt}
          </span>
        </div>
      )}
    </div>
  );
}
