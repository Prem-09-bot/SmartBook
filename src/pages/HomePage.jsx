import { Link } from 'react-router-dom'
import { ArrowDown, ArrowRight, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { books } from '../data/books'

const featuredBooks = books.slice(0, 4)

const categories = [
  {
    name: 'Fiction',
    description: 'Worlds beyond imagination',
    number: '01',
  },
  {
    name: 'Self Development',
    description: 'Become your best self',
    number: '02',
  },
  {
    name: 'Business',
    description: 'Ideas that move you forward',
    number: '03',
  },
  {
    name: 'Mystery & Thriller',
    description: 'Stories that keep you guessing',
    number: '04',
  },
]

export default function HomePage() {
  return (
    <main>
      {/* ==================== HERO SECTION ==================== */}
      <section className="relative flex min-h-[680px] items-center overflow-hidden bg-luxury-black lg:min-h-[760px]">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-35"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=2000&q=90')",
          }}
        />

        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-luxury-black via-luxury-black/85 to-luxury-black/30" />

        <div className="absolute inset-0 bg-gradient-to-t from-luxury-black via-transparent to-luxury-black/30" />

        {/* Hero Content */}
        <div className="relative mx-auto grid w-full max-w-[1440px] items-center gap-12 px-5 py-24 sm:px-8 lg:grid-cols-2 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Eyebrow */}
            <div className="mb-8 flex items-center gap-3">
              <span className="h-px w-10 bg-luxury-gold" />

              <p className="text-xs uppercase tracking-[0.28em] text-luxury-gold">
                A bookstore for the curious
              </p>
            </div>

            {/* Heading */}
            <h1 className="max-w-3xl font-editorial text-5xl leading-[1.12] text-luxury-ivory sm:text-6xl md:text-7xl xl:text-8xl">
              Some stories
              <br />

              <span className="italic text-luxury-gold">
                stay with you.
              </span>
            </h1>

            {/* Description */}
            <p className="mt-8 max-w-lg text-base leading-8 text-luxury-muted sm:text-lg">
              Discover extraordinary books, uncover new perspectives,
              and find the story you didn&apos;t know you needed.
            </p>

            {/* Buttons */}
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                to="/books"
                className="inline-flex items-center gap-3 bg-luxury-gold px-7 py-4 text-sm font-semibold text-luxury-black transition hover:bg-luxury-ivory"
              >
                Explore Collection
                <ArrowRight size={18} />
              </Link>

              <Link
                to="/ai-concierge"
                className="inline-flex items-center gap-3 border border-white/20 px-7 py-4 text-sm text-luxury-ivory transition hover:border-luxury-gold hover:text-luxury-gold"
              >
                <Sparkles size={17} />
                Meet Your AI Concierge
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="mt-16 flex flex-wrap gap-x-10 gap-y-5 border-t border-white/10 pt-8">
              <div>
                <p className="font-editorial text-3xl text-luxury-ivory">
                  10k+
                </p>

                <p className="mt-1 text-xs text-luxury-muted">
                  Books to discover
                </p>
              </div>

              <div>
                <p className="font-editorial text-3xl text-luxury-ivory">
                  4.9/5
                </p>

                <p className="mt-1 text-xs text-luxury-muted">
                  Reader satisfaction
                </p>
              </div>

              <div>
                <p className="font-editorial text-3xl text-luxury-ivory">
                  AI
                </p>

                <p className="mt-1 text-xs text-luxury-muted">
                  Personalised discovery
                </p>
              </div>
            </div>
          </motion.div>

          {/* Hero Decorative Element */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative hidden min-h-[480px] items-center justify-center lg:flex"
          >
            {/* Decorative Circles */}
            <div className="absolute h-[390px] w-[390px] rounded-full border border-luxury-gold/20" />

            <div className="absolute h-[320px] w-[320px] rounded-full border border-luxury-gold/20" />

            {/* Decorative Book */}
            <div className="relative flex h-[360px] w-[270px] rotate-[-5deg] flex-col justify-between border border-luxury-gold/50 bg-gradient-to-br from-[#27221B] via-[#17130F] to-[#0B0B0C] p-8 shadow-2xl shadow-black/60">
              <div className="border-t border-luxury-gold/50 pt-4">
                <p className="text-[9px] uppercase tracking-[0.35em] text-luxury-gold">
                  The art of discovery
                </p>
              </div>

              <div>
                <p className="font-editorial text-4xl leading-tight text-luxury-ivory">
                  Beyond
                  <br />
                  the
                  <br />

                  <span className="italic text-luxury-gold">
                    ordinary.
                  </span>
                </p>

                <div className="mt-6 h-px w-12 bg-luxury-gold" />
              </div>

              <div>
                <p className="text-[9px] uppercase tracking-[0.25em] text-luxury-muted">
                  SmartBook Collection
                </p>
              </div>
            </div>

            {/* Floating Card */}
            <div className="absolute bottom-10 right-0 max-w-[190px] border border-white/10 bg-luxury-black/80 p-5 backdrop-blur-md">
              <Sparkles className="mb-3 text-luxury-gold" size={20} />

              <p className="font-editorial text-lg text-luxury-ivory">
                Your next great read awaits.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <a
          href="#featured"
          aria-label="Scroll to featured books"
          className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 text-luxury-muted transition hover:text-luxury-gold md:block"
        >
          <ArrowDown size={20} />
        </a>
      </section>

      {/* ==================== SEARCH STRIP ==================== */}
      <section className="border-y border-white/10 bg-luxury-surface">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-5 px-5 py-8 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-12">
          <div>
            <p className="font-editorial text-2xl text-luxury-ivory">
              Looking for something specific?
            </p>

            <p className="mt-2 text-sm text-luxury-muted">
              Search by title, author, genre, or mood.
            </p>
          </div>

          <Link
            to="/books"
            className="inline-flex items-center justify-center gap-3 border border-luxury-gold/50 px-6 py-4 text-sm text-luxury-gold transition hover:bg-luxury-gold hover:text-luxury-black md:min-w-[220px]"
          >
            Discover Books
            <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      {/* ==================== FEATURED BOOKS ==================== */}
      <section
        id="featured"
        className="bg-luxury-ivory px-5 py-24 text-luxury-black sm:px-8 lg:px-12"
      >
        <div className="mx-auto max-w-[1440px]">
          {/* Section Heading */}
          <div className="mb-14 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-[#927545]">
                Carefully chosen
              </p>

              <h2 className="mt-4 font-editorial text-4xl sm:text-5xl lg:text-6xl">
                Books worth
                <br className="sm:hidden" /> your time.
              </h2>

              <p className="mt-4 max-w-lg text-sm leading-7 text-black/60">
                Thought-provoking reads selected for minds that
                never stop exploring.
              </p>
            </div>

            {/* View All Books */}
            <Link
              to="/books"
              className="inline-flex w-fit items-center gap-3 border-b border-black/30 pb-2 text-sm transition hover:border-black"
            >
              View all books
              <ArrowRight size={17} />
            </Link>
          </div>

          {/* Books Grid */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4 lg:gap-8">
            {featuredBooks.map((book, index) => (
              <motion.article
                key={book.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="group"
              >
                {/* Book Details Link */}
                <Link to={`/books/${book.id}`} className="block">
                  {/* ==================== BOOK COVER ==================== */}
                  <div
                    className="relative flex aspect-[3/4] items-center justify-center overflow-hidden p-4 transition duration-500 group-hover:shadow-xl sm:p-6"
                    style={{
                      backgroundColor: book.coverColor || '#151515',
                    }}
                  >
                    {/* Actual Designed Cover */}
                    <div
                      className="relative flex h-full w-full flex-col justify-between overflow-hidden border p-4 shadow-xl transition duration-700 group-hover:scale-[1.03] sm:p-6"
                      style={{
                        backgroundColor: book.coverColor || '#151515',
                        borderColor: `${book.coverAccent || '#C6A66B'}80`,
                        color: book.coverAccent || '#C6A66B',
                      }}
                    >
                      {/* Top Section */}
                      <div
                        className="border-t pt-3"
                        style={{
                          borderColor: `${book.coverAccent || '#C6A66B'}80`,
                        }}
                      >
                        <p className="text-[7px] uppercase tracking-[0.3em] sm:text-[9px]">
                          SmartBook Edition
                        </p>
                      </div>

                      {/* Book Title */}
                      <div className="relative z-10">
                        <h3
                          className="break-words font-editorial text-xl leading-tight sm:text-2xl lg:text-3xl"
                          style={{
                            color: book.coverAccent || '#C6A66B',
                          }}
                        >
                          {book.coverText || book.title}
                        </h3>

                        {/* Decorative Line */}
                        <div
                          className="mt-4 h-px w-8"
                          style={{
                            backgroundColor: book.coverAccent || '#C6A66B',
                          }}
                        />

                        {/* Author */}
                        <p className="mt-3 text-[8px] uppercase tracking-wider opacity-80 sm:text-[10px]">
                          {book.author}
                        </p>
                      </div>

                      {/* Bottom Section */}
                      <div>
                        <p className="text-[7px] uppercase tracking-[0.25em] opacity-70 sm:text-[9px]">
                          A story worth keeping
                        </p>
                      </div>

                      {/* Decorative Circle */}
                      <div
                        className="absolute -bottom-16 -right-16 h-40 w-40 rounded-full border opacity-10"
                        style={{
                          borderColor: book.coverAccent || '#C6A66B',
                        }}
                      />

                      <div
                        className="absolute -right-10 -top-10 h-28 w-28 rounded-full border opacity-10"
                        style={{
                          borderColor: book.coverAccent || '#C6A66B',
                        }}
                      />
                    </div>

                    {/* Book Badge */}
                    {book.badge && (
                      <span className="absolute left-3 top-3 bg-luxury-ivory px-3 py-2 text-[9px] uppercase tracking-wider text-luxury-black sm:text-[10px]">
                        {book.badge}
                      </span>
                    )}
                  </div>

                  {/* Book Information */}
                  <div className="pt-5">
                    <p className="text-[10px] uppercase tracking-[0.15em] text-[#927545]">
                      {book.category}
                    </p>

                    <h3 className="mt-2 font-editorial text-lg leading-snug sm:text-xl">
                      {book.title}
                    </h3>

                    <p className="mt-2 text-xs text-black/55">
                      {book.author}
                    </p>

                    {/* Price */}
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold">
                        ₹{book.price}
                      </p>

                      {book.originalPrice && (
                        <p className="text-xs text-black/40 line-through">
                          ₹{book.originalPrice}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== CATEGORIES ==================== */}
      <section className="bg-luxury-black px-5 py-24 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1440px]">
          {/* Heading */}
          <div className="mb-14">
            <p className="text-xs uppercase tracking-[0.25em] text-luxury-gold">
              Find your world
            </p>

            <h2 className="mt-4 font-editorial text-4xl text-luxury-ivory sm:text-5xl lg:text-6xl">
              Follow your curiosity.
            </h2>
          </div>

          {/* Category Grid */}
          <div className="grid border-l border-t border-white/10 sm:grid-cols-2">
            {categories.map((category) => (
              <Link
                key={category.number}
                to="/categories"
                className="group border-b border-r border-white/10 p-7 transition duration-300 hover:bg-luxury-surface sm:p-10 lg:p-12"
              >
                <div className="flex items-start justify-between">
                  <span className="text-xs tracking-widest text-luxury-gold">
                    {category.number}
                  </span>

                  <ArrowRight
                    size={20}
                    className="-translate-x-2 text-luxury-muted opacity-0 transition duration-300 group-hover:translate-x-0 group-hover:opacity-100 group-hover:text-luxury-gold"
                  />
                </div>

                <h3 className="mt-8 font-editorial text-2xl text-luxury-ivory sm:text-3xl">
                  {category.name}
                </h3>

                <p className="mt-3 text-sm text-luxury-muted">
                  {category.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== AI CONCIERGE ==================== */}
      <section className="px-5 pb-24 sm:px-8 lg:px-12">
        <div className="relative mx-auto max-w-[1440px] overflow-hidden border border-luxury-gold/25 bg-luxury-surface px-6 py-16 sm:px-12 lg:px-20 lg:py-20">
          {/* Background Glow */}
          <div className="absolute -right-20 -top-32 h-80 w-80 rounded-full bg-luxury-gold/10 blur-3xl" />

          <div className="relative grid items-center gap-10 lg:grid-cols-2">
            {/* Content */}
            <div>
              <div className="flex items-center gap-3">
                <Sparkles size={18} className="text-luxury-gold" />

                <p className="text-xs uppercase tracking-[0.25em] text-luxury-gold">
                  Meet your reading companion
                </p>
              </div>

              <h2 className="mt-6 max-w-2xl font-editorial text-4xl leading-tight text-luxury-ivory sm:text-5xl lg:text-6xl">
                Not sure what to read next?
              </h2>

              <p className="mt-6 max-w-xl text-sm leading-7 text-luxury-muted sm:text-base">
                Tell SmartBook what you enjoy, what you&apos;re curious about,
                or how you want a book to make you feel. Find recommendations
                that match your interests.
              </p>
            </div>

            {/* Button */}
            <div className="lg:justify-self-end">
              <Link
                to="/ai-concierge"
                className="inline-flex items-center gap-3 bg-luxury-gold px-7 py-4 text-sm font-semibold text-luxury-black transition hover:bg-luxury-ivory"
              >
                Discover with AI
                <ArrowRight size={18} />
              </Link>

              <p className="mt-4 text-xs text-luxury-muted">
                A more personal way to discover books.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}