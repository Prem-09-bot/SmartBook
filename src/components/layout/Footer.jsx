import { Link } from 'react-router-dom'

import {
  BookOpen,
  ArrowUpRight,
  Mail,
  MapPin,
  ArrowRight,
} from 'lucide-react'

const footerLinks = {
  Explore: [
    { name: 'Discover Books', path: '/books' },
    { name: 'Categories', path: '/categories' },
    { name: 'Bestsellers', path: '/books?sort=bestsellers' },
    { name: 'New Arrivals', path: '/books?sort=newest' },
  ],

  Account: [
    { name: 'My Account', path: '/login' },
    { name: 'My Wishlist', path: '/wishlist' },
    { name: 'Shopping Cart', path: '/cart' },
    { name: 'AI Concierge', path: '/ai-concierge' },
  ],

  Support: [
    { name: 'Contact Us', path: '/contact' },
    { name: 'FAQs', path: '/faq' },
    { name: 'Shipping Policy', path: '/shipping-policy' },
    { name: 'Privacy Policy', path: '/privacy-policy' },
  ],
}

const socialLinks = [
  {
    name: 'Instagram',
    url: 'https://www.instagram.com/',
    label: 'IG',
  },
  {
    name: 'Facebook',
    url: 'https://www.facebook.com/',
    label: 'FB',
  },
  {
    name: 'X',
    url: 'https://x.com/',
    label: 'X',
  },
]

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-white/10 bg-[#080809] text-[#f5f0e6]">

      {/* Main Footer */}
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-16 lg:px-10 lg:py-20">

        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-12 lg:gap-10">

          {/* Brand Section */}
          <div className="lg:col-span-4">

            <Link
              to="/"
              className="inline-flex items-center gap-3"
              aria-label="SmartBook Home"
            >
              <span className="flex h-11 w-11 items-center justify-center border border-[#c6a66b]/40 bg-[#c6a66b]/10 text-[#d4b779]">
                <BookOpen size={23} strokeWidth={1.6} />
              </span>

              <span className="font-serif text-2xl font-semibold tracking-wide">
                Smart
                <span className="text-[#c6a66b]">Book</span>
              </span>
            </Link>

            <p className="mt-6 max-w-sm text-sm leading-7 text-[#aaa69d]">
              A world of stories, ideas, and possibilities. Discover your
              next favourite book and let every page take you somewhere new.
            </p>

            {/* Social Media Links */}
            <div className="mt-6 flex items-center gap-3">

              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                  title={social.name}
                  className="flex h-10 w-10 items-center justify-center border border-white/10 text-xs font-semibold tracking-wide text-[#c6c2b9] transition-all duration-300 hover:border-[#c6a66b]/60 hover:bg-[#c6a66b]/10 hover:text-[#d4b779]"
                >
                  {social.label}
                </a>
              ))}

            </div>
          </div>

          {/* Footer Navigation */}
          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading} className="lg:col-span-2">

              <h3 className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-[#d4b779]">
                {heading}
              </h3>

              <ul className="space-y-4">

                {links.map((link) => (
                  <li key={link.name}>

                    <Link
                      to={link.path}
                      className="group inline-flex items-center gap-1 text-sm text-[#aaa69d] transition-colors duration-300 hover:text-[#f5f0e6]"
                    >
                      {link.name}

                      <ArrowUpRight
                        size={13}
                        className="opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      />
                    </Link>

                  </li>
                ))}

              </ul>
            </div>
          ))}

          {/* Newsletter Section */}
          <div className="sm:col-span-2 lg:col-span-12">

            <div className="grid grid-cols-1 gap-8 border-t border-white/10 pt-10 md:grid-cols-2 md:items-center">

              {/* Newsletter Information */}
              <div>

                <span className="text-xs font-medium uppercase tracking-[0.2em] text-[#c6a66b]">
                  The Reading List
                </span>

                <h3 className="mt-3 font-serif text-2xl leading-snug sm:text-3xl">
                  Good books.
                  <span className="text-[#c6a66b]">
                    {' '}Great discoveries.
                  </span>
                </h3>

                <p className="mt-3 max-w-md text-sm leading-6 text-[#aaa69d]">
                  Get reading recommendations, book discoveries, and updates
                  from the world of SmartBook.
                </p>

              </div>

              {/* Newsletter Form */}
              <form
                onSubmit={(event) => {
                  event.preventDefault()

                  alert(
                    'Newsletter subscription will be connected to the backend.'
                  )
                }}
                className="w-full"
              >

                <label
                  htmlFor="footer-email"
                  className="sr-only"
                >
                  Your email address
                </label>

                <div className="flex min-w-0 border border-white/15 bg-white/[0.03] transition-colors duration-300 focus-within:border-[#c6a66b]/70">

                  <span className="flex shrink-0 items-center pl-4 text-[#88847c]">
                    <Mail size={18} />
                  </span>

                  <input
                    id="footer-email"
                    type="email"
                    name="email"
                    placeholder="Enter your email address"
                    autoComplete="email"
                    required
                    className="min-w-0 flex-1 bg-transparent px-3 py-4 text-sm text-[#f5f0e6] outline-none placeholder:text-[#77736c]"
                  />

                  <button
                    type="submit"
                    aria-label="Subscribe to newsletter"
                    className="m-1 flex shrink-0 items-center justify-center gap-2 bg-[#c6a66b] px-4 py-3 text-sm font-semibold text-[#11100d] transition-colors duration-300 hover:bg-[#d8bb82] sm:px-5"
                  >
                    <span className="hidden sm:inline">
                      Subscribe
                    </span>

                    <ArrowRight size={17} />
                  </button>

                </div>

                <p className="mt-3 text-xs leading-5 text-[#77736c]">
                  By subscribing, you agree to receive updates from SmartBook.
                </p>

              </form>

            </div>
          </div>

        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">

        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-5 text-xs text-[#858179] sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10">

          <p>
            © {currentYear} SmartBook. All rights reserved.
          </p>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">

            <Link
              to="/privacy-policy"
              className="transition-colors duration-300 hover:text-[#d4b779]"
            >
              Privacy
            </Link>

            <Link
              to="/terms"
              className="transition-colors duration-300 hover:text-[#d4b779]"
            >
              Terms
            </Link>

            <span className="flex items-center gap-2">
              <MapPin
                size={13}
                className="text-[#c6a66b]"
              />

              Made for book lovers
            </span>

          </div>
        </div>
      </div>

    </footer>
  )
}