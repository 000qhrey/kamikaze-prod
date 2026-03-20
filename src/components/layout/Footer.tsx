'use client'

import { contactInfo } from '@/data/moto'

export function Footer() {
  return (
    <footer className="py-8 px-6 border-t border-grey-dark">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="font-mono text-xs text-grey-mid">
          &copy; {new Date().getFullYear()} KAMIKAZE. ALL RIGHTS RESERVED.
        </div>
        <div className="flex items-center gap-6">
          <a
            href={`mailto:${contactInfo.email}`}
            className="font-mono text-xs text-grey-mid hover:text-white transition-colors"
          >
            {contactInfo.email}
          </a>
          <a
            href={contactInfo.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs text-grey-mid hover:text-white transition-colors"
          >
            {contactInfo.instagram}
          </a>
        </div>
      </div>
    </footer>
  )
}
