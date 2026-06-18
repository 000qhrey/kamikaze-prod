/**
 * User-facing copy — plain language for navigation, headers, and CTAs.
 * Keep atmosphere in manifesto body text; labels should be immediately understood.
 */

export const NAV_LINKS = [
  { href: '/', label: 'HOME' },
  { href: '/events', label: 'EVENTS' },
  { href: '/artists', label: 'ARTISTS' },
  { href: '/about', label: 'ABOUT' },
  { href: '/merch', label: 'MERCH' },
  { href: '/contact', label: 'CONTACT' },
] as const

export const FOOTER_NAV = NAV_LINKS

export const META = {
  artists: {
    title: 'ARTISTS | KAMIKAZE',
    description: 'Submit your demo. We listen to every SoundCloud link.',
  },
  about: {
    title: 'ABOUT | KAMIKAZE',
    description:
      'How KAMIKAZE started in Kerala — independent techno events built for the dancefloor.',
  },
  events: {
    title: 'EVENTS | KAMIKAZE',
    description: 'Upcoming techno nights and past events from KAMIKAZE.',
  },
  contact: {
    title: 'CONTACT | KAMIKAZE',
    description: 'Bookings, general inquiries, and demo follow-ups.',
  },
  merch: {
    title: 'MERCH | KAMIKAZE',
    description: 'Limited drops from KAMIKAZE. Join the waitlist.',
  },
} as const

export const HERO = {
  tagline: 'THE ROOM IS THE HEADLINER',
  valueProp: 'Independent techno events. Artists we believe in. Everyone in the same room.',
  scrollCta: 'SCROLL TO EXPLORE',
} as const

export const EVENTS = {
  pageTitle: 'EVENTS',
  tagline: 'Nights we\'re building. Past ones live in the archive.',
  upcoming: 'UPCOMING EVENTS',
  past: 'PAST EVENTS',
  viewDetails: 'VIEW DETAILS',
  close: 'CLOSE',
  getTickets: 'GET TICKETS',
  loadingDetails: 'LOADING DETAILS...',
  detailsUnlocked: (percent: number) => `Details unlocked: ${percent}%`,
  location: 'Location',
  lineup: 'Lineup',
  accessDenied: 'SOLD OUT',
  detailsHidden: 'Details: Tap to view',
  locationTba: 'Location: TBA',
  statusLimited: 'Status: More info soon',
  ticketsLimited: 'Tickets: Limited',
  emptySearching: 'Searching archive...',
  emptyStatus: 'No past events yet',
  emptyMessage: 'Past events will appear here after they happen.',
  emptyPrompt: 'Waiting for the first event',
} as const

export const ARTISTS = {
  pageTitle: 'ARTISTS',
  subtitle: 'Send us your best work. SoundCloud links only.',
  divider: 'We review every demo. No guarantees — just an honest listen.',
  footerNote:
    'Keep it unreleased if you can. Tell us your city. If it fits a night we\'re building, we\'ll reach out.',
  uploadSection: 'SUBMIT YOUR MUSIC',
  uploadButton: 'UPLOAD DEMO',
  uploadSuccess: 'Demo received. We will be in touch.',
  networkTitle: 'ARTISTS',
  networkSubtitle: 'Open submissions. No hierarchy.',
  networkDivider: 'No idols. Just the music.',
  activeList: 'SUBMITTED DEMOS',
  feedLabel: 'DEMO_FEED // LIVE',
  loadingConnection: 'Loading...',
  noResults: 'No demos in this genre yet.',
  awaiting: 'Waiting for new submissions...',
  filterTitle: 'FILTER BY GENRE',
  currentFilter: 'CURRENT FILTER:',
  allGenres: 'ALL GENRES',
  filterHint: 'Drag to filter by genre',
} as const

export const ARTIST_DETAIL = {
  bio: 'BIO',
  mixes: 'MIXES',
  links: 'LINKS',
  available: 'AVAILABLE',
  size: 'SIZE',
  duration: 'DUR',
  source: 'SRC',
  status: 'STATUS',
} as const

export const ABOUT = {
  pageTitle: 'ABOUT',
  subtitle: 'How we started, and what we stand for.',
  clearance: 'EST. 2026 · KERALA, INDIA',
  ctaPrompt: 'Think you fit the room?',
  ctaButton: 'SUBMIT YOUR MUSIC',
  loading: 'Loading...',
  attribution: '— KAMIKAZE COLLECTIVE // EST. 2026',
  texturePhrase: 'SOUND FIRST',
} as const

export type StoryBlockType = 'heading' | 'body' | 'emphasis' | 'spacer'

export interface StoryBlock {
  type: StoryBlockType
  text: string
}

export const ABOUT_STORY: StoryBlock[] = [
  { type: 'heading', text: 'WE STARTED WITH A COMPLAINT.' },
  { type: 'body', text: '' },
  {
    type: 'body',
    text: 'KAMIKAZE began the way most underground scenes do — a few friends at the same parties, tired of the same problems. Bottle service creeping in. Lineups built for photos, not the floor. Nights that felt more like networking than dancing.',
  },
  {
    type: 'body',
    text: 'In 2026 we stopped waiting for someone else to fix it. We started throwing the rave we actually wanted to attend.',
  },
  { type: 'body', text: '' },
  { type: 'heading', text: 'WHAT WE DO.' },
  { type: 'body', text: '' },
  {
    type: 'body',
    text: 'We produce independent techno events — rooted in Kerala, open to artists who match the energy. We book DJs we rate, not names we were paid to push. We take demos through the site and we listen.',
  },
  {
    type: 'body',
    text: 'Every night is curated, not crowded. Smaller rooms. Harder sound. A crowd that came to move.',
  },
  { type: 'body', text: '' },
  { type: 'heading', text: 'WHAT WE WON\'T DO.' },
  { type: 'body', text: '' },
  {
    type: 'body',
    text: 'We don\'t run VIP tables or backstage hierarchies. One ticket gets you the same floor as everyone else. If you\'ve seen that warning in our footer — that\'s not marketing. That\'s the rule.',
  },
  { type: 'body', text: '' },
  { type: 'emphasis', text: 'The underground was never about names.' },
  { type: 'emphasis', text: 'It was always about what happens when the bass locks and the room becomes one thing.' },
  { type: 'body', text: '' },
  {
    type: 'body',
    text: 'We\'re not a label. We\'re not an agency. We\'re a crew that cares about the room — and we\'re just getting started.',
  },
]

export const CONTACT = {
  pageTitle: 'CONTACT',
  pageTitleHover: 'REACH US',
  eyebrow: 'Get in touch',
  intro: 'Bookings, questions, collabs — pick a channel below or send a message.',
  formSection: 'SEND A MESSAGE',
  statusOpen: 'Contact info below',
  statusHover: 'Connected',
  messageSentBody: 'Your message has been received. We will get back to you soon.',
  sendFailed: 'Could not send your message. Please try again.',
  systemOffline: 'Contact form is temporarily unavailable.',
} as const

export const MERCH = {
  pageTitle: 'MERCH',
  vaultTitle: 'MERCH',
  vaultSubtitle: 'Limited drops. Join the waitlist for early access.',
  finalSale: 'All items final sale. No returns or exchanges.',
  waitlistTitle: 'JOIN THE WAITLIST',
  waitlistSubtitle: 'Get notified when the next drop goes live.',
  emailLabel: 'Email',
  emailPlaceholder: 'you@email.com',
  waitlistSuccess: 'You are on the list.',
  waitlistAlready: 'This email is already on the waitlist.',
  invalidEmail: 'Please enter a valid email address.',
  systemOffline: 'Sign-up is temporarily unavailable. Try again later.',
  submitError: 'Something went wrong. Please try again.',
  bindDifferent: 'Use a different email',
  priorityNote: 'Waitlist members get notified first.',
  rating: 'RATING',
  addedToCart: 'ADDED TO CART',
  addToCart: 'ADD TO CART',
  soldOut: 'SOLD OUT',
  finalSaleNote: 'All sales final. No returns or exchanges.',
  selectSize: 'SELECT SIZE:',
  sizeGuide: 'SIZE GUIDE',
  shippingFee: 'SHIPPING:',
  secureCheckout: 'Secure checkout via Stripe. All sales final.',
  checkout: 'CHECKOUT',
  comingSoonHover: 'COMING SOON',
  itemLabel: (index: number) => `ITEM_${String(index + 1).padStart(3, '0')}`,
} as const

export const AUDIO = {
  playerLabel: 'MUSIC',
  pressPlay: 'PRESS PLAY FOR MUSIC',
  selectChannel: 'Choose a playlist',
} as const

export const EVENT_HINT = {
  panelTitle: 'INCOMING CLUE',
  dismiss: 'CLOSE',
  riddle1: 'They built a convention dome where the Arabian Sea meets the Western Ghats.',
  riddle2: 'The city wears a longer name — locals shorten it to three syllables.',
  riddle3: 'Month locked: IX · Year: MMXXVI · Day: still sealed.',
  riddle4: 'Venue coordinates remain redacted until T−48.',
  monthFound: 'Fragment recovered: September 2026',
  locationHidden: 'City name encrypted on the Events page.',
  cta: 'DECRYPT ON EVENTS PAGE',
  footer: 'Tap KAMIKAZE OVERRIDE and view details to unlock the city.',
} as const

export const ABOUT_HOME = {
  eyebrow: 'WHO WE ARE',
  title: 'WE THROW THE NIGHTS WE WISH EXISTED',
  body: 'A small collective from Kerala building honest techno parties — fair doors, real lineups, and a dancefloor that matters more than the guest list.',
  pillars: [
    {
      label: 'EVENTS',
      text: 'Upcoming nights, lineups, and tickets.',
      href: '/events',
    },
    {
      label: 'ARTISTS',
      text: 'Send a demo. We listen to every submission.',
      href: '/artists',
    },
    {
      label: 'OUR STORY',
      text: 'How we started and what we refuse to compromise on.',
      href: '/about',
    },
  ],
  cta: 'READ THE FULL STORY',
  ctaHref: '/about',
} as const

export const BOOT = {
  fastResume: '[ WELCOME BACK ]',
  fastCorner: 'RETURNING VISITOR',
} as const
