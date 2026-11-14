'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from 'react';
import {
  addBusinessReview,
  addPostComment,
  createFeedPost,
  getUnreadCounts,
  incrementPostShare,
  markAllNotificationsRead,
  markConversationRead,
  markNotificationRead,
  openOrCreateBusinessConversation,
  sendConversationMessage,
  togglePostLike,
  togglePostSave,
  updateUserProfile,
} from './logic';
import {
  INITIAL_BUSINESSES,
  INITIAL_CONVERSATIONS,
  INITIAL_NOTIFICATIONS,
  INITIAL_POSTS,
  INITIAL_RECENT_SEARCHES,
  INITIAL_USER,
  MOCK_PEOPLE,
} from './mock-data';
import type {
  BusinessListing,
  Conversation,
  MediaAttachmentType,
  NotificationItem,
  Post,
  ProfileEditDraft,
  ThemeMode,
  UserProfile,
} from './types';

interface DicbookContextValue {
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (next: ThemeMode) => void;
  currentUser: UserProfile;
  people: UserProfile[];
  businesses: BusinessListing[];
  posts: Post[];
  notifications: NotificationItem[];
  conversations: Conversation[];
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
  followedBusinessIds: string[];
  followedPeopleIds: string[];
  recentSearches: string[];
  unreadNotifications: number;
  unreadMessages: number;
  // Actions
  createPost: (
    content: string,
    media?: {
      mediaType: MediaAttachmentType;
      mediaUrl: string;
      mediaCaption?: string;
    }
  ) => { ok: boolean; error?: string };
  toggleLike: (postId: string) => void;
  toggleSave: (postId: string) => void;
  sharePost: (postId: string) => void;
  addComment: (postId: string, text: string) => { ok: boolean; error?: string };
  toggleFollowBusiness: (businessId: string) => void;
  toggleFollowPerson: (personId: string) => void;
  submitBusinessReview: (
    businessId: string,
    rating: number,
    comment: string
  ) => { ok: boolean; error?: string };
  updateProfile: (draft: ProfileEditDraft) => { ok: boolean; error?: string };
  readNotification: (id: string) => void;
  readAllNotifications: () => void;
  selectConversation: (conversationId: string) => void;
  sendMessage: (
    conversationId: string,
    text: string
  ) => { ok: boolean; error?: string };
  startBusinessConversation: (businessId: string) => string | null;
  addRecentSearch: (term: string) => void;
  removeRecentSearch: (term: string) => void;
}

const DicbookContext = createContext<DicbookContextValue | null>(null);

const THEME_STORAGE_KEY = 'dicbook-theme';
const THEME_EVENT = 'dicbook-theme-change';

function subscribeToTheme(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const handler = () => callback();
  window.addEventListener('storage', handler);
  window.addEventListener(THEME_EVENT, handler);
  return () => {
    window.removeEventListener('storage', handler);
    window.removeEventListener(THEME_EVENT, handler);
  };
}

function getClientThemeSnapshot(): ThemeMode {
  try {
    const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
    if (
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
    ) {
      return 'dark';
    }
  } catch {
    // Ignore storage errors
  }
  return 'light';
}

function getServerThemeSnapshot(): ThemeMode {
  return 'light';
}

export function DicbookProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore(
    subscribeToTheme,
    getClientThemeSnapshot,
    getServerThemeSnapshot
  );
  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_USER);
  const [people] = useState<UserProfile[]>(MOCK_PEOPLE);
  const [businesses, setBusinesses] =
    useState<BusinessListing[]>(INITIAL_BUSINESSES);
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(
    INITIAL_NOTIFICATIONS
  );
  const [conversations, setConversations] = useState<Conversation[]>(
    INITIAL_CONVERSATIONS
  );
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(INITIAL_CONVERSATIONS[0]?.id ?? null);
  const [followedBusinessIds, setFollowedBusinessIds] = useState<string[]>([
    'biz-hearth-roastery',
    'biz-alder-books',
  ]);
  const [followedPeopleIds, setFollowedPeopleIds] = useState<string[]>([
    'user-elena',
    'user-claire',
  ]);
  const [recentSearches, setRecentSearches] = useState<string[]>(
    INITIAL_RECENT_SEARCHES
  );

  // Sync <html> class with external theme store
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const setTheme = useCallback((next: ThemeMode) => {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, next);
      window.dispatchEvent(new Event(THEME_EVENT));
    } catch {
      // Ignore storage failures
    }
  }, []);

  const toggleTheme = useCallback(() => {
    const next: ThemeMode = getClientThemeSnapshot() === 'light' ? 'dark' : 'light';
    setTheme(next);
  }, [setTheme]);

  // TODO: connect to Munia posts and media (replace local prepend with POST /api/posts or Munia server mutation)
  const createPost = useCallback(
    (
      content: string,
      media?: {
        mediaType: MediaAttachmentType;
        mediaUrl: string;
        mediaCaption?: string;
      }
    ) => {
      const res = createFeedPost(posts, currentUser, content, media);
      if (res.error) {
        return { ok: false, error: res.error };
      }
      setPosts(res.posts);
      return { ok: true };
    },
    [posts, currentUser]
  );

  // TODO: connect to Munia follows and likes
  const toggleLike = useCallback((postId: string) => {
    setPosts((prev) => togglePostLike(prev, postId));
  }, []);

  // TODO: saved posts are frontend-only mock state until Munia supports bookmarks
  const toggleSave = useCallback((postId: string) => {
    setPosts((prev) => togglePostSave(prev, postId));
  }, []);

  const sharePost = useCallback((postId: string) => {
    setPosts((prev) => incrementPostShare(prev, postId));
  }, []);

  // TODO: connect to Munia posts and comments/replies
  const addComment = useCallback(
    (postId: string, text: string) => {
      const res = addPostComment(posts, postId, currentUser, text);
      if (res.error) {
        return { ok: false, error: res.error };
      }
      setPosts(res.posts);
      return { ok: true };
    },
    [posts, currentUser]
  );

  // TODO: connect to Munia follows and likes (business follows are frontend-only mock until business entities exist)
  const toggleFollowBusiness = useCallback(
    (businessId: string) => {
      const isFollowing = followedBusinessIds.includes(businessId);
      setFollowedBusinessIds((prev) =>
        isFollowing
          ? prev.filter((id) => id !== businessId)
          : [...prev, businessId]
      );
      setBusinesses((bizList) =>
        bizList.map((b) =>
          b.id === businessId
            ? {
                ...b,
                followersCount: Math.max(
                  0,
                  b.followersCount + (isFollowing ? -1 : 1)
                ),
              }
            : b
        )
      );
    },
    [followedBusinessIds]
  );

  // TODO: connect to Munia follows and likes
  const toggleFollowPerson = useCallback((personId: string) => {
    setFollowedPeopleIds((prev) =>
      prev.includes(personId)
        ? prev.filter((id) => id !== personId)
        : [...prev, personId]
    );
  }, []);

  // TODO: reviews are frontend-only mock features
  const submitBusinessReview = useCallback(
    (businessId: string, rating: number, comment: string) => {
      const res = addBusinessReview(
        businesses,
        businessId,
        currentUser,
        rating,
        comment
      );
      if (res.error) {
        return { ok: false, error: res.error };
      }
      setBusinesses(res.businesses);
      return { ok: true };
    },
    [businesses, currentUser]
  );

  // TODO: connect to Munia user/profile data
  const updateProfile = useCallback(
    (draft: ProfileEditDraft) => {
      const res = updateUserProfile(currentUser, draft);
      if (res.error) {
        return { ok: false, error: res.error };
      }
      setCurrentUser(res.profile);
      return { ok: true };
    },
    [currentUser]
  );

  // TODO: connect Munia conversations and notifications
  const readNotification = useCallback((id: string) => {
    setNotifications((prev) => markNotificationRead(prev, id));
  }, []);

  const readAllNotifications = useCallback(() => {
    setNotifications((prev) => markAllNotificationsRead(prev));
  }, []);

  // TODO: direct messaging is frontend-only mock until Munia backend support
  const selectConversation = useCallback((conversationId: string) => {
    setActiveConversationId(conversationId);
    setConversations((prev) => markConversationRead(prev, conversationId));
  }, []);

  const sendMessage = useCallback(
    (conversationId: string, text: string) => {
      const res = sendConversationMessage(
        conversations,
        conversationId,
        currentUser,
        text
      );
      if (res.error) {
        return { ok: false, error: res.error };
      }
      setConversations(res.conversations);
      return { ok: true };
    },
    [conversations, currentUser]
  );

  // TODO: connect business listings and contact flow
  const startBusinessConversation = useCallback(
    (businessId: string) => {
      const biz = businesses.find((b) => b.id === businessId);
      if (!biz) return null;
      const res = openOrCreateBusinessConversation(conversations, biz);
      setConversations(res.conversations);
      setActiveConversationId(res.activeConversationId);
      return res.activeConversationId;
    },
    [businesses, conversations]
  );

  const addRecentSearch = useCallback((term: string) => {
    const clean = term.trim();
    if (!clean) return;
    setRecentSearches((prev) =>
      [clean, ...prev.filter((item) => item.toLowerCase() !== clean.toLowerCase())].slice(
        0,
        6
      )
    );
  }, []);

  const removeRecentSearch = useCallback((term: string) => {
    setRecentSearches((prev) => prev.filter((item) => item !== term));
  }, []);

  const { unreadNotifications, unreadMessages } = useMemo(
    () => getUnreadCounts(notifications, conversations),
    [notifications, conversations]
  );

  const value = useMemo<DicbookContextValue>(
    () => ({
      theme,
      toggleTheme,
      setTheme,
      currentUser,
      people,
      businesses,
      posts,
      notifications,
      conversations,
      activeConversationId,
      setActiveConversationId,
      followedBusinessIds,
      followedPeopleIds,
      recentSearches,
      unreadNotifications,
      unreadMessages,
      createPost,
      toggleLike,
      toggleSave,
      sharePost,
      addComment,
      toggleFollowBusiness,
      toggleFollowPerson,
      submitBusinessReview,
      updateProfile,
      readNotification,
      readAllNotifications,
      selectConversation,
      sendMessage,
      startBusinessConversation,
      addRecentSearch,
      removeRecentSearch,
    }),
    [
      theme,
      toggleTheme,
      setTheme,
      currentUser,
      people,
      businesses,
      posts,
      notifications,
      conversations,
      activeConversationId,
      followedBusinessIds,
      followedPeopleIds,
      recentSearches,
      unreadNotifications,
      unreadMessages,
      createPost,
      toggleLike,
      toggleSave,
      sharePost,
      addComment,
      toggleFollowBusiness,
      toggleFollowPerson,
      submitBusinessReview,
      updateProfile,
      readNotification,
      readAllNotifications,
      selectConversation,
      sendMessage,
      startBusinessConversation,
      addRecentSearch,
      removeRecentSearch,
    ]
  );

  return (
    <DicbookContext.Provider value={value}>{children}</DicbookContext.Provider>
  );
}

export function useDicbook(): DicbookContextValue {
  const ctx = useContext(DicbookContext);
  if (!ctx) {
    throw new Error('useDicbook must be used inside DicbookProvider');
  }
  return ctx;
}
