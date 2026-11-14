'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Bookmark,
  Heart,
  MessageSquare,
  Play,
  Share2,
  Building2,
} from 'lucide-react';
import { useDicbook } from '@/lib/dicbook/store';
import type { Post } from '@/lib/dicbook/types';
import { MediaFrame } from './MediaFrame';
import { cn } from '@/lib/utils';

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const { toggleLike, toggleSave, sharePost, addComment } = useDicbook();
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentError, setCommentError] = useState<string | null>(null);
  const [sharedFeedback, setSharedFeedback] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);

  const authorHref =
    post.authorType === 'business'
      ? `/businesses/${post.authorId}`
      : '/profile';

  function handleShare() {
    sharePost(post.id);
    setSharedFeedback(true);
    window.setTimeout(() => setSharedFeedback(false), 2000);
  }

  function handleCommentSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = addComment(post.id, commentText);
    if (!res.ok) {
      setCommentError(res.error ?? 'Write a comment first.');
      return;
    }
    setCommentText('');
    setCommentError(null);
  }

  return (
    <article className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 transition-colors">
      {/* Author header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Link href={authorHref} className="shrink-0">
            <MediaFrame
              src={post.authorAvatarUrl}
              alt={post.authorName}
              aspectClass="aspect-square"
              className="h-11 w-11 rounded-full border border-slate-200 dark:border-slate-700"
              sizes="44px"
            />
          </Link>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <Link
                href={authorHref}
                className="font-semibold text-sm sm:text-base text-slate-900 dark:text-slate-50 hover:underline truncate"
              >
                {post.authorName}
              </Link>
              {post.authorType === 'business' && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 dark:text-blue-400">
                  <Building2 className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Business</span>
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-x-1.5 text-xs text-slate-500 dark:text-slate-400">
              <span>{post.authorHandle}</span>
              <span aria-hidden="true">·</span>
              <span>{post.authorSubtitle}</span>
              <span aria-hidden="true">·</span>
              <time className="tabular-nums">{post.createdAt}</time>
            </div>
          </div>
        </div>
      </div>

      {/* Post body */}
      {post.content && (
        <p className="mt-3 text-[15px] leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-line">
          {post.content}
        </p>
      )}

      {/* Optional Media */}
      {post.mediaUrl && (
        <div className="mt-3.5 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800">
          {post.mediaType === 'video' ? (
            <div className="relative">
              <MediaFrame
                src={post.mediaUrl}
                alt={post.mediaCaption ?? 'Video preview'}
                aspectClass="aspect-[16/9]"
                className="w-full"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-t from-black/75 via-black/30 to-transparent p-4">
                <button
                  type="button"
                  onClick={() => setVideoPlaying((p) => !p)}
                  aria-label={
                    videoPlaying ? 'Pause video preview' : 'Play video preview'
                  }
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-xs font-semibold text-slate-900 shadow-sm hover:bg-white transition-colors"
                >
                  <Play className="h-4 w-4 fill-current" aria-hidden="true" />
                  <span>
                    {videoPlaying ? 'Playing Preview (Demo)' : 'Play Video Preview'}
                  </span>
                </button>
                {post.mediaCaption && (
                  <p className="mt-2 text-xs font-medium text-white/95 text-center">
                    {post.mediaCaption}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div>
              <MediaFrame
                src={post.mediaUrl}
                alt={post.mediaCaption ?? `${post.authorName} post photo`}
                aspectClass="aspect-[16/9]"
                className="w-full"
              />
              {post.mediaCaption && (
                <p className="border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 px-3 py-2 text-xs text-slate-600 dark:text-slate-400">
                  {post.mediaCaption}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Action bar */}
      <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800 pt-3">
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={() => toggleLike(post.id)}
            aria-pressed={post.isLiked}
            aria-label={post.isLiked ? `Unlike post (${post.likesCount})` : `Like post (${post.likesCount})`}
            className={cn(
              'inline-flex min-h-[40px] items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0',
              post.isLiked
                ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            )}
          >
            <Heart
              className={cn('h-4 w-4', post.isLiked && 'fill-current')}
              aria-hidden="true"
            />
            <span className="tabular-nums">{post.likesCount}</span>
            <span className="hidden sm:inline">Like</span>
          </button>

          <button
            type="button"
            onClick={() => setCommentsOpen((open) => !open)}
            aria-expanded={commentsOpen}
            aria-label={`Comments (${post.comments.length})`}
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
          >
            <MessageSquare className="h-4 w-4" aria-hidden="true" />
            <span className="tabular-nums">{post.comments.length}</span>
            <span className="hidden sm:inline">Comment</span>
          </button>

          <button
            type="button"
            onClick={handleShare}
            aria-label={`Share post (${post.sharesCount})`}
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
          >
            <Share2 className="h-4 w-4" aria-hidden="true" />
            <span className="tabular-nums">{post.sharesCount}</span>
            <span className="hidden sm:inline">
              {sharedFeedback ? 'Copied' : 'Share'}
            </span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => toggleSave(post.id)}
          aria-pressed={post.isSaved}
          aria-label={post.isSaved ? 'Remove from saved posts' : 'Save post'}
          className={cn(
            'inline-flex min-h-[40px] items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0',
            post.isSaved
              ? 'bg-[var(--dicbook-brand-soft)] text-[var(--dicbook-brand-ink)] dark:text-blue-300'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          )}
        >
          <Bookmark
            className={cn('h-4 w-4', post.isSaved && 'fill-current')}
            aria-hidden="true"
          />
          <span>{post.isSaved ? 'Saved' : 'Save'}</span>
        </button>
      </div>

      {/* Expandable Comments */}
      {commentsOpen && (
        <div className="mt-3 space-y-3 border-t border-slate-100 dark:border-slate-800 pt-3">
          {post.comments.length > 0 ? (
            <ul className="space-y-2.5">
              {post.comments.map((comment) => (
                <li
                  key={comment.id}
                  className="flex items-start gap-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 p-3"
                >
                  <MediaFrame
                    src={comment.authorAvatarUrl}
                    alt={comment.authorName}
                    aspectClass="aspect-square"
                    className="h-8 w-8 shrink-0 rounded-full"
                    sizes="32px"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 text-xs">
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {comment.authorName}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400">
                        @{comment.authorUsername}
                      </span>
                      <span aria-hidden="true" className="text-slate-400">
                        ·
                      </span>
                      <span className="text-slate-500 dark:text-slate-400 tabular-nums">
                        {comment.createdAt}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">
                      {comment.text}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              No comments yet. Start the conversation below.
            </p>
          )}

          <form onSubmit={handleCommentSubmit} className="flex items-center gap-2">
            <label htmlFor={`comment-${post.id}`} className="sr-only">
              Write a comment
            </label>
            <input
              id={`comment-${post.id}`}
              type="text"
              value={commentText}
              onChange={(e) => {
                setCommentText(e.target.value);
                if (commentError) setCommentError(null);
              }}
              placeholder="Add a comment..."
              className="min-h-[40px] flex-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:border-[var(--dicbook-brand)] focus:bg-white dark:focus:bg-slate-900 focus:outline-none"
            />
            <button
              type="submit"
              className="min-h-[40px] rounded-lg bg-slate-900 dark:bg-slate-100 px-3.5 py-2 text-xs font-medium text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white transition-colors whitespace-nowrap shrink-0"
            >
              Reply
            </button>
          </form>
          {commentError && (
            <p role="alert" className="text-xs text-red-600 dark:text-red-400">
              {commentError}
            </p>
          )}
        </div>
      )}
    </article>
  );
}
