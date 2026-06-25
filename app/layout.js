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

