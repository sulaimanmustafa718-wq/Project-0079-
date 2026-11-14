'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Building2, Search, Send } from 'lucide-react';
import { useDicbook } from '@/lib/dicbook/store';
import { MediaFrame } from './MediaFrame';
import { cn } from '@/lib/utils';

export function MessagesView() {
  const {
    currentUser,
    conversations,
    activeConversationId,
    selectConversation,
    sendMessage,
  } = useDicbook();

  const [inboxQuery, setInboxQuery] = useState('');
  const [messageText, setMessageText] = useState('');
  const [sendError, setSendError] = useState<string | null>(null);
  // On mobile (< md), toggle between inbox list and conversation thread
  const [mobileShowThread, setMobileShowThread] = useState(
    Boolean(activeConversationId)
  );

  const filteredConversations = useMemo(() => {
    const q = inboxQuery.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((conv) =>
      `${conv.participantName} ${conv.participantHandle} ${conv.participantSubtitle}`
        .toLowerCase()
        .includes(q)
    );
  }, [conversations, inboxQuery]);

  const activeConversation = useMemo(
    () =>
      conversations.find((c) => c.id === activeConversationId) ??
      conversations[0] ??
      null,
    [conversations, activeConversationId]
  );

  function handleSelectConversation(id: string) {
    selectConversation(id);
    setMobileShowThread(true);
    setSendError(null);
  }

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!activeConversation) return;
    const res = sendMessage(activeConversation.id, messageText);
    if (!res.ok) {
      setSendError(res.error ?? 'Write a message first.');
      return;
    }
    setMessageText('');
    setSendError(null);
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          Messages
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Direct conversations with neighbors and local businesses
        </p>
      </div>

      <div className="grid min-h-[540px] grid-cols-1 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 md:grid-cols-[320px_1fr]">
        {/* Inbox Sidebar */}
        <section
          aria-label="Conversations inbox"
          className={cn(
            'flex flex-col border-b border-slate-200 dark:border-slate-800 md:border-b-0 md:border-r',
            mobileShowThread ? 'hidden md:flex' : 'flex'
          )}
        >
          <div className="border-b border-slate-100 dark:border-slate-800 p-3">
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <label htmlFor="messages-search" className="sr-only">
                Search conversations
              </label>
              <input
                id="messages-search"
                type="search"
                value={inboxQuery}
                onChange={(e) => setInboxQuery(e.target.value)}
                placeholder="Search inbox..."
                className="min-h-[40px] w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 pl-9 pr-3 py-1.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:border-[var(--dicbook-brand)] focus:bg-white dark:focus:bg-slate-900 focus:outline-none"
              />
            </div>
          </div>

          <ul className="flex-1 divide-y divide-slate-100 dark:divide-slate-800 overflow-y-auto">
            {filteredConversations.length > 0 ? (
              filteredConversations.map((conv) => {
                const isSelected = activeConversation?.id === conv.id;
                const lastMessage = conv.messages[conv.messages.length - 1];
                return (
                  <li key={conv.id}>
                    <button
                      type="button"
                      onClick={() => handleSelectConversation(conv.id)}
                      aria-current={isSelected ? 'true' : undefined}
                      className={cn(
                        'flex w-full items-start gap-3 p-3.5 text-left transition-colors',
                        isSelected
                          ? 'bg-[var(--dicbook-brand-soft)]'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                      )}
                    >
                      <MediaFrame
                        src={conv.participantAvatarUrl}
                        alt={conv.participantName}
                        aspectClass="aspect-square"
                        className="h-11 w-11 shrink-0 rounded-full border border-slate-200 dark:border-slate-700"
                        sizes="44px"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                            {conv.participantName}
                          </span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 shrink-0 tabular-nums">
                            {conv.lastMessageAt}
                          </span>
                        </div>
                        <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                          {conv.participantSubtitle}
                        </p>
                        <div className="mt-1 flex items-center justify-between gap-2">
                          <p className="truncate text-xs text-slate-700 dark:text-slate-300">
                            {lastMessage?.text ?? 'Start a conversation'}
                          </p>
                          {conv.unreadCount > 0 && (
                            <span className="inline-flex h-5 min-w-[20px] shrink-0 items-center justify-center rounded-full bg-[var(--dicbook-brand)] px-1.5 text-[11px] font-semibold text-white tabular-nums">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })
            ) : (
              <li className="p-6 text-center text-sm text-slate-500 dark:text-slate-400">
                No conversations match &ldquo;{inboxQuery}&rdquo;.
              </li>
            )}
          </ul>
        </section>

        {/* Active Conversation Thread */}
        <section
          aria-label="Conversation messages"
          className={cn(
            'flex flex-col justify-between',
            !mobileShowThread ? 'hidden md:flex' : 'flex'
          )}
        >
          {activeConversation ? (
            <>
              {/* Thread Header */}
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 px-4 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    type="button"
                    onClick={() => setMobileShowThread(false)}
                    aria-label="Back to inbox list"
                    className="inline-flex min-h-[38px] min-w-[38px] items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 md:hidden"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  <MediaFrame
                    src={activeConversation.participantAvatarUrl}
                    alt={activeConversation.participantName}
                    aspectClass="aspect-square"
                    className="h-10 w-10 shrink-0 rounded-full"
                    sizes="40px"
                  />
                  <div className="min-w-0">
                    <h2 className="truncate text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100">
                      {activeConversation.participantName}
                    </h2>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                      {activeConversation.participantHandle} ·{' '}
                      {activeConversation.participantSubtitle}
                    </p>
                  </div>
                </div>

                {activeConversation.participantType === 'business' && (
                  <Link
                    href={`/businesses/${activeConversation.participantId}`}
                    className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 whitespace-nowrap shrink-0"
                  >
                    <Building2 className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>View Listing</span>
                  </Link>
                )}
              </div>

              {/* Message List */}
              <div className="flex-1 space-y-3 overflow-y-auto p-4 sm:p-5">
                {activeConversation.messages.map((msg) => {
                  const isMine = msg.senderId === currentUser.id;
                  return (
                    <div
                      key={msg.id}
                      className={cn(
                        'flex flex-col max-w-[82%]',
                        isMine ? 'ml-auto items-end' : 'mr-auto items-start'
                      )}
                    >
                      <div
                        className={cn(
                          'rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
                          isMine
                            ? 'bg-[var(--dicbook-brand)] text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100'
                        )}
                      >
                        {msg.text}
                      </div>
                      <span className="mt-1 px-1 text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                        {msg.senderName} · {msg.createdAt}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Composer */}
              <form
                onSubmit={handleSend}
                className="border-t border-slate-100 dark:border-slate-800 p-3 sm:p-4"
              >
                {sendError && (
                  <p role="alert" className="mb-2 text-xs text-red-600 dark:text-red-400">
                    {sendError}
                  </p>
                )}
                <div className="flex items-center gap-2">
                  <label htmlFor="message-composer-input" className="sr-only">
                    Write a message to {activeConversation.participantName}
                  </label>
                  <input
                    id="message-composer-input"
                    type="text"
                    value={messageText}
                    onChange={(e) => {
                      setMessageText(e.target.value);
                      if (sendError) setSendError(null);
                    }}
                    placeholder={`Message ${activeConversation.participantName}...`}
                    className="min-h-[44px] flex-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:border-[var(--dicbook-brand)] focus:bg-white dark:focus:bg-slate-900 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-[var(--dicbook-brand)] hover:bg-[var(--dicbook-brand-hover)] px-4 py-2 text-sm font-medium text-white transition-colors whitespace-nowrap shrink-0"
                  >
                    <Send className="h-4 w-4" aria-hidden="true" />
                    <span>Send</span>
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center p-8 text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Select a conversation from the inbox to start messaging.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
