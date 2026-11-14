'use client';

import React, { useState } from 'react';
import { Image as ImageIcon, Video, X, Send } from 'lucide-react';
import { useDicbook } from '@/lib/dicbook/store';
import type { MediaAttachmentType } from '@/lib/dicbook/types';
import { MediaFrame } from './MediaFrame';
import { cn } from '@/lib/utils';

const PRESET_ATTACHMENTS: Array<{
  id: string;
  label: string;
  mediaType: MediaAttachmentType;
  mediaUrl: string;
  mediaCaption: string;
}> = [
  {
    id: 'preset-coffee',
    label: 'Roastery Photo',
    mediaType: 'image',
    mediaUrl: '/images/feed_coffee_roastery.jpg',
    mediaCaption: 'Neighborhood coffee counter morning setup',
  },
  {
    id: 'preset-studio',
    label: 'Studio Photo',
    mediaType: 'image',
    mediaUrl: '/images/feed_design_studio.jpg',
    mediaCaption: 'Print & design workshop table',
  },
  {
    id: 'preset-video',
    label: 'Walkthrough Video',
    mediaType: 'video',
    mediaUrl: '/images/profile_cover_city.jpg',
    mediaCaption: '0:32 Civic Plaza Walkthrough Clip (Preview)',
  },
];

export function PostComposer() {
  const { currentUser, createPost } = useDicbook();
  const [content, setContent] = useState('');
  const [selectedAttachmentId, setSelectedAttachmentId] = useState<
    string | null
  >(null);
  const [showMediaOptions, setShowMediaOptions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justPosted, setJustPosted] = useState(false);

  const selectedAttachment = PRESET_ATTACHMENTS.find(
    (item) => item.id === selectedAttachmentId
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = createPost(
      content,
      selectedAttachment
        ? {
            mediaType: selectedAttachment.mediaType,
            mediaUrl: selectedAttachment.mediaUrl,
            mediaCaption: selectedAttachment.mediaCaption,
          }
        : undefined
    );

    if (!res.ok) {
      setError(res.error ?? 'Unable to publish post.');
      return;
    }

    setContent('');
    setSelectedAttachmentId(null);
    setShowMediaOptions(false);
    setError(null);
    setJustPosted(true);
    window.setTimeout(() => setJustPosted(false), 2500);
  }

  return (
    <section
      aria-label="Create a post"
      className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5"
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex items-start gap-3">
          <MediaFrame
            src={currentUser.avatarUrl}
            alt={currentUser.name}
            aspectClass="aspect-square"
            className="h-10 w-10 shrink-0 rounded-full border border-slate-200 dark:border-slate-700"
            sizes="40px"
          />
          <div className="min-w-0 flex-1">
            <label htmlFor="dicbook-post-input" className="sr-only">
              Share an update with your neighborhood
            </label>
            <textarea
              id="dicbook-post-input"
              rows={3}
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Share a neighborhood update, local recommendation, or #hashtag..."
              className="w-full resize-none rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:border-[var(--dicbook-brand)] focus:bg-white dark:focus:bg-slate-900 focus:outline-none"
            />
          </div>
        </div>

        {selectedAttachment && (
          <div className="relative overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60">
            <MediaFrame
              src={selectedAttachment.mediaUrl}
              alt={selectedAttachment.mediaCaption}
              aspectClass="aspect-[16/9]"
              className="max-h-56 w-full"
            />
            <div className="flex items-center justify-between gap-2 px-3 py-2 text-xs text-slate-600 dark:text-slate-300">
              <span className="truncate font-medium">
                {selectedAttachment.mediaType === 'video' ? 'Video attachment: ' : 'Photo attachment: '}
                {selectedAttachment.mediaCaption}
              </span>
              <button
                type="button"
                onClick={() => setSelectedAttachmentId(null)}
                aria-label="Remove attachment"
                className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-500 hover:bg-slate-200/70 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {showMediaOptions && (
          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-2.5">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300 mr-1">
              Sample media:
            </span>
            {PRESET_ATTACHMENTS.map((preset) => {
              const active = selectedAttachmentId === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() =>
                    setSelectedAttachmentId(active ? null : preset.id)
                  }
                  className={cn(
                    'inline-flex min-h-[34px] items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0',
                    active
                      ? 'border-[var(--dicbook-brand)] bg-[var(--dicbook-brand-soft)] text-[var(--dicbook-brand-ink)] dark:text-blue-300'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                  )}
                >
                  {preset.mediaType === 'video' ? (
                    <Video className="h-3.5 w-3.5" aria-hidden="true" />
                  ) : (
                    <ImageIcon className="h-3.5 w-3.5" aria-hidden="true" />
                  )}
                  <span>{preset.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {error && (
          <p role="alert" className="text-xs font-medium text-red-600 dark:text-red-400">
            {error}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowMediaOptions((v) => !v)}
              aria-expanded={showMediaOptions}
              className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
            >
              <ImageIcon className="h-4 w-4 text-slate-500 dark:text-slate-400" aria-hidden="true" />
              <span>Add Photo / Video</span>
            </button>
            {justPosted && (
              <span
                role="status"
                className="text-xs font-medium text-emerald-700 dark:text-emerald-400"
              >
                Published locally to feed
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
              {content.length}/500
            </span>
            <button
              type="submit"
              className="inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-[var(--dicbook-brand)] hover:bg-[var(--dicbook-brand-hover)] px-4 py-2 text-sm font-medium text-white transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              <Send className="h-4 w-4" aria-hidden="true" />
              <span>Publish Post</span>
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}
