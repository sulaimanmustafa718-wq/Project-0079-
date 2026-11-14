'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Bell, CheckCheck, Heart, MessageSquare, UserPlus, Building2 } from 'lucide-react';
import { useDicbook } from '@/lib/dicbook/store';
import { MediaFrame } from './MediaFrame';
import { cn } from '@/lib/utils';
import type { NotificationKind } from '@/lib/dicbook/types';

function KindIcon({ kind }: { kind: NotificationKind }) {
  switch (kind) {
    case 'like':
      return <Heart className="h-4 w-4 text-rose-500" aria-hidden="true" />;
    case 'comment':
      return <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" aria-hidden="true" />;
    case 'follow':
      return <UserPlus className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />;
    case 'business':
      return <Building2 className="h-4 w-4 text-amber-600 dark:text-amber-400" aria-hidden="true" />;
    default:
      return <Bell className="h-4 w-4 text-slate-500" aria-hidden="true" />;
  }
}

export function NotificationsView() {
  const {
    notifications,
    unreadNotifications,
    readNotification,
    readAllNotifications,
  } = useDicbook();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const visible = useMemo(
    () =>
      filter === 'unread'
        ? notifications.filter((n) => !n.isRead)
        : notifications,
    [notifications, filter]
  );

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Notifications
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 tabular-nums">
            {unreadNotifications > 0
              ? `${unreadNotifications} unread activity update${unreadNotifications > 1 ? 's' : ''}`
              : 'All caught up on community activity'}
          </p>
        </div>

        <button
          type="button"
          onClick={readAllNotifications}
          disabled={unreadNotifications === 0}
          className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
        >
          <CheckCheck className="h-4 w-4" aria-hidden="true" />
          <span>Mark all as read</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div
        role="tablist"
        aria-label="Filter notifications"
        className="flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1.5"
      >
        <button
          type="button"
          role="tab"
          aria-selected={filter === 'all'}
          onClick={() => setFilter('all')}
          className={cn(
            'min-h-[38px] flex-1 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors',
            filter === 'all'
              ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          )}
        >
          All ({notifications.length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={filter === 'unread'}
          onClick={() => setFilter('unread')}
          className={cn(
            'min-h-[38px] flex-1 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors',
            filter === 'unread'
              ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          )}
        >
          Unread ({unreadNotifications})
        </button>
      </div>

      {/* List */}
      {visible.length > 0 ? (
        <ul className="divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          {visible.map((item) => (
            <li
              key={item.id}
              className={cn(
                'flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between transition-colors',
                !item.isRead && 'bg-[var(--dicbook-brand-soft)]'
              )}
            >
              <div className="flex items-start gap-3 min-w-0">
                <MediaFrame
                  src={item.actorAvatarUrl}
                  alt={item.actorName}
                  aspectClass="aspect-square"
                  className="h-10 w-10 shrink-0 rounded-full border border-slate-200 dark:border-slate-700"
                  sizes="40px"
                />
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2 text-sm">
                    <KindIcon kind={item.kind} />
                    <p className="text-slate-800 dark:text-slate-200">
                      <strong className="font-semibold text-slate-900 dark:text-slate-50">
                        {item.actorName}
                      </strong>{' '}
                      {item.summary}
                    </p>
                  </div>
                  {item.detail && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 italic">
                      {item.detail}
                    </p>
                  )}
                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <span className="tabular-nums">{item.createdAt}</span>
                    {!item.isRead && (
                      <span className="font-semibold text-blue-700 dark:text-blue-400">
                        Unread
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 sm:pl-3">
                <Link
                  href={item.targetHref}
                  onClick={() => readNotification(item.id)}
                  className="inline-flex min-h-[36px] items-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 whitespace-nowrap"
                >
                  View
                </Link>
                {!item.isRead && (
                  <button
                    type="button"
                    onClick={() => readNotification(item.id)}
                    className="min-h-[36px] rounded-lg px-2.5 py-1.5 text-xs font-medium text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 whitespace-nowrap"
                  >
                    Mark read
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center">
          <Bell
            className="mx-auto h-8 w-8 text-slate-400 dark:text-slate-500"
            aria-hidden="true"
          />
          <h2 className="mt-3 text-base font-semibold text-slate-900 dark:text-slate-100">
            No unread notifications
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            You&apos;re all caught up on comments, likes, and neighborhood updates.
          </p>
        </div>
      )}
    </div>
  );
}
