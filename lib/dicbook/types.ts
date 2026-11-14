export type ThemeMode = 'light' | 'dark';

export type MediaAttachmentType = 'image' | 'video';

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  headline: string;
  bio: string;
  location: string;
  website: string;
  joinedDate: string;
  avatarUrl: string;
  coverUrl: string;
  followersCount: number;
  followingCount: number;
  isVerified?: boolean;
}

export interface BusinessHoursRow {
  day: string;
  hours: string;
}

export interface BusinessReview {
  id: string;
  authorName: string;
  authorUsername: string;
  authorAvatarUrl: string;
  rating: number;
  createdAt: string;
  comment: string;
}

export interface BusinessListing {
  id: string;
  name: string;
  handle: string;
  category: string;
  location: string;
  address: string;
  description: string;
  longDescription: string;
  avatarUrl: string;
  coverUrl: string;
  isOpenNow: boolean;
  openingHoursSummary: string;
  hoursSchedule: BusinessHoursRow[];
  phone: string;
  email: string;
  website: string;
  followersCount: number;
  rating: number;
  reviewsCount: number;
  photos: string[];
  reviews: BusinessReview[];
}

export interface PostComment {
  id: string;
  authorId: string;
  authorName: string;
  authorUsername: string;
  authorAvatarUrl: string;
  text: string;
  createdAt: string;
}

export interface Post {
  id: string;
  authorType: 'person' | 'business';
  authorId: string;
  authorName: string;
  authorHandle: string;
  authorSubtitle: string;
  authorAvatarUrl: string;
  createdAt: string;
  content: string;
  hashtags: string[];
  mediaType?: MediaAttachmentType;
  mediaUrl?: string;
  mediaCaption?: string;
  likesCount: number;
  isLiked: boolean;
  comments: PostComment[];
  sharesCount: number;
  isSaved: boolean;
}

export type NotificationKind = 'like' | 'comment' | 'follow' | 'mention' | 'business';

export interface NotificationItem {
  id: string;
  kind: NotificationKind;
  actorName: string;
  actorAvatarUrl: string;
  summary: string;
  detail?: string;
  createdAt: string;
  isRead: boolean;
  targetHref: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  participantType: 'person' | 'business';
  participantId: string;
  participantName: string;
  participantHandle: string;
  participantSubtitle: string;
  participantAvatarUrl: string;
  unreadCount: number;
  lastMessageAt: string;
  messages: ChatMessage[];
}

export interface BusinessFilters {
  query: string;
  category: string;
  location: string;
  openNow: boolean;
}

export interface ProfileEditDraft {
  name: string;
  headline: string;
  bio: string;
  location: string;
  website: string;
}
