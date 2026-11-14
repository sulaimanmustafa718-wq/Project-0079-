'use client';

import React, { useMemo, useState } from 'react';
import { Bookmark } from 'lucide-react';
import { useDicbook } from '@/lib/dicbook/store';
import { PostCard } from './PostCard';
import { PostComposer } from './PostComposer';
import { cn } from '@/lib/utils';

type FeedFilter = 'all' | 'people' | 'businesses' | 'saved';

export function HomeFeedView() {
  const { posts } = useDicbook();
  const [filter, setFilter] = useState<FeedFilter>('all');

  const filteredPosts = useMemo(() => {
    switch (filter) {
      case 'people':
        return posts.filter((p) => p.authorType === 'person');
      case 'businesses':
        return posts.filter((p) => p.authorType === 'business');
      case 'saved':
        return posts.filter((p) => p.isSaved);
      default:
        return posts;
    }
  }, [posts, filter]);

  const tabs: Array<{ id: FeedFilter; label: string }> = [
    { id: 'all', label: 'All Updates' },
    { id: 'people', label: 'People' },
    { id: 'businesses', label: 'Businesses' },
    { id: 'saved', label: 'Saved' },
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Community Feed
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Updates from neighbors and local businesses you follow
          </p>
        </div>
      </div>

      <PostComposer />

      {/* Feed Filter Tabs */}
      <div
        role="tablist"
        aria-label="Filter community feed"
        className="flex items-center gap-1 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1.5"
      >
        {tabs.map((tab) => {
          const active = filter === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setFilter(tab.id)}
              className={cn(
                'min-h-[38px] flex-1 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0',
                active
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Posts List */}
      {filteredPosts.length > 0 ? (
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center">
          <Bookmark
            className="mx-auto h-8 w-8 text-slate-400 dark:text-slate-500"
            aria-hidden="true"
          />
          <h2 className="mt-3 text-base font-semibold text-slate-900 dark:text-slate-100">
            No posts in this view
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {filter === 'saved'
              ? 'Posts you save with the bookmark button will appear here.'
              : 'Try switching back to All Updates to browse the full feed.'}
          </p>
          {filter !== 'all' && (
            <button
              type="button"
              onClick={() => setFilter('all')}
              className="mt-4 inline-flex min-h-[40px] items-center rounded-lg bg-[var(--dicbook-brand)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--dicbook-brand-hover)] transition-colors"
            >
              View All Updates
            </button>
          )}
        </div>
      )}
    </div>
  );
}
