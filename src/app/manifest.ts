import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'tuDeclaración',
    short_name: 'tuDeclaración',
    description:
      'Genera declaraciones juradas DGI a partir del TXT contable, con un flujo claro y seguro.',
    start_url: '/',
    display: 'standalone',
    background_color: '#E6ECF1',
    theme_color: '#164A8C',
    icons: [
      { src: '/brand/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/brand/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
