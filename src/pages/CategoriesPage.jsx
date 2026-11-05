import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BookOpen,
  Brain,
  BriefcaseBusiness,
  Compass,
  Feather,
  Flame,
  Heart,
  Landmark,
  Lightbulb,
  Search,
  Sparkles,
} from 'lucide-react'

import { books } from '../data/books'

const categoryDetails = {
  Fiction: {
    description: 'Lose yourself in unforgettable stories and imaginative worlds.',
    icon: BookOpen,
  },
  Thriller: {
    description: 'Discover gripping suspense, secrets, and unexpected twists.',
    icon: Flame,
  },
  Mystery: {
    description: 'Follow clues, solve puzzles, and uncover hidden truths.',
    icon: Search,
  },
  Finance: {
    description: 'Build financial knowledge and make smarter money decisions.',
    icon: Landmark,
  },
  Philosophy: {
    description: 'Explore ideas about life, purpose, and the human experience.',
    icon: Compass,
  },
  Productivity: {
    description: 'Improve your focus, work habits, and everyday effectiveness.',
    icon: Lightbulb,
  },
  'Self Development': {
    description: 'Develop better habits and become a stronger version of yourself.',
    icon: Brain,
  },
  'Personal Development': {
    description: 'Find practical ideas for personal and professional growth.',
    icon: Sparkles,
  },
}

const defaultCategoryDetails = {
  description: 'Explore interesting reads and discover your next favourite book.',
  icon: Feather,
}

function getCategoryDetails(category) {
  return categoryDetails[category] || defaultCategoryDetails
}

function CategoryCard({ category, categoryBooks, index }) {
  const details = getCategoryDetails(category)
  const Icon = details.icon

  return (
    <Link
      to={`/books?category=${encodeURIComponent(category)}`}
      className="group relative flex min-h-[280px] flex-col justify-between overflow-hidden border border-white/10 bg-luxury-surface p-6 transition duration-300 hover:-translate-y-1 hover:border-luxury-gold/40 sm:p-7"
    >
      {/* Decorative background */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full border border-luxury-gold/10 transition duration-500 group-hover:scale-125 group-hover:border-luxury-gold/25" />

      <div className="pointer-events-none absolute -right-5 top-16 opacity-[0.04] transition duration-500 group-hover:opacity-[0.09]">
        <Icon size={150} strokeWidth={0.7} />
      </div>

      <div className="relative">
        <div className="flex items-start justify-between">
          <div className="flex h-12 w-12 items-center justify-center border border-luxury-gold/25 text-luxury-gold transition group-hover:bg-luxury-gold group-hover:text-luxury-black">
            <Icon size={22} strokeWidth={1.4} />
          </div>

          <span className="font-editorial text-4xl text-white/10 transition group-hover:text-luxury-gold/30">
            {String(index + 1).padStart(2, '0')}
          </span>
        </div>

        <h2 className="mt-7 font-editorial text-2xl transition group-hover:text-luxury-gold">
          {category}
        </h2>

        <p className="mt-3 max-w-sm text-sm leading-6 text-luxury-muted">
          {details.description}
        </p>
      </div>

      <div className="relative mt-8 flex items-center justify-between border-t border-white/10 pt-5">
        <span className="text-xs text-luxury-muted">
          {categoryBooks.length}{' '}
          {categoryBooks.length === 1 ? 'book' : 'books'}
        </span>

        <span className="flex items-center gap-2 text-xs font-medium text-luxury-gold">
          Explore
          <ArrowRight
            size={15}
            className="transition-transform group-hover:translate-x-1"
          />
        </span>
      </div>
    </Link>
  )
}

export default function CategoriesPage() {
  const categories = [
    ...new Set(books.map((book) => book.category).filter(Boolean)),
  ].sort((a, b) => a.localeCompare(b))

  return (
    <main className="min-h-screen bg-luxury-black text-luxury-ivory">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/10 px-4 py-16 sm:px-6 sm:py-20 lg:px-12 lg:py-24">
        <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-luxury-gold/5 blur-3xl" />

        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center border border-luxury-gold/25 bg-luxury-surface">
            <BookOpen
              size={25}
              strokeWidth={1.3}
              className="text-luxury-gold"
            />
          </div>

          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-luxury-gold">
            Find Your Next Chapter
          </p>

          <h1 className="font-editorial text-4xl leading-tight sm:text-5xl lg:text-7xl">
            Explore by
            <span className="block italic text-luxury-gold">
              Category.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-luxury-muted sm:text-base">
            From captivating fiction to ideas that change your
            perspective, discover books that match your interests,
            ambitions, and curiosity.
          </p>

          <Link
            to="/books"
            className="mt-8 inline-flex items-center gap-3 border border-luxury-gold/40 px-6 py-3 text-sm transition hover:bg-luxury-gold hover:text-luxury-black"
          >
            Browse All Books
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Categories */}
      <section className="px-4 py-12 sm:px-6 sm:py-16 lg:px-12 lg:py-20">
        <div className="mx-auto max-w-[1440px]">
          <div className="mb-9 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="mb-3 text-xs uppercase tracking-[0.25em] text-luxury-gold">
                The SmartBook Library
              </p>

              <h2 className="font-editorial text-3xl sm:text-4xl">
                Find Your Interest
              </h2>
            </div>

            <p className="max-w-md text-sm leading-6 text-luxury-muted">
              Choose a collection to explore books curated around
              a particular subject or reading experience.
            </p>
          </div>

          {categories.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {categories.map((category, index) => {
                const categoryBooks = books.filter(
                  (book) => book.category === category,
                )

                return (
                  <CategoryCard
                    key={category}
                    category={category}
                    categoryBooks={categoryBooks}
                    index={index}
                  />
                )
              })}
            </div>
          ) : (
            <div className="border border-white/10 bg-luxury-surface px-6 py-16 text-center">
              <BookOpen
                size={32}
                className="mx-auto text-luxury-gold"
              />

              <h3 className="mt-5 font-editorial text-2xl">
                Categories coming soon
              </h3>

              <p className="mt-3 text-sm text-luxury-muted">
                Add books to your catalogue to display categories here.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Reading Inspiration */}
      <section className="px-4 pb-16 sm:px-6 lg:px-12 lg:pb-24">
        <div className="mx-auto flex max-w-[1440px] flex-col items-start justify-between gap-6 border border-luxury-gold/20 bg-luxury-surface p-7 sm:p-10 md:flex-row md:items-center">
          <div className="max-w-2xl">
            <div className="mb-4 flex items-center gap-2 text-luxury-gold">
              <Heart size={18} />
              <span className="text-xs uppercase tracking-[0.2em]">
                A little inspiration
              </span>
            </div>

            <h2 className="font-editorial text-3xl sm:text-4xl">
              Not sure what to read next?
            </h2>

            <p className="mt-4 text-sm leading-7 text-luxury-muted">
              Tell our AI Book Concierge what interests you and
              discover books that fit your reading goals.
            </p>
          </div>

          <Link
            to="/ai-concierge"
            className="inline-flex shrink-0 items-center gap-3 bg-luxury-gold px-6 py-4 text-sm font-semibold text-luxury-black transition hover:bg-luxury-ivory"
          >
            <Sparkles size={17} />
            Meet Your Concierge
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </main>
  )
}