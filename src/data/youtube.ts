export interface YoutubeVideo {
  title: string;
  url: string;
  thumbnail: string;
  date: string;
  description: string;
}

export const YOUTUBE_VIDEOS: YoutubeVideo[] = [];

// Add the real channel URL when the channel is created.
export const YOUTUBE_CHANNEL_URL = '';
