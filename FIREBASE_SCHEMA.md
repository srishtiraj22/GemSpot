# GemSpot — Firebase Schema Guide

## Quick Start for New Developers

1. Copy `.env.example` → `.env`
2. Fill in your Firebase credentials (from Firebase Console → Project Settings)
3. Fill in your YouTube API key (from Google Cloud Console)
4. Run `npx expo start`

> [!IMPORTANT]
> Firebase client API keys are **not secret**. Security is enforced by Firestore Security Rules (see below). It is safe to share them in `.env.example` or even hardcode them — but we use `.env` for flexibility.

---

## Firestore Collections

### `users`
> One document per registered user. Doc ID = Firebase Auth UID.

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Same as doc ID (Auth UID) |
| `email` | string | User's email |
| `name` | string | Display name |
| `avatar` | string | Profile picture URL |
| `role` | string | `"viewer"` / `"creator"` / `"brand"` |
| `channelUrl` | string? | YouTube channel URL (creators only) |
| `streak` | number | Consecutive daily login streak |
| `votesToday` | number | Votes cast today (resets daily) |
| `lastActiveDate` | string | ISO date of last activity (for streak calc) |
| `followers` | number | Follower count |
| `following` | number | Following count |
| `posts` | number | Number of videos submitted |
| `lifetimeVotes` | number | Total votes ever cast |
| `badges` | string[] | Array of earned badge IDs |
| `createdAt` | string | ISO timestamp of account creation |

---

### `videos`
> One document per submitted video. Doc ID = auto-generated.

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Same as doc ID |
| `title` | string | Video title (from YouTube API) |
| `description` | string | Video description |
| `youtubeUrl` | string | Full YouTube URL |
| `youtubeVideoId` | string | YouTube video ID (11 chars) |
| `thumbnailUrl` | string | Thumbnail URL |
| `category` | string | `"music"` / `"gaming"` / `"education"` / etc. |
| `creatorId` | string | Reference to `creators` doc ID |
| `creatorName` | string | Creator's display name (denormalized) |
| `creatorAvatar` | string | Creator's avatar URL (denormalized) |
| `channelId` | string | YouTube channel ID |
| `subscriberCount` | number | Channel subscriber count at time of submission |
| `viewsFromPlatform` | number | View count on GemSpot |
| `voteCount` | number | Total upvotes |
| `commentCount` | number | Total comments |
| `voters` | string[] | Array of user IDs who voted |
| `submittedBy` | string | Auth UID of the user who submitted |
| `submittedAt` | string | ISO timestamp |
| `createdAt` | timestamp | Firestore server timestamp |
| `mode` | string | `"creator"` (own video) or `"gem"` (discovered) |

---

### `creators`
> One document per YouTube creator. Doc ID = auto-generated or channel-based.

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Same as doc ID |
| `name` | string | Channel name |
| `profilePicture` | string | Channel avatar URL |
| `channelId` | string | YouTube channel ID |
| `channelUrl` | string | YouTube channel URL |
| `subscriberCount` | number | Subscriber count |
| `claimed` | boolean | Whether a GemSpot user has claimed this profile |
| `userId` | string? | Auth UID of user who claimed (null if unclaimed) |
| `totalVotes` | number | Sum of votes across all videos |
| `videosCount` | number | Number of videos on GemSpot |
| `rank` | number | Leaderboard rank |
| `createdAt` | string | ISO timestamp |

---

### `comments`
> One document per comment. Doc ID = auto-generated.

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Same as doc ID |
| `videoId` | string | Reference to `videos` doc ID |
| `userId` | string | Auth UID of commenter |
| `userName` | string | Commenter's display name |
| `userAvatar` | string | Commenter's avatar URL |
| `text` | string | Comment content |
| `likes` | number | Like count |
| `createdAt` | string | ISO timestamp |

---

### `follows`
> One document per follow relationship. Doc ID = `{followerId}__{followingId}`.

| Field | Type | Description |
|-------|------|-------------|
| `followerId` | string | Auth UID of the follower |
| `followingId` | string | Auth UID of the user being followed |
| `createdAt` | timestamp | When the follow happened |

---

## Firestore Security Rules

Copy this into **Firebase Console → Firestore → Rules**:

```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    // ── Users ──
    match /users/{userId} {
      allow read: if true;
      allow create: if request.auth != null && request.auth.uid == userId;
      allow update: if request.auth != null && request.auth.uid == userId;
      allow delete: if false;
    }

    // ── Videos ──
    match /videos/{videoId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update: if request.auth != null;
      allow delete: if request.auth != null
        && resource.data.submittedBy == request.auth.uid;

      // ── Comments (subcollection of videos) ──
      match /comments/{commentId} {
        allow read: if true;
        allow create: if request.auth != null;
        allow update: if request.auth != null;
        allow delete: if request.auth != null
          && resource.data.userId == request.auth.uid;
      }
    }

    // ── Creators ──
    match /creators/{creatorId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update: if request.auth != null;
      allow delete: if false;
    }

    // ── Creator Stats ──
    match /creatorStats/{userId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update: if request.auth != null;
      allow delete: if false;
    }

    // ── Follows ──
    match /follows/{followId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow delete: if request.auth != null;
    }
  }
}
```

---

## Firebase Setup Checklist

### For the Project Owner
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project **gemspot-d492b**
3. **Authentication** → Enable **Email/Password** sign-in provider
4. **Firestore** → Create database (production mode), then paste the security rules above
5. **Firestore → Indexes** → Create composite indexes if queries fail:
   - `videos`: `creatorId` ASC + `createdAt` DESC
   - `videos`: `submittedBy` ASC + `createdAt` DESC
   - `videos`: `category` ASC + `createdAt` DESC
   - `comments`: `videoId` ASC + `createdAt` DESC

### For New Developers
1. Clone the repo
2. Copy `.env.example` → `.env`
3. Ask the project owner for the Firebase credentials and paste them in
4. Run `npm install && npx expo start`
5. That's it — the app connects to the shared Firebase project

---

## Entity Relationship Diagram

```
┌──────────┐       ┌──────────┐       ┌──────────┐
│  users   │──1:N──│  videos  │──1:N──│ comments │
│          │       │          │       │          │
│ id (uid) │       │ id       │       │ id       │
│ name     │       │ title    │       │ videoId  │
│ role     │       │ creator* │       │ userId   │
│ followers│       │ votes    │       │ text     │
│ badges[] │       │ views    │       │ likes    │
└──────────┘       └──────────┘       └──────────┘
     │                   │
     │              ┌────┘
     │              ▼
     │         ┌──────────┐
     │         │ creators │
     │         │          │
     │         │ id       │
     │         │ name     │
     │         │ claimed  │
     │         │ userId?  │
     │         └──────────┘
     │
     ▼
┌──────────┐
│ follows  │
│          │
│ follower │
│ following│
└──────────┘
```
