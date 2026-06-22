import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ChatBot from '@/components/ChatBot'
import { ThemeProvider } from '@/components/ThemeProvider'
import { LanguageProvider } from '@/components/LanguageProvider'

export const metadata = {
  title: {
    default: 'RecipeMate — Find Recipes from Your Ingredients',
    template: '%s | RecipeMate',
  },
  description:
    'RecipeMate helps you discover delicious recipes based on the ingredients you have at home. Search, save, and watch cooking tutorials.',
  keywords: ['recipes', 'cooking', 'ingredients', 'food', 'meal planning'],
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Prevent flash of wrong theme — runs before React hydrates */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var m=localStorage.getItem('rm-theme-mode')||'system';var r=m==='system'?(window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'):m;document.documentElement.setAttribute('data-theme',r);}catch(e){}})();`,
          }}
        />
        {/* Prevent flash of wrong language — set lang attribute before hydrate */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var l=localStorage.getItem('rm-language');if(l&&['en','my','zh','th','ja'].indexOf(l)!==-1){document.documentElement.lang=l;}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="antialiased flex flex-col min-h-screen">
        <ThemeProvider>
          <LanguageProvider>
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
            <ChatBot />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

