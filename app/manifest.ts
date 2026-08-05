import type {MetadataRoute} from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Fitliner – Gym Access, Training and Progress',
    short_name: 'Fitliner',
    description: 'Gym access, training, food tracking, progress, coaching and rewards in one app.',
    start_url: '/en',
    display: 'standalone',
    background_color: '#0B0B0D',
    theme_color: '#7C3AED',
    categories: ['fitness', 'health', 'sports', 'lifestyle'],
    icons: [
      {src: '/icon.png', sizes: '1024x1024', type: 'image/png', purpose: 'maskable'}
    ]
  };
}
