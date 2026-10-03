export interface YoutubeVideo {
  title: string;
  url: string;
  thumbnail: string;
  date: string;
  description: string;
}

export const YOUTUBE_VIDEOS: YoutubeVideo[] = [
  {
    title: 'Portswigger - Access Control - Lab #1 Unprotected admin functionality',
    url: 'https://www.youtube.com/watch?v=ATpSXGSyFEw',
    thumbnail: 'https://i.ytimg.com/vi/ATpSXGSyFEw/hqdefault.jpg',
    date: '2026-10-04',
    description: 'PortSwigger access control lab walkthrough.',
  },
];

export const YOUTUBE_CHANNEL_URL = 'https://www.youtube.com/@bahaa_aldeen_nawlo';
