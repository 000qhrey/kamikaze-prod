import { Metadata } from 'next'
import { ScrambleText } from '@/components/effects/ScrambleText'
import { PerspectiveGrid } from '@/components/canvas/PerspectiveGrid'

export const metadata: Metadata = {
  title: 'PRIVACY POLICY | KAMIKAZE',
  description: 'Privacy policy and data handling practices for KAMIKAZE collective.',
}

const POLICY_SECTIONS = [
  {
    id: 'data_collection',
    title: 'DATA_COLLECTION',
    content: [
      'We collect minimal data necessary to operate our services:',
      '- Contact form submissions (name, email, message)',
      '- Newsletter subscriptions (email address only)',
      '- Event ticket purchases (processed by third-party providers)',
      '- Basic analytics (page views, device type - anonymized)',
    ],
  },
  {
    id: 'data_usage',
    title: 'DATA_USAGE',
    content: [
      'Your data is used exclusively for:',
      '- Responding to your inquiries',
      '- Sending event announcements (if subscribed)',
      '- Processing ticket purchases',
      '- Improving our website experience',
      'We never sell your data. Period.',
    ],
  },
  {
    id: 'data_storage',
    title: 'DATA_STORAGE',
    content: [
      'Data is stored securely using industry-standard encryption.',
      'We retain data only as long as necessary for the stated purposes.',
      'Contact form data: Deleted after 12 months of inactivity.',
      'Newsletter subscriptions: Until you unsubscribe.',
    ],
  },
  {
    id: 'third_parties',
    title: 'THIRD_PARTY_SERVICES',
    content: [
      'We use the following third-party services:',
      '- Resend (email delivery)',
      '- Vercel (website hosting)',
      '- Ticket providers (for event sales)',
      'Each service has their own privacy policy. We select partners who respect user privacy.',
    ],
  },
  {
    id: 'cookies',
    title: 'COOKIES',
    content: [
      'We use minimal cookies:',
      '- Essential cookies for site functionality',
      '- No tracking cookies',
      '- No advertising cookies',
      '- No third-party analytics that track individuals',
    ],
  },
  {
    id: 'your_rights',
    title: 'YOUR_RIGHTS',
    content: [
      'You have the right to:',
      '- Access your personal data',
      '- Request data deletion',
      '- Unsubscribe from communications',
      '- Lodge a complaint with supervisory authorities',
      'Contact enter@kamikaze.host for any requests.',
    ],
  },
  {
    id: 'updates',
    title: 'POLICY_UPDATES',
    content: [
      'This policy may be updated periodically.',
      'Last updated: April 2026',
      'Material changes will be announced via our channels.',
    ],
  },
]

export default function PrivacyPage() {
  return (
    <div className="relative min-h-screen flex flex-col pt-24 pb-16">
      <div className="relative z-10 max-w-3xl mx-auto px-6">
        {/* Header */}
        <header className="mb-12">
          <span className="font-mono text-xs text-arterial/60 tracking-[0.4em] block mb-2">
            {'>>>'} LEGAL_PROTOCOL
          </span>
          <ScrambleText
            className="font-display text-4xl md:text-6xl tracking-wider mb-4 block"
            triggerOnView
            triggerOnHover={false}
            duration={600}
          >
            [PRIVACY]
          </ScrambleText>
          <p className="font-mono text-sm text-white/60">
            Your data. Your rights. No bullshit.
          </p>
        </header>

        {/* Policy Sections */}
        <div className="space-y-12">
          {POLICY_SECTIONS.map((section, index) => (
            <section
              key={section.id}
              className="relative border-l-2 border-arterial/30 pl-6 hover:border-arterial/60 transition-colors duration-300"
            >
              {/* Section number */}
              <span className="absolute -left-3 top-0 w-6 h-6 bg-void border border-arterial/50 flex items-center justify-center font-mono text-[10px] text-arterial">
                {String(index + 1).padStart(2, '0')}
              </span>

              <h2 className="font-mono text-sm text-arterial tracking-[0.3em] mb-4">
                [{section.title}]
              </h2>

              <div className="space-y-2">
                {section.content.map((line, lineIndex) => (
                  <p
                    key={lineIndex}
                    className={`font-mono text-sm leading-relaxed ${
                      line.startsWith('-')
                        ? 'text-white/70 pl-4'
                        : 'text-white/80'
                    }`}
                  >
                    {line}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Footer note */}
        <div className="mt-16 pt-8 border-t border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-2 h-2 bg-signal animate-pulse" />
            <span className="font-mono text-xs text-signal tracking-[0.3em]">
              ENCRYPTION_ACTIVE
            </span>
          </div>
          <p className="font-mono text-xs text-white/50 leading-relaxed">
            Questions about your data? Contact us at{' '}
            <a
              href="mailto:enter@kamikaze.host"
              className="text-arterial hover:text-white transition-colors"
            >
              enter@kamikaze.host
            </a>
          </p>
        </div>
      </div>

      <PerspectiveGrid />
    </div>
  )
}
