
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export const metadata = {
  title: 'StreamVault - Anime',
  description: 'Watch your favorite anime on StreamVault',
}

export default function AnimeLayout({ children }) {
  return <>{children}</>
}