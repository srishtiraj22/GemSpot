/**
 * YouTube Service — Real YouTube Data API v3 integration
 * Extracts video details, channel info, and subscriber counts
 */

const YOUTUBE_API_KEY = process.env.EXPO_PUBLIC_YOUTUBE_API_KEY || '';

export interface YouTubeVideoInfo {
    videoId: string;
    title: string;
    thumbnailUrl: string;
    channelId: string;
    channelName: string;
    channelAvatar: string;
    subscriberCount: number;
    description: string;
    viewCount: number;
}

/**
 * Extract YouTube video ID from various URL formats
 */
export function extractYouTubeVideoId(url: string): string | null {
    const patterns = [
        /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
        /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
        /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
        /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    return null;
}

/**
 * Extract YouTube channel handle or ID from URL
 */
export function extractYouTubeChannelId(url: string): string | null {
    const patterns = [
        /(?:youtube\.com\/channel\/)([a-zA-Z0-9_-]+)/,
        /(?:youtube\.com\/@)([a-zA-Z0-9_.-]+)/,
        /(?:youtube\.com\/c\/)([a-zA-Z0-9_-]+)/,
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    return null;
}

/**
 * Fetch REAL video + channel info from YouTube Data API v3
 */
export async function fetchVideoInfo(youtubeUrl: string): Promise<YouTubeVideoInfo | null> {
    const videoId = extractYouTubeVideoId(youtubeUrl);
    if (!videoId) return null;

    if (!YOUTUBE_API_KEY || YOUTUBE_API_KEY === 'YOUR_YOUTUBE_API_KEY_HERE') {
        throw new Error('YouTube API key not configured. Add it to your .env file.');
    }

    try {
        // Step 1: Get video details
        const videoRes = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoId}&key=${YOUTUBE_API_KEY}`
        );
        const videoData = await videoRes.json();

        if (!videoData.items || videoData.items.length === 0) {
            throw new Error('Video not found. Check the URL and try again.');
        }

        if (videoData.error) {
            throw new Error(videoData.error.message || 'YouTube API error');
        }

        const video = videoData.items[0];
        const channelId = video.snippet.channelId;

        // Step 2: Get channel details (name, avatar, subscriber count)
        const channelRes = await fetch(
            `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelId}&key=${YOUTUBE_API_KEY}`
        );
        const channelData = await channelRes.json();

        if (!channelData.items || channelData.items.length === 0) {
            throw new Error('Channel not found');
        }

        const channel = channelData.items[0];

        return {
            videoId,
            title: video.snippet.title,
            thumbnailUrl: video.snippet.thumbnails?.high?.url || video.snippet.thumbnails?.default?.url || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
            channelId,
            channelName: channel.snippet.title,
            channelAvatar: channel.snippet.thumbnails?.default?.url || '',
            subscriberCount: parseInt(channel.statistics.subscriberCount || '0', 10),
            description: video.snippet.description || '',
            viewCount: parseInt(video.statistics.viewCount || '0', 10),
        };
    } catch (error: any) {
        if (error.message.includes('API key')) throw error;
        if (error.message.includes('not found')) throw error;
        throw new Error(`Failed to fetch video info: ${error.message}`);
    }
}

/**
 * Fetch channel info from a channel URL (for creator mode)
 */
export async function fetchChannelInfo(channelUrl: string): Promise<{
    channelId: string;
    channelName: string;
    channelAvatar: string;
    subscriberCount: number;
} | null> {
    const handle = extractYouTubeChannelId(channelUrl);
    if (!handle) return null;

    if (!YOUTUBE_API_KEY || YOUTUBE_API_KEY === 'YOUR_YOUTUBE_API_KEY_HERE') {
        throw new Error('YouTube API key not configured. Add it to your .env file.');
    }

    try {
        // Try by channel ID first, then handle
        let url = '';
        if (handle.startsWith('UC')) {
            url = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${handle}&key=${YOUTUBE_API_KEY}`;
        } else {
            // Search by handle (@username or custom URL)
            url = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&forHandle=${handle}&key=${YOUTUBE_API_KEY}`;
        }

        const res = await fetch(url);
        const data = await res.json();

        if (!data.items || data.items.length === 0) {
            // Fallback: try search API
            const searchRes = await fetch(
                `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${handle}&type=channel&maxResults=1&key=${YOUTUBE_API_KEY}`
            );
            const searchData = await searchRes.json();

            if (!searchData.items || searchData.items.length === 0) {
                throw new Error('Channel not found. Check the URL.');
            }

            const channelId = searchData.items[0].snippet.channelId;
            const channelRes = await fetch(
                `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelId}&key=${YOUTUBE_API_KEY}`
            );
            const channelData = await channelRes.json();
            const channel = channelData.items[0];

            return {
                channelId,
                channelName: channel.snippet.title,
                channelAvatar: channel.snippet.thumbnails?.default?.url || '',
                subscriberCount: parseInt(channel.statistics.subscriberCount || '0', 10),
            };
        }

        const channel = data.items[0];
        return {
            channelId: channel.id,
            channelName: channel.snippet.title,
            channelAvatar: channel.snippet.thumbnails?.default?.url || '',
            subscriberCount: parseInt(channel.statistics.subscriberCount || '0', 10),
        };
    } catch (error: any) {
        if (error.message.includes('API key')) throw error;
        if (error.message.includes('not found')) throw error;
        throw new Error(`Failed to fetch channel info: ${error.message}`);
    }
}

/**
 * Check if subscriber count is under 50K (eligible for GemSpots)
 */
export function isEligible(subscriberCount: number): boolean {
    return subscriberCount < 50000;
}
