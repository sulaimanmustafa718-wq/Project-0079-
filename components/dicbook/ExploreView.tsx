'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Hash, Search, X } from 'lucide-react';
import { searchDicbook } from '@/lib/dicbook/logic';
import { useDicbook } from '@/lib/dicbook/store';
import { MediaFrame } from './MediaFrame';
import { PostCard } from './PostCard';
import { cn } from '@/lib/utils';

type ExploreTab = 'all' | 'people' | 'businesses' | 'posts' | 'hashtags';

export function ExploreView() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const paramQuery = searchParams.get('q') ?? '';
  const {
    people,
    businesses,
    posts,
    followedPeopleIds,
    followedBusinessIds,
    toggleFollowPerson,
    toggleFollowBusiness,
    recentSearches,
    addRecentSearch,
    removeRecentSearch,
    startBusinessConversation,
  } = useDicbook();

  const [query, setQuery] = useState(paramQuery);
  const [prevParamQuery, setPrevParamQuery] = useState(paramQuery);
  const [activeTab, setActiveTab] = useState<ExploreTab>('all');

  if (paramQuery !== prevParamQuery) {
    setPrevParamQuery(paramQuery);
    setQuery(paramQuery);
  }

  const results = useMemo(
    () => searchDicbook(query, { people, businesses, posts }),
    [query, people, businesses, posts]
  );

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      addRecentSearch(query);
    }
  }

  function handleContactBusiness(businessId: string) {
    startBusinessConversation(businessId);
    router.push('/messages');
  }

  const tabs: Array<{ id: ExploreTab; label: string; count: number }> = [
    {
      id: 'all',
      label: 'All',
      count:
        results.people.length +
        results.businesses.length +
        results.posts.length,
    },
    { id: 'people', label: 'People', count: results.people.length },
    { id: 'businesses', label: 'Businesses', count: results.businesses.length },
    { id: 'posts', label: 'Posts', count: results.posts.length },
    { id: 'hashtags', label: 'Hashtags', count: results.hashtags.length },
  ];

  const hasNoResults =
    results.people.length === 0 &&
    results.businesses.length === 0 &&
    results.posts.length === 0 &&
    results.hashtags.length === 0;

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          Search &amp; Explore
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Discover neighbors, local businesses, community discussions, and topics
        </p>
      </div>

      {/* Search Form */}
      <form
        onSubmit={handleSearchSubmit}
        role="search"
        className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 sm:p-4"
      >
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <label htmlFor="explore-search-input" className="sr-only">
              Search people, businesses, posts, or hashtags
            </label>
            <input
              id="explore-search-input"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search people, businesses, posts, or #hashtags..."
              className="min-h-[44px] w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 pl-10 pr-9 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:border-[var(--dicbook-brand)] focus:bg-white dark:focus:bg-slate-900 focus:outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="min-h-[44px] rounded-lg bg-[var(--dicbook-brand)] hover:bg-[var(--dicbook-brand-hover)] px-4 py-2 text-sm font-medium text-white transition-colors whitespace-nowrap shrink-0"
          >
            Search
          </button>
        </div>

        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Recent:
            </span>
            {recentSearches.map((term) => (
              <div
                key={term}
                className="inline-flex items-center rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
              >
                <button
                  type="button"
                  onClick={() => setQuery(term)}
                  className="px-2.5 py-1.5 font-medium text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  {term}
                </button>
                <button
                  type="button"
                  onClick={() => removeRecentSearch(term)}
                  aria-label={`Remove ${term} from recent searches`}
                  className="border-l border-slate-200 dark:border-slate-700 px-1.5 py-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </form>

      {/* Tabs */}
      <div
        role="tablist"
        aria-label="Explore categories"
        className="flex items-center gap-1 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1.5"
      >
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'inline-flex min-h-[38px] items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0',
                active
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              )}
            >
              <span>{tab.label}</span>
              <span className="text-xs opacity-75 tabular-nums">
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Empty State */}
      {hasNoResults && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center">
          <Search
            className="mx-auto h-8 w-8 text-slate-400 dark:text-slate-500"
            aria-hidden="true"
          />
          <h2 className="mt-3 text-base font-semibold text-slate-900 dark:text-slate-100">
            No matches for &ldquo;{query}&rdquo;
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Try searching for a neighborhood, coffee, print, or a hashtag like #UrbanDesign.
          </p>
          <button
            type="button"
            onClick={() => setQuery('')}
            className="mt-4 inline-flex min-h-[40px] items-center rounded-lg bg-[var(--dicbook-brand)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--dicbook-brand-hover)] transition-colors"
          >
            Reset Search
          </button>
        </div>
      )}

      {/* Results Sections */}
      {!hasNoResults && (
        <div className="space-y-6">
          {(activeTab === 'all' || activeTab === 'people') &&
            results.people.length > 0 && (
              <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5">
                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  People
                </h2>
                <ul className="mt-3 divide-y divide-slate-100 dark:divide-slate-800">
                  {results.people.map((person) => {
                    const isFollowing = followedPeopleIds.includes(person.id);
                    return (
                      <li
                        key={person.id}
                        className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-1 last:pb-0"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <MediaFrame
                            src={person.avatarUrl}
                            alt={person.name}
                            aspectClass="aspect-square"
                            className="h-11 w-11 shrink-0 rounded-full"
                            sizes="44px"
                          />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                              {person.name}
                            </p>
                            <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                              @{person.username} · {person.headline} · {person.location}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleFollowPerson(person.id)}
                          aria-pressed={isFollowing}
                          className={cn(
                            'min-h-[38px] rounded-lg border px-3.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0',
                            isFollowing
                              ? 'border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                              : 'border-[var(--dicbook-brand)] text-blue-600 dark:text-blue-400 hover:bg-[var(--dicbook-brand-soft)]'
                          )}
                        >
                          {isFollowing ? 'Following' : 'Follow'}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </section>
            )}

          {(activeTab === 'all' || activeTab === 'businesses') &&
            results.businesses.length > 0 && (
              <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5">
                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Businesses
                </h2>
                <ul className="mt-3 divide-y divide-slate-100 dark:divide-slate-800">
                  {results.businesses.map((biz) => {
                    const isFollowing = followedBusinessIds.includes(biz.id);
                    return (
                      <li
                        key={biz.id}
                        className="flex flex-wrap items-center justify-between gap-3 py-3.5 first:pt-1 last:pb-0"
                      >
                        <Link
                          href={`/businesses/${biz.id}`}
                          className="flex min-w-0 flex-1 items-center gap-3 group"
                        >
                          <MediaFrame
                            src={biz.avatarUrl}
                            alt={biz.name}
                            aspectClass="aspect-square"
                            className="h-11 w-11 shrink-0 rounded-lg border border-slate-200 dark:border-slate-700"
                            sizes="44px"
                          />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:underline">
                              {biz.name}
                            </p>
                            <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                              {biz.category} · {biz.location} ·{' '}
                              <span
                                className={
                                  biz.isOpenNow
                                    ? 'text-emerald-600 dark:text-emerald-400 font-medium'
                                    : 'text-slate-500 dark:text-slate-400'
                                }
                              >
                                {biz.isOpenNow ? 'Open now' : 'Closed'}
                              </span>
                            </p>
                          </div>
                        </Link>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleContactBusiness(biz.id)}
                            className="min-h-[38px] rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap"
                          >
                            Contact
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleFollowBusiness(biz.id)}
                            aria-pressed={isFollowing}
                            className={cn(
                              'min-h-[38px] rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap',
                              isFollowing
                                ? 'border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                                : 'border-[var(--dicbook-brand)] text-blue-600 dark:text-blue-400 hover:bg-[var(--dicbook-brand-soft)]'
                            )}
                          >
                            {isFollowing ? 'Following' : 'Follow'}
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            )}

          {(activeTab === 'all' || activeTab === 'hashtags') &&
            results.hashtags.length > 0 && (
              <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5">
                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Hashtags
                </h2>
                <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {results.hashtags.map((item) => (
                    <li key={item.tag}>
                      <button
                        type="button"
                        onClick={() => {
                          setQuery(item.tag);
                          setActiveTab('posts');
                          addRecentSearch(item.tag);
                        }}
                        className="flex w-full items-center justify-between rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 px-3.5 py-2.5 text-left hover:border-blue-500/40 transition-colors"
                      >
                        <span className="flex items-center gap-2 text-sm font-medium text-slate-900 dark:text-slate-100">
                          <Hash className="h-4 w-4 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                          <span>{item.tag.replace(/^#/, '')}</span>
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                          {item.postsCount} {item.postsCount === 1 ? 'post' : 'posts'}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            )}

          {(activeTab === 'all' || activeTab === 'posts') &&
            results.posts.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Posts
                </h2>
                {results.posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </section>
            )}
        </div>
      )}
    </div>
  );
}
