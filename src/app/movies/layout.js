export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export const metadata = {
  title: 'StreamVault - Movies',
  description: 'Watch your favorite movies on StreamVault',
}

export default function MoviesLayout({ children }) {
  return <>{children}</>
}