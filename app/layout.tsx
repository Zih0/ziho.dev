import type { Metadata } from 'next'
import { Noto_Sans_KR, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/layout/Header'
import { SearchProvider } from '@/components/providers/SearchProvider'
import { siteConfig } from '@/config/site'
import { getPosts } from '@/lib/mdx/get-posts'

const notoSansKR = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-noto-sans-kr',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  metadataBase: new URL(siteConfig.url),
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: siteConfig.url,
    siteName: siteConfig.name,
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.name,
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const posts = await getPosts()
  const searchPosts = posts.map(p => ({
    slug: p.slug,
    title: p.title,
    description: p.description,
    date: p.date,
    category: p.category,
    tags: p.tags,
  }))

  return (
    <html
      lang="ko"
      className={`dark ${notoSansKR.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        {/* bundle-defer-third-party: Preconnect for faster font load */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans">
        <SearchProvider initialPosts={searchPosts}>
          <div className="min-h-screen relative flex flex-col overflow-x-hidden">
            <div className="fixed inset-0 z-0 bg-background" />
            <div className="fixed inset-0 z-0 bg-grid opacity-30 pointer-events-none" />

            <Header />
            <main className="flex-1 relative z-10 w-full">{children}</main>
          </div>
        </SearchProvider>
      </body>
    </html>
  )
}
