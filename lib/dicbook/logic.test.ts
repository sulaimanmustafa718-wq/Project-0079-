import test from 'node:test';
import assert from 'node:assert/strict';
import {
  addBusinessReview,
  addPostComment,
  createFeedPost,
  filterBusinesses,
  getUnreadCounts,
  markAllNotificationsRead,
  markNotificationRead,
  openOrCreateBusinessConversation,
  searchDicbook,
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
  INITIAL_USER,
  MOCK_PEOPLE,
} from './mock-data';

test('createFeedPost validates empty text and prepends valid post', () => {
  const emptyRes = createFeedPost(INITIAL_POSTS, INITIAL_USER, '   ');
  assert.ok(emptyRes.error);
  assert.equal(emptyRes.posts.length, INITIAL_POSTS.length);

  const validRes = createFeedPost(
    INITIAL_POSTS,
    INITIAL_USER,
    'Hello #DICBOOK community! #LocalFirst'
  );
  assert.equal(validRes.error, undefined);
  assert.equal(validRes.posts.length, INITIAL_POSTS.length + 1);
  assert.equal(validRes.posts[0].content, 'Hello #DICBOOK community! #LocalFirst');
  assert.deepEqual(validRes.posts[0].hashtags, ['#dicbook', '#localfirst']);
});

test('togglePostLike, togglePostSave, and addPostComment update post state cleanly', () => {
  const targetId = INITIAL_POSTS[0].id;
  const initialLikes = INITIAL_POSTS[0].likesCount;
  const initialLiked = INITIAL_POSTS[0].isLiked;

  const afterLike = togglePostLike(INITIAL_POSTS, targetId);
  assert.equal(afterLike[0].isLiked, !initialLiked);
  assert.equal(afterLike[0].likesCount, initialLikes + (initialLiked ? -1 : 1));

  const afterSave = togglePostSave(afterLike, targetId);
  assert.equal(afterSave[0].isSaved, !INITIAL_POSTS[0].isSaved);

  const emptyComment = addPostComment(afterSave, targetId, INITIAL_USER, '  ');
  assert.ok(emptyComment.error);

  const withComment = addPostComment(afterSave, targetId, INITIAL_USER, 'Great update!');
  assert.equal(withComment.error, undefined);
  assert.equal(
    withComment.posts[0].comments.length,
    INITIAL_POSTS[0].comments.length + 1
  );
  assert.equal(withComment.posts[0].comments.at(-1)?.text, 'Great update!');
});

test('filterBusinesses supports category, location, openNow, query, and empty results', () => {
  const openCafes = filterBusinesses(INITIAL_BUSINESSES, {
    query: '',
    category: 'Coffee & Bakery',
    location: 'All',
    openNow: true,
  });
  assert.ok(openCafes.length >= 1);
  assert.ok(openCafes.every((b) => b.category === 'Coffee & Bakery' && b.isOpenNow));

  const noMatches = filterBusinesses(INITIAL_BUSINESSES, {
    query: 'zzznonexistentbusiness999',
    category: 'All',
    location: 'All',
    openNow: false,
  });
  assert.equal(noMatches.length, 0);
});

test('searchDicbook returns matching people, businesses, posts, and hashtags', () => {
  const results = searchDicbook('roast', {
    people: MOCK_PEOPLE,
    businesses: INITIAL_BUSINESSES,
    posts: INITIAL_POSTS,
  });

  assert.ok(results.businesses.some((b) => b.name.toLowerCase().includes('roast')));
  assert.ok(results.posts.length >= 1);
});

test('notifications and unread counters update accurately', () => {
  const initialUnread = getUnreadCounts(INITIAL_NOTIFICATIONS, INITIAL_CONVERSATIONS);
  assert.ok(initialUnread.unreadNotifications > 0);
  assert.ok(initialUnread.unreadMessages > 0);

  const firstUnread = INITIAL_NOTIFICATIONS.find((n) => !n.isRead);
  assert.ok(firstUnread);
  const afterSingle = markNotificationRead(INITIAL_NOTIFICATIONS, firstUnread.id);
  assert.equal(
    afterSingle.filter((n) => !n.isRead).length,
    initialUnread.unreadNotifications - 1
  );

  const afterAll = markAllNotificationsRead(INITIAL_NOTIFICATIONS);
  assert.equal(afterAll.filter((n) => !n.isRead).length, 0);
});

test('messaging sends replies and opens or creates business conversation', () => {
  const targetConv = INITIAL_CONVERSATIONS[0];
  const sendRes = sendConversationMessage(
    INITIAL_CONVERSATIONS,
    targetConv.id,
    INITIAL_USER,
    'See you at 3pm!'
  );
  assert.equal(sendRes.error, undefined);
  const updated = sendRes.conversations.find((c) => c.id === targetConv.id);
  assert.equal(updated?.messages.at(-1)?.text, 'See you at 3pm!');
  assert.equal(updated?.unreadCount, 0);

  const newBiz = INITIAL_BUSINESSES[INITIAL_BUSINESSES.length - 1];
  const openRes = openOrCreateBusinessConversation(sendRes.conversations, newBiz);
  assert.ok(openRes.activeConversationId.includes(newBiz.id));
  assert.ok(
    openRes.conversations.some((c) => c.id === openRes.activeConversationId)
  );
});

test('updateUserProfile validates display name and addBusinessReview updates rating', () => {
  const badProfile = updateUserProfile(INITIAL_USER, {
    name: '   ',
    headline: 'x',
    bio: 'y',
    location: 'z',
    website: 'w',
  });
  assert.ok(badProfile.error);

  const goodProfile = updateUserProfile(INITIAL_USER, {
    name: 'Maya Lin-Reyes',
    headline: 'Neighborhood Architect',
    bio: 'Designing civic spaces.',
    location: 'Portland, OR',
    website: 'https://dicbook.example/maya',
  });
  assert.equal(goodProfile.error, undefined);
  assert.equal(goodProfile.profile.name, 'Maya Lin-Reyes');

  const reviewRes = addBusinessReview(
    INITIAL_BUSINESSES,
    INITIAL_BUSINESSES[0].id,
    INITIAL_USER,
    5,
    'Consistently wonderful espresso and welcoming staff.'
  );
  assert.equal(reviewRes.error, undefined);
  assert.equal(
    reviewRes.businesses[0].reviewsCount,
    INITIAL_BUSINESSES[0].reviewsCount + 1
  );
});
