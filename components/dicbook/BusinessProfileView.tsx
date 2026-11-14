'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Clock,
  Globe,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Star,
} from 'lucide-react';
import { useDicbook } from '@/lib/dicbook/store';
import { MediaFrame } from './MediaFrame';
import { PostCard } from './PostCard';
import { cn } from '@/lib/utils';

type BusinessTab = 'overview' | 'posts' | 'photos' | 'reviews';

interface BusinessProfileViewProps {
  businessId: string;
}

export function BusinessProfileView({ businessId }: BusinessProfileViewProps) {
  const router = useRouter();
  const {
    businesses,
    posts,
    followedBusinessIds,
    toggleFollowBusiness,
    startBusinessConversation,
    submitBusinessReview,
  } = useDicbook();

  const [activeTab, setActiveTab] = useState<BusinessTab>('overview');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const business = useMemo(
    () => businesses.find((b) => b.id === businessId) ?? null,
    [businesses, businessId]
  );

  const businessPosts = useMemo(
    () =>
      posts.filter(
        (p) => p.authorType === 'business' && p.authorId === businessId
      ),
    [posts, businessId]
  );

  if (!business) {
    return (
      <div className="mx-auto max-w-2xl rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center">
        <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Business not found
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          This listing may have moved or is not available in the current mock directory.
        </p>
        <Link
          href="/businesses"
          className="mt-4 inline-flex min-h-[40px] items-center rounded-lg bg-[var(--dicbook-brand)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--dicbook-brand-hover)] transition-colors"
        >
          Back to Businesses
        </Link>
      </div>
    );
  }

  const isFollowing = followedBusinessIds.includes(business.id);

  function handleContact() {
    if (!business) return;
    startBusinessConversation(business.id);
    router.push('/messages');
  }

  function handleReviewSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!business) return;
    const res = submitBusinessReview(business.id, reviewRating, reviewText);
    if (!res.ok) {
      setReviewError(res.error ?? 'Unable to submit review.');
      return;
    }
    setReviewText('');
    setReviewRating(5);
    setReviewError(null);
    setReviewSuccess(true);
    window.setTimeout(() => setReviewSuccess(false), 3000);
  }

  const tabs: Array<{ id: BusinessTab; label: string }> = [
    { id: 'overview', label: 'Overview' },
    { id: 'posts', label: `Posts (${businessPosts.length})` },
    { id: 'photos', label: `Photos (${business.photos.length})` },
    { id: 'reviews', label: `Reviews (${business.reviewsCount})` },
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <Link
          href="/businesses"
          className="inline-flex min-h-[36px] items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>All Local Businesses</span>
        </Link>
      </div>

      {/* Business Header Card */}
      <section className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <MediaFrame
          src={business.coverUrl}
          alt={`${business.name} cover image`}
          aspectClass="aspect-[16/7]"
          className="w-full"
          priority
        />

        <div className="p-4 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-start gap-4">
              <MediaFrame
                src={business.avatarUrl}
                alt={business.name}
                aspectClass="aspect-square"
                className="-mt-12 h-20 w-20 shrink-0 rounded-xl border-4 border-white dark:border-slate-900 shadow-sm"
                sizes="80px"
              />
              <div className="min-w-0 pt-1">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                  {business.name}
                </h1>
                <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  {business.handle} · {business.category} · {business.location}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={handleContact}
                className="inline-flex min-h-[42px] items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-sm font-medium text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors whitespace-nowrap"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                <span>Contact</span>
              </button>
              <button
                type="button"
                onClick={() => toggleFollowBusiness(business.id)}
                aria-pressed={isFollowing}
                className={cn(
                  'min-h-[42px] rounded-lg px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap',
                  isFollowing
                    ? 'border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                    : 'bg-[var(--dicbook-brand)] text-white hover:bg-[var(--dicbook-brand-hover)]'
                )}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            </div>
          </div>

          <p className="mt-4 text-sm sm:text-[15px] leading-relaxed text-slate-700 dark:text-slate-300">
            {business.description}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-slate-100 dark:border-slate-800 pt-4 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            <span
              className={cn(
                'font-semibold',
                business.isOpenNow
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : 'text-slate-600 dark:text-slate-400'
              )}
            >
              {business.openingHoursSummary}
            </span>
            <span className="inline-flex items-center gap-1 tabular-nums">
              <Star
                className="h-4 w-4 fill-amber-400 text-amber-400"
                aria-hidden="true"
              />
              <strong className="text-slate-900 dark:text-slate-100">
                {business.rating.toFixed(1)}
              </strong>
              <span>({business.reviewsCount} reviews)</span>
            </span>
            <span className="tabular-nums">
              <strong className="text-slate-900 dark:text-slate-100">
                {business.followersCount.toLocaleString()}
              </strong>{' '}
              followers
            </span>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div
        role="tablist"
        aria-label="Business profile sections"
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

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              About &amp; Contact
            </h2>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              {business.longDescription}
            </p>
            <dl className="space-y-2.5 border-t border-slate-100 dark:border-slate-800 pt-3 text-sm">
              <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
                <MapPin className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                <dt className="sr-only">Address</dt>
                <dd>{business.address}</dd>
              </div>
              <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
                <Phone className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                <dt className="sr-only">Phone</dt>
                <dd className="tabular-nums">{business.phone}</dd>
              </div>
              <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
                <Mail className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                <dt className="sr-only">Email</dt>
                <dd>{business.email}</dd>
              </div>
              <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
                <Globe className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                <dt className="sr-only">Website</dt>
                <dd className="truncate">{business.website}</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-slate-500 dark:text-slate-400" aria-hidden="true" />
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Opening Hours
              </h2>
            </div>
            <ul className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {business.hoursSchedule.map((row) => (
                <li
                  key={row.day}
                  className="flex items-center justify-between gap-4 py-2.5 first:pt-0 last:pb-0"
                >
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {row.day}
                  </span>
                  <span className="text-slate-600 dark:text-slate-400 tabular-nums">
                    {row.hours}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}

      {activeTab === 'posts' && (
        <div className="space-y-4">
          {businessPosts.length > 0 ? (
            businessPosts.map((post) => <PostCard key={post.id} post={post} />)
          ) : (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                No recent updates posted by {business.name} yet.
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'photos' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {business.photos.map((photo, index) => (
            <div
              key={`${photo}-${index}`}
              className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
            >
              <MediaFrame
                src={photo}
                alt={`${business.name} gallery photo ${index + 1}`}
                aspectClass="aspect-[4/3]"
                className="w-full"
              />
            </div>
          ))}
        </div>
      )}

      {activeTab === 'reviews' && (
        <div className="space-y-4">
          {/* Frontend-only Add Review Form */}
          <form
            onSubmit={handleReviewSubmit}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3"
          >
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Leave a Community Review
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Rating:
              </span>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setReviewRating(star)}
                  aria-label={`${star} star${star > 1 ? 's' : ''}`}
                  aria-pressed={reviewRating === star}
                  className={cn(
                    'inline-flex min-h-[36px] items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors',
                    reviewRating >= star
                      ? 'border-amber-400/70 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  )}
                >
                  <Star
                    className={cn(
                      'h-3.5 w-3.5',
                      reviewRating >= star && 'fill-amber-400 text-amber-400'
                    )}
                    aria-hidden="true"
                  />
                  <span className="tabular-nums">{star}</span>
                </button>
              ))}
            </div>
            <div>
              <label htmlFor="business-review-text" className="sr-only">
                Your review
              </label>
              <textarea
                id="business-review-text"
                rows={3}
                value={reviewText}
                onChange={(e) => {
                  setReviewText(e.target.value);
                  if (reviewError) setReviewError(null);
                }}
                placeholder={`Share your experience with ${business.name}...`}
                className="w-full resize-none rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:border-[var(--dicbook-brand)] focus:bg-white dark:focus:bg-slate-900 focus:outline-none"
              />
            </div>
            {reviewError && (
              <p role="alert" className="text-xs text-red-600 dark:text-red-400">
                {reviewError}
              </p>
            )}
            <div className="flex items-center justify-between gap-2">
              {reviewSuccess ? (
                <span
                  role="status"
                  className="text-xs font-medium text-emerald-700 dark:text-emerald-400"
                >
                  Review added locally
                </span>
              ) : (
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Sample frontend review flow
                </span>
              )}
              <button
                type="submit"
                className="min-h-[40px] rounded-lg bg-[var(--dicbook-brand)] hover:bg-[var(--dicbook-brand-hover)] px-4 py-2 text-sm font-medium text-white transition-colors"
              >
                Post Review
              </button>
            </div>
          </form>

          {business.reviews.length > 0 ? (
            <ul className="space-y-3">
              {business.reviews.map((rev) => (
                <li
                  key={rev.id}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <MediaFrame
                        src={rev.authorAvatarUrl}
                        alt={rev.authorName}
                        aspectClass="aspect-square"
                        className="h-9 w-9 shrink-0 rounded-full"
                        sizes="36px"
                      />
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {rev.authorName}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          @{rev.authorUsername} · {rev.createdAt}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
                      <Star
                        className="h-4 w-4 fill-amber-400 text-amber-400"
                        aria-hidden="true"
                      />
                      <span>{rev.rating}.0</span>
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                    {rev.comment}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                No reviews yet. Be the first neighbor to share feedback above.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
