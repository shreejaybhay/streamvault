// next.config.js

module.exports = {
  images: {
    domains: [
      'image.tmdb.org',
      'i.postimg.cc',
      'via.placeholder.com',
      'upload.wikimedia.org',
      'yts.mx',
      'avatars.githubusercontent.com' // Added GitHub avatars domain
    ],
  },
  async rewrites() {
    return [
      {
        source: '/yts-api/:path*',
        destination: 'https://yts.mx/api/v2/:path*',
      },
    ];
  },
};
  
