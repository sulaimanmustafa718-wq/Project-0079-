import type {
  BusinessFilters,
  BusinessListing,
  BusinessReview,
  Conversation,
  NotificationItem,
  Post,
  ProfileEditDraft,
  UserProfile,
} from './types';

export function extractHashtags(text: string): string[] {
  const matches = text.match(/#[a-zA-Z0-9_]+/g);
  if (!matches) return [];
  return Array.from(new Set(matches.map((tag) => tag.toLowerCase())));
}

export function createFeedPost(
  posts: Post[],
  author: UserProfile,
  content: string,
  options?: {
    mediaType?: 'image' | 'video';
    mediaUrl?: string;
    mediaCaption?: string;
  }
): { posts: Post[]; error?: string } {
  const trimmed = content.trim();
  const hasMedia = Boolean(options?.mediaUrl);

  if (!trimmed && !hasMedia) {
    return { posts, error: 'Write an update or attach media before posting.' };
  }

  const newPost: Post = {
    id: `post-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    authorType: 'person',
    authorId: author.id,
    authorName: author.name,
    authorHandle: `@${author.username}`,
    authorSubtitle: author.location,
    authorAvatarUrl: author.avatarUrl,
    createdAt: 'Just now',
    content: trimmed,
    hashtags: extractHashtags(trimmed),
    mediaType: options?.mediaType,
    mediaUrl: options?.mediaUrl,
    mediaCaption: options?.mediaCaption,
    likesCount: 0,
    isLiked: false,
    comments: [],
    sharesCount: 0,
    isSaved: false,
  };

  return { posts: [newPost, ...posts] };
}

export function togglePostLike(posts: Post[], postId: string): Post[] {
  return posts.map((post) => {
    if (post.id !== postId) return post;
    const nextLiked = !post.isLiked;
    return {
      ...post,
      isLiked: nextLiked,
      likesCount: Math.max(0, post.likesCount + (nextLiked ? 1 : -1)),
    };
  });
}

export function togglePostSave(posts: Post[], postId: string): Post[] {
  return posts.map((post) =>
    post.id === postId ? { ...post, isSaved: !post.isSaved } : post
  );
}

export function incrementPostShare(posts: Post[], postId: string): Post[] {
  return posts.map((post) =>
    post.id === postId ? { ...post, sharesCount: post.sharesCount + 1 } : post
  );
}

export function addPostComment(
  posts: Post[],
  postId: string,
  author: UserProfile,
  text: string
): { posts: Post[]; error?: string } {
  const trimmed = text.trim();
  if (!trimmed) {
    return { posts, error: 'Comment cannot be empty.' };
  }

  return {
    posts: posts.map((post) => {
      if (post.id !== postId) return post;
      return {
        ...post,
        comments: [
          ...post.comments,
          {
            id: `comment-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
            authorId: author.id,
            authorName: author.name,
            authorUsername: author.username,
            authorAvatarUrl: author.avatarUrl,
            text: trimmed,
            createdAt: 'Just now',
          },
        ],
      };
    }),
  };
}

export function filterBusinesses(
  businesses: BusinessListing[],
  filters: BusinessFilters
): BusinessListing[] {
  const q = filters.query.trim().toLowerCase();

  return businesses.filter((biz) => {
    if (filters.category !== 'All' && biz.category !== filters.category) {
      return false;
    }
    if (filters.location !== 'All' && biz.location !== filters.location) {
      return false;
    }
    if (filters.openNow && !biz.isOpenNow) {
      return false;
    }
    if (q) {
      const haystack = `${biz.name} ${biz.category} ${biz.location} ${biz.description}`.toLowerCase();
      if (!haystack.includes(q)) {
        return false;
      }
    }
    return true;
  });
}

export function addBusinessReview(
  businesses: BusinessListing[],
  businessId: string,
  author: UserProfile,
  rating: number,
  comment: string
): { businesses: BusinessListing[]; error?: string } {
  const trimmed = comment.trim();
  if (!trimmed) {
    return { businesses, error: 'Please write a short review before submitting.' };
  }

  const clampedRating = Math.min(5, Math.max(1, Math.round(rating)));

  return {
    businesses: businesses.map((biz) => {
      if (biz.id !== businessId) return biz;
      const newReview: BusinessReview = {
        id: `rev-${Date.now()}`,
        authorName: author.name,
        authorUsername: author.username,
        authorAvatarUrl: author.avatarUrl,
        rating: clampedRating,
        createdAt: 'Just now',
        comment: trimmed,
      };
      const updatedReviews = [newReview, ...biz.reviews];
      const totalReviews = biz.reviewsCount + 1;
      const nextRating = Number(
        ((biz.rating * biz.reviewsCount + clampedRating) / totalReviews).toFixed(1)
      );
      return {
        ...biz,
        reviews: updatedReviews,
        reviewsCount: totalReviews,
        rating: nextRating,
      };
    }),
  };
}

export interface HashtagSummary {
  tag: string;
  postsCount: number;
}

export interface SearchResults {
  people: UserProfile[];
  businesses: BusinessListing[];
  posts: Post[];
  hashtags: HashtagSummary[];
}

export function searchDicbook(
  query: string,
  data: {
    people: UserProfile[];
    businesses: BusinessListing[];
    posts: Post[];
  }
): SearchResults {
  const q = query.trim().toLowerCase();
  const hashtagCounts = new Map<string, number>();

  for (const post of data.posts) {
    for (const tag of post.hashtags) {
      hashtagCounts.set(tag, (hashtagCounts.get(tag) ?? 0) + 1);
    }
  }

  const allHashtags: HashtagSummary[] = Array.from(hashtagCounts.entries())
    .map(([tag, postsCount]) => ({ tag, postsCount }))
    .sort((a, b) => b.postsCount - a.postsCount);

  if (!q) {
    return {
      people: data.people,
      businesses: data.businesses,
      posts: data.posts,
      hashtags: allHashtags,
    };
  }

  return {
    people: data.people.filter((person) =>
      `${person.name} ${person.username} ${person.headline} ${person.location}`
        .toLowerCase()
        .includes(q)
    ),
    businesses: data.businesses.filter((biz) =>
      `${biz.name} ${biz.handle} ${biz.category} ${biz.location} ${biz.description}`
        .toLowerCase()
        .includes(q)
    ),
    posts: data.posts.filter((post) =>
      `${post.authorName} ${post.content} ${post.hashtags.join(' ')}`
        .toLowerCase()
        .includes(q)
    ),
    hashtags: allHashtags.filter((item) => item.tag.toLowerCase().includes(q)),
  };
}

export function markNotificationRead(
  notifications: NotificationItem[],
  notificationId: string
): NotificationItem[] {
  return notifications.map((item) =>
    item.id === notificationId ? { ...item, isRead: true } : item
  );
}

export function markAllNotificationsRead(
  notifications: NotificationItem[]
): NotificationItem[] {
  return notifications.map((item) => ({ ...item, isRead: true }));
}

export function getUnreadCounts(
  notifications: NotificationItem[],
  conversations: Conversation[]
): { unreadNotifications: number; unreadMessages: number } {
  return {
    unreadNotifications: notifications.filter((n) => !n.isRead).length,
    unreadMessages: conversations.reduce((sum, conv) => sum + conv.unreadCount, 0),
  };
}

export function markConversationRead(
  conversations: Conversation[],
  conversationId: string
): Conversation[] {
  return conversations.map((conv) =>
    conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
  );
}

export function sendConversationMessage(
  conversations: Conversation[],
  conversationId: string,
  sender: UserProfile,
  text: string
): { conversations: Conversation[]; error?: string } {
  const trimmed = text.trim();
  if (!trimmed) {
    return { conversations, error: 'Enter a message before sending.' };
  }

  return {
    conversations: conversations.map((conv) => {
      if (conv.id !== conversationId) return conv;
      return {
        ...conv,
        unreadCount: 0,
        lastMessageAt: 'Just now',
        messages: [
          ...conv.messages,
          {
            id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
            senderId: sender.id,
            senderName: sender.name,
            text: trimmed,
            createdAt: 'Just now',
          },
        ],
      };
    }),
  };
}

export function openOrCreateBusinessConversation(
  conversations: Conversation[],
  business: BusinessListing
): { conversations: Conversation[]; activeConversationId: string } {
  const existing = conversations.find(
    (c) => c.participantType === 'business' && c.participantId === business.id
  );

  if (existing) {
    return {
      conversations: markConversationRead(conversations, existing.id),
      activeConversationId: existing.id,
    };
  }

  const created: Conversation = {
    id: `conv-biz-${business.id}`,
    participantType: 'business',
    participantId: business.id,
    participantName: business.name,
    participantHandle: business.handle,
    participantSubtitle: `${business.category} · ${business.location}`,
    participantAvatarUrl: business.avatarUrl,
    unreadCount: 0,
    lastMessageAt: 'New thread',
    messages: [
      {
        id: `msg-welcome-${business.id}`,
        senderId: business.id,
        senderName: business.name,
        text: `Hi there! Thanks for reaching out to ${business.name}. Ask us about hours, availability, or custom requests.`,
        createdAt: 'Just now',
      },
    ],
  };

  return {
    conversations: [created, ...conversations],
    activeConversationId: created.id,
  };
}

export function updateUserProfile(
  profile: UserProfile,
  draft: ProfileEditDraft
): { profile: UserProfile; error?: string } {
  const name = draft.name.trim();
  if (!name) {
    return { profile, error: 'Display name is required.' };
  }

  return {
    profile: {
      ...profile,
      name,
      headline: draft.headline.trim(),
      bio: draft.bio.trim(),
      location: draft.location.trim(),
      website: draft.website.trim(),
    },
  };
}
