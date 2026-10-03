export interface YoutubeVideo {
  title: string;
  url: string;
  thumbnail: string;
  date: string;
  description: string;
}

export const YOUTUBE_VIDEOS: YoutubeVideo[] = [
  {
    title: 'Latest video',
    url: 'https://www.youtube.com/watch?v=ATpSXGSyFEw',
    thumbnail: 'https://i.ytimg.com/vi/ATpSXGSyFEw/maxresdefault.jpg',
    date: '2026-10-04',
    description: 'Watch my latest video on YouTube.',
  },
];

export const YOUTUBE_CHANNEL_URL = 'https://www.youtube.com/@bahaa_aldeen_nawlo';
