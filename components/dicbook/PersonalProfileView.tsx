'use client';

import React, { useMemo, useState } from 'react';
import { Calendar, Edit3, Globe, MapPin, X } from 'lucide-react';
import { useDicbook } from '@/lib/dicbook/store';
import { MediaFrame } from './MediaFrame';
import { PostCard } from './PostCard';
import { cn } from '@/lib/utils';

type ProfileTab = 'posts' | 'media' | 'about' | 'saved';

export function PersonalProfileView() {
  const { currentUser, posts, updateProfile } = useDicbook();
  const [activeTab, setActiveTab] = useState<ProfileTab>('posts');
  const [isEditing, setIsEditing] = useState(false);

  // Edit profile form draft
  const [name, setName] = useState(currentUser.name);
  const [headline, setHeadline] = useState(currentUser.headline);
  const [bio, setBio] = useState(currentUser.bio);
  const [location, setLocation] = useState(currentUser.location);
  const [website, setWebsite] = useState(currentUser.website);
  const [formError, setFormError] = useState<string | null>(null);

  const userPosts = useMemo(
    () =>
      posts.filter(
        (p) => p.authorType === 'person' && p.authorId === currentUser.id
      ),
    [posts, currentUser.id]
  );

  const mediaPosts = useMemo(
    () => userPosts.filter((p) => Boolean(p.mediaUrl)),
    [userPosts]
  );

  const savedPosts = useMemo(() => posts.filter((p) => p.isSaved), [posts]);

  function openEditModal() {
    setName(currentUser.name);
    setHeadline(currentUser.headline);
    setBio(currentUser.bio);
    setLocation(currentUser.location);
    setWebsite(currentUser.website);
    setFormError(null);
    setIsEditing(true);
  }

  function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    const res = updateProfile({
      name,
      headline,
      bio,
      location,
      website,
    });
    if (!res.ok) {
      setFormError(res.error ?? 'Unable to save profile.');
      return;
    }
    setIsEditing(false);
  }

  const tabs: Array<{ id: ProfileTab; label: string }> = [
    { id: 'posts', label: `Posts (${userPosts.length})` },
    { id: 'media', label: `Media (${mediaPosts.length})` },
    { id: 'about', label: 'About' },
    { id: 'saved', label: `Saved (${savedPosts.length})` },
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      {/* Profile Header Card */}
      <section className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <MediaFrame
          src={currentUser.coverUrl}
          alt={`${currentUser.name} cover banner`}
          aspectClass="aspect-[16/6]"
          className="w-full"
          priority
        />

        <div className="p-4 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <MediaFrame
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                aspectClass="aspect-square"
                className="-mt-14 h-22 w-22 shrink-0 rounded-full border-4 border-white dark:border-slate-900 shadow-sm"
                sizes="88px"
              />
              <div className="min-w-0 pt-1">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                  {currentUser.name}
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  @{currentUser.username} · {currentUser.headline}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={openEditModal}
              className="inline-flex min-h-[40px] items-center justify-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-sm font-medium text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors whitespace-nowrap shrink-0"
            >
              <Edit3 className="h-4 w-4" aria-hidden="true" />
              <span>Edit Profile</span>
            </button>
          </div>

          <p className="mt-4 text-sm sm:text-[15px] leading-relaxed text-slate-700 dark:text-slate-300">
            {currentUser.bio}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            {currentUser.location && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-slate-400" aria-hidden="true" />
                <span>{currentUser.location}</span>
              </span>
            )}
            {currentUser.website && (
              <span className="inline-flex items-center gap-1.5">
                <Globe className="h-4 w-4 text-slate-400" aria-hidden="true" />
                <span>{currentUser.website}</span>
              </span>
            )}
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-slate-400" aria-hidden="true" />
              <span>{currentUser.joinedDate}</span>
            </span>
          </div>

          <div className="mt-4 flex items-center gap-5 border-t border-slate-100 dark:border-slate-800 pt-4 text-sm tabular-nums">
            <span>
              <strong className="font-semibold text-slate-900 dark:text-slate-100">
                {currentUser.followingCount.toLocaleString()}
              </strong>{' '}
              <span className="text-slate-500 dark:text-slate-400">Following</span>
            </span>
            <span>
              <strong className="font-semibold text-slate-900 dark:text-slate-100">
                {currentUser.followersCount.toLocaleString()}
              </strong>{' '}
              <span className="text-slate-500 dark:text-slate-400">Followers</span>
            </span>
          </div>
        </div>
      </section>

      {/* Profile Tabs */}
      <div
        role="tablist"
        aria-label="Profile sections"
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
      {activeTab === 'posts' && (
        <div className="space-y-4">
          {userPosts.length > 0 ? (
            userPosts.map((post) => <PostCard key={post.id} post={post} />)
          ) : (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                You haven&apos;t published any posts yet.
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'media' && (
        <div>
          {mediaPosts.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {mediaPosts.map((post) => (
                <div
                  key={post.id}
                  className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                >
                  <MediaFrame
                    src={post.mediaUrl ?? ''}
                    alt={post.mediaCaption ?? post.content}
                    aspectClass="aspect-[4/3]"
                    className="w-full"
                  />
                  <p className="p-3 text-xs text-slate-600 dark:text-slate-300 truncate">
                    {post.mediaCaption ?? post.content}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                No photos or video clips shared yet.
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'about' && (
        <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Profile Details
          </h2>
          <dl className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
            <div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3">
              <dt className="font-medium text-slate-500 dark:text-slate-400">
                Display Name
              </dt>
              <dd className="sm:col-span-2 text-slate-900 dark:text-slate-100">
                {currentUser.name}
              </dd>
            </div>
            <div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3">
              <dt className="font-medium text-slate-500 dark:text-slate-400">
                Headline
              </dt>
              <dd className="sm:col-span-2 text-slate-900 dark:text-slate-100">
                {currentUser.headline || 'Not specified'}
              </dd>
            </div>
            <div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3">
              <dt className="font-medium text-slate-500 dark:text-slate-400">
                Location
              </dt>
              <dd className="sm:col-span-2 text-slate-900 dark:text-slate-100">
                {currentUser.location || 'Not specified'}
              </dd>
            </div>
            <div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3">
              <dt className="font-medium text-slate-500 dark:text-slate-400">
                Website
              </dt>
              <dd className="sm:col-span-2 text-slate-900 dark:text-slate-100">
                {currentUser.website || 'Not specified'}
              </dd>
            </div>
          </dl>
        </section>
      )}

      {activeTab === 'saved' && (
        <div className="space-y-4">
          {savedPosts.length > 0 ? (
            savedPosts.map((post) => <PostCard key={post.id} post={post} />)
          ) : (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                No saved posts yet. Bookmark any post from the feed to find it here.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Edit Profile Modal */}
      {isEditing && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-profile-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
        >
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-xl">
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2
                id="edit-profile-title"
                className="text-lg font-semibold text-slate-900 dark:text-slate-50"
              >
                Edit Profile
              </h2>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                aria-label="Close edit profile modal"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="mt-4 space-y-4">
              <div>
                <label
                  htmlFor="edit-name"
                  className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300"
                >
                  Display Name
                </label>
                <input
                  id="edit-name"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (formError) setFormError(null);
                  }}
                  className="min-h-[42px] w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-[var(--dicbook-brand)] focus:bg-white dark:focus:bg-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="edit-headline"
                  className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300"
                >
                  Headline
                </label>
                <input
                  id="edit-headline"
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  className="min-h-[42px] w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-[var(--dicbook-brand)] focus:bg-white dark:focus:bg-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="edit-bio"
                  className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300"
                >
                  Bio
                </label>
                <textarea
                  id="edit-bio"
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full resize-none rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-[var(--dicbook-brand)] focus:bg-white dark:focus:bg-slate-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="edit-location"
                    className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300"
                  >
                    Location
                  </label>
                  <input
                    id="edit-location"
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="min-h-[42px] w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-[var(--dicbook-brand)] focus:bg-white dark:focus:bg-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label
                    htmlFor="edit-website"
                    className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300"
                  >
                    Website
                  </label>
                  <input
                    id="edit-website"
                    type="text"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="min-h-[42px] w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-[var(--dicbook-brand)] focus:bg-white dark:focus:bg-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              {formError && (
                <p role="alert" className="text-xs font-medium text-red-600 dark:text-red-400">
                  {formError}
                </p>
              )}

              <div className="flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="min-h-[40px] rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="min-h-[40px] rounded-lg bg-[var(--dicbook-brand)] hover:bg-[var(--dicbook-brand-hover)] px-4 py-2 text-sm font-medium text-white transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
