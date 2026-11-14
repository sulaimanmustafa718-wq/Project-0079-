'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Bell,
  Building2,
  Compass,
  Home,
  MessageCircle,
  Moon,
  Sun,
  User,
} from 'lucide-react';
import { useDicbook } from '@/lib/dicbook/store';
import { BrandWordmark } from './BrandWordmark';
import { MediaFrame } from './MediaFrame';
import { cn } from '@/lib/utils';

interface AppShellProps {
  children: React.ReactNode;
  hideRightColumn?: boolean;
}

export function AppShell({ children, hideRightColumn = false }: AppShellProps) {
  const pathname = usePathname();
  const {
    theme,
    toggleTheme,
    currentUser,
    businesses,
    followedBusinessIds,
    toggleFollowBusiness,
    unreadMessages,
    unreadNotifications,
    posts,
  } = useDicbook();

  const navItems = [
    { href: '/', label: 'Home', mobileLabel: 'Home', icon: Home, badge: 0 },
    {
      href: '/explore',
      label: 'Explore',
      mobileLabel: 'Explore',
      icon: Compass,
      badge: 0,
    },
    {
      href: '/businesses',
      label: 'Businesses',
      mobileLabel: 'Places',
      icon: Building2,
      badge: 0,
    },
    {
      href: '/messages',
      label: 'Messages',
      mobileLabel: 'Inbox',
      icon: MessageCircle,
      badge: unreadMessages,
    },
    {
      href: '/notifications',
      label: 'Notifications',
      mobileLabel: 'Alerts',
      icon: Bell,
      badge: unreadNotifications,
    },
    {
      href: '/profile',
      label: 'Profile',
      mobileLabel: 'Profile',
      icon: User,
      badge: 0,
    },
  ];

  function isActiveRoute(href: string) {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  // Compute top hashtags from current posts
  const trendingTags = React.useMemo(() => {
    const counts = new Map<string, number>();
    for (const post of posts) {
      for (const tag of post.hashtags) {
        counts.set(tag, (counts.get(tag) ?? 0) + 1);
      }
    }
    return Array.from(counts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [posts]);

  const suggestedBusinesses = businesses.slice(0, 3);

  return (
    <div className="min-h-screen bg-[var(--dicbook-bg)] text-[var(--dicbook-ink)]">
      {/* Mobile Compact Header (< lg) */}
      <header className="sticky top-0 z-30 flex h-[52px] items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 px-4 backdrop-blur-md lg:hidden">
        <BrandWordmark size="sm" />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={
              theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
            }
            className="inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Moon className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </div>
      </header>

      {/* Main Responsive Shell */}
      <div className="mx-auto flex max-w-[1380px] gap-6 px-3 sm:px-6 lg:px-8">
        {/* Desktop Left Sidebar */}
        <aside
          aria-label="Primary navigation"
          className="hidden lg:flex lg:w-64 lg:shrink-0 lg:flex-col lg:justify-between lg:sticky lg:top-0 lg:h-screen lg:py-6"
        >
          <div className="space-y-6">
            <div className="px-2">
              <BrandWordmark />
            </div>

            <nav className="space-y-1">
              {navItems.map((item) => {
                const active = isActiveRoute(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'flex min-h-[44px] items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors whitespace-nowrap',
                      active
                        ? 'bg-[var(--dicbook-brand-soft)] text-[var(--dicbook-brand-ink)] dark:text-blue-300 font-semibold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white'
                    )}
                  >
                    <span className="flex items-center gap-3">
                      <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                      <span>{item.label}</span>
                    </span>
                    {item.badge > 0 && (
                      <span
                        aria-label={`${item.badge} unread`}
                        className="inline-flex min-w-[22px] items-center justify-center rounded-md bg-[var(--dicbook-brand)] px-1.5 py-0.5 text-xs font-semibold text-white tabular-nums"
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="space-y-3 border-t border-slate-200 dark:border-slate-800 pt-4">
            <button
              type="button"
              onClick={toggleTheme}
              aria-pressed={theme === 'dark'}
              className="flex min-h-[42px] w-full items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <span className="flex items-center gap-2.5">
                {theme === 'dark' ? (
                  <Sun className="h-4 w-4 text-amber-400" aria-hidden="true" />
                ) : (
                  <Moon className="h-4 w-4 text-slate-600" aria-hidden="true" />
                )}
                <span>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
              </span>
              <span className="text-slate-500 dark:text-slate-400">
                Switch
              </span>
            </button>

            <Link
              href="/profile"
              className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors"
            >
              <MediaFrame
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                aspectClass="aspect-square"
                className="h-10 w-10 shrink-0 rounded-full"
                sizes="40px"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {currentUser.name}
                </p>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                  @{currentUser.username}
                </p>
              </div>
            </Link>
          </div>
        </aside>

        {/* Main Content Viewport */}
        <main className="min-w-0 flex-1 py-5 pb-24 lg:py-6 lg:pb-10">
          {children}
        </main>

        {/* Optional Contextual Right Column (xl+) */}
        {!hideRightColumn && (
          <aside
            aria-label="Community highlights"
            className="hidden xl:block xl:w-80 xl:shrink-0 xl:py-6"
          >
            <div className="sticky top-6 space-y-5">
              {/* Suggested Businesses */}
              <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Local Businesses
                  </h2>
                  <Link
                    href="/businesses"
                    className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline whitespace-nowrap shrink-0"
                  >
                    See directory
                  </Link>
                </div>

                <ul className="mt-3 divide-y divide-slate-100 dark:divide-slate-800">
                  {suggestedBusinesses.map((biz) => {
                    const isFollowing = followedBusinessIds.includes(biz.id);
                    return (
                      <li
                        key={biz.id}
                        className="flex items-center justify-between gap-3 py-3 first:pt-1 last:pb-0"
                      >
                        <Link
                          href={`/businesses/${biz.id}`}
                          className="flex min-w-0 items-center gap-2.5 group"
                        >
                          <MediaFrame
                            src={biz.avatarUrl}
                            alt={biz.name}
                            aspectClass="aspect-square"
                            className="h-9 w-9 shrink-0 rounded-lg border border-slate-200 dark:border-slate-700"
                            sizes="36px"
                          />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100 group-hover:underline">
                              {biz.name}
                            </p>
                            <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                              {biz.category} · {biz.isOpenNow ? 'Open' : 'Closed'}
                            </p>
                          </div>
                        </Link>
                        <button
                          type="button"
                          onClick={() => toggleFollowBusiness(biz.id)}
                          aria-pressed={isFollowing}
                          aria-label={
                            isFollowing
                              ? `Unfollow ${biz.name}`
                              : `Follow ${biz.name}`
                          }
                          className={cn(
                            'min-h-[34px] rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0',
                            isFollowing
                              ? 'border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                              : 'border-[var(--dicbook-brand)] bg-transparent text-blue-600 dark:text-blue-400 hover:bg-[var(--dicbook-brand-soft)]'
                          )}
                        >
                          {isFollowing ? 'Following' : 'Follow'}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </section>

              {/* Trending Hashtags */}
              <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Active Topics
                  </h2>
                  <Link
                    href="/explore"
                    className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline whitespace-nowrap shrink-0"
                  >
                    Explore
                  </Link>
                </div>

                <ul className="mt-3 divide-y divide-slate-100 dark:divide-slate-800">
                  {trendingTags.map((item) => (
                    <li key={item.tag} className="py-2.5 first:pt-1 last:pb-0">
                      <Link
                        href={`/explore?q=${encodeURIComponent(item.tag)}`}
                        className="flex items-center justify-between text-sm hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {item.tag}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                          {item.count} {item.count === 1 ? 'post' : 'posts'}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </aside>
        )}
      </div>

      {/* Mobile Bottom Tab Bar (< lg) */}
      <nav
        aria-label="Mobile navigation"
        className="fixed bottom-0 left-0 right-0 z-40 grid h-[60px] grid-cols-6 items-center border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md lg:hidden"
      >
        {navItems.map((item) => {
          const active = isActiveRoute(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'relative flex min-h-[48px] flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors',
                active
                  ? 'text-blue-600 dark:text-blue-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              )}
            >
              <span className="relative">
                <Icon className="h-5 w-5" aria-hidden="true" />
                {item.badge > 0 && (
                  <span className="absolute -right-2 -top-1 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[var(--dicbook-brand)] px-1 text-[10px] font-bold text-white tabular-nums">
                    {item.badge}
                  </span>
                )}
              </span>
              <span className="truncate max-w-full px-1">{item.mobileLabel}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
