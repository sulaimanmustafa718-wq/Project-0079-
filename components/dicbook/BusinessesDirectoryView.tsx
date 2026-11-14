'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Clock, MapPin, MessageCircle, Search, Star } from 'lucide-react';
import { filterBusinesses } from '@/lib/dicbook/logic';
import { useDicbook } from '@/lib/dicbook/store';
import { MediaFrame } from './MediaFrame';
import { cn } from '@/lib/utils';

export function BusinessesDirectoryView() {
  const router = useRouter();
  const {
    businesses,
    followedBusinessIds,
    toggleFollowBusiness,
    startBusinessConversation,
  } = useDicbook();

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [location, setLocation] = useState('All');
  const [openNow, setOpenNow] = useState(false);

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(businesses.map((b) => b.category)))],
    [businesses]
  );

  const locations = useMemo(
    () => ['All', ...Array.from(new Set(businesses.map((b) => b.location)))],
    [businesses]
  );

  const filtered = useMemo(
    () =>
      filterBusinesses(businesses, {
        query,
        category,
        location,
        openNow,
      }),
    [businesses, query, category, location, openNow]
  );

  function resetFilters() {
    setQuery('');
    setCategory('All');
    setLocation('All');
    setOpenNow(false);
  }

  function handleContact(businessId: string) {
    startBusinessConversation(businessId);
    router.push('/messages');
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Local Businesses
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Browse trusted neighborhood shops, cafes, studios, and services
          </p>
        </div>
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 tabular-nums">
          Showing {filtered.length} of {businesses.length} listings
        </span>
      </div>

      {/* Filter Bar */}
      <section
        aria-label="Filter businesses"
        className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4"
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label
              htmlFor="biz-search"
              className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300"
            >
              Search name or keyword
            </label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                id="biz-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Coffee, print, books..."
                className="min-h-[42px] w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 pl-9 pr-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:border-[var(--dicbook-brand)] focus:bg-white dark:focus:bg-slate-900 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="biz-category"
              className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300"
            >
              Category
            </label>
            <select
              id="biz-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="min-h-[42px] w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-[var(--dicbook-brand)] focus:bg-white dark:focus:bg-slate-900 focus:outline-none"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="biz-location"
              className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300"
            >
              Location
            </label>
            <select
              id="biz-location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="min-h-[42px] w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-[var(--dicbook-brand)] focus:bg-white dark:focus:bg-slate-900 focus:outline-none"
            >
              {locations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={() => setOpenNow((v) => !v)}
              aria-pressed={openNow}
              className={cn(
                'flex min-h-[42px] w-full items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap',
                openNow
                  ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              )}
            >
              <Clock className="h-4 w-4" aria-hidden="true" />
              <span>Open now only</span>
            </button>
          </div>
        </div>
      </section>

      {/* Listings Grid or Empty State */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {filtered.map((biz) => {
            const isFollowing = followedBusinessIds.includes(biz.id);
            return (
              <article
                key={biz.id}
                className="flex flex-col justify-between overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
              >
                <div>
                  <Link href={`/businesses/${biz.id}`} className="block">
                    <MediaFrame
                      src={biz.coverUrl}
                      alt={`${biz.name} storefront`}
                      aspectClass="aspect-[16/9]"
                      className="w-full"
                    />
                  </Link>
                  <div className="p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <MediaFrame
                          src={biz.avatarUrl}
                          alt={biz.name}
                          aspectClass="aspect-square"
                          className="h-11 w-11 shrink-0 rounded-lg border border-slate-200 dark:border-slate-700"
                          sizes="44px"
                        />
                        <div className="min-w-0">
                          <Link
                            href={`/businesses/${biz.id}`}
                            className="block truncate text-base font-semibold text-slate-900 dark:text-slate-50 hover:underline"
                          >
                            {biz.name}
                          </Link>
                          <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                            {biz.category} · {biz.location}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-xs font-medium text-slate-700 dark:text-slate-300 shrink-0 tabular-nums">
                        <Star
                          className="h-3.5 w-3.5 fill-amber-400 text-amber-400"
                          aria-hidden="true"
                        />
                        <span>{biz.rating.toFixed(1)}</span>
                      </div>
                    </div>

                    <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                      {biz.description}
                    </p>

                    <div className="mt-3 flex flex-col gap-1 text-xs text-slate-500 dark:text-slate-400">
                      <span
                        className={cn(
                          'font-medium',
                          biz.isOpenNow
                            ? 'text-emerald-700 dark:text-emerald-400'
                            : 'text-slate-500 dark:text-slate-400'
                        )}
                      >
                        {biz.openingHoursSummary}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        <span className="truncate">{biz.address}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800 px-4 py-3 sm:px-5">
                  <Link
                    href={`/businesses/${biz.id}`}
                    className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline whitespace-nowrap"
                  >
                    View Profile
                  </Link>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleContact(biz.id)}
                      className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap"
                    >
                      <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Contact</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleFollowBusiness(biz.id)}
                      aria-pressed={isFollowing}
                      className={cn(
                        'min-h-[38px] rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap',
                        isFollowing
                          ? 'border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                          : 'bg-[var(--dicbook-brand)] text-white hover:bg-[var(--dicbook-brand-hover)]'
                      )}
                    >
                      {isFollowing ? 'Following' : 'Follow'}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            No matching businesses found
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            No listings matched your current category, location, or open-now filters.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-4 inline-flex min-h-[40px] items-center rounded-lg bg-[var(--dicbook-brand)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--dicbook-brand-hover)] transition-colors"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}
