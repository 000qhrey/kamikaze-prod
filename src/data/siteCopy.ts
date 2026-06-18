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
    description: 'Submit your music. Underground techno collective.',
  },
  about: {
    title: 'ABOUT | KAMIKAZE',
    description:
      'We are not here to build idols. We are here to amplify sound. Underground techno events.',
  },
  events: {
    title: 'EVENTS | KAMIKAZE',
    description: 'Upcoming and past underground techno events from KAMIKAZE.',
  },
  contact: {
    title: 'CONTACT | KAMIKAZE',
    description: 'Get in touch with KAMIKAZE — bookings, general inquiries, and more.',
  },
  merch: {
    title: 'MERCH | KAMIKAZE',
    description: 'Official KAMIKAZE merchandise.',
  },
} as const

export const HERO = {
  tagline: 'UNDERGROUND WILL NEVER DIE',
  valueProp: 'Underground techno events. Curated nights. No VIP. No idols.',
  scrollCta: 'SCROLL TO EXPLORE',
} as const

export const EVENTS = {
  pageTitle: 'EVENTS',
  tagline: 'Underground techno nights.',
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
  subtitle: 'Submit your demo. We are always listening.',
  divider: 'No headliners. Just the music.',
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
  subtitle: 'Who we are and what we stand for.',
  clearance: 'Open to everyone',
  ctaPrompt: 'Want to play with us?',
  ctaButton: 'SUBMIT YOUR MUSIC',
  loading: 'Loading...',
} as const

export const CONTACT = {
  pageTitle: 'CONTACT',
  pageTitleHover: 'REACH US',
  eyebrow: 'Get in touch',
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
  title: 'UNDERGROUND TECHNO COLLECTIVE',
  body: 'KAMIKAZE curates raw, uncompromising nights — no VIP lists, no idols, no corporate gloss. We book artists we believe in, build community on the dancefloor, and keep the underground alive.',
  pillars: [
    { label: 'EVENTS', text: 'Curated raves with real lineups and fair access.' },
    { label: 'ARTISTS', text: 'Open demos — we listen to everyone.' },
    { label: 'CULTURE', text: 'One floor. One ticket. One congregation.' },
  ],
  cta: 'READ OUR FULL STORY',
  ctaHref: '/about',
} as const

export const BOOT = {
  fastResume: '[ WELCOME BACK ]',
  fastCorner: 'RETURNING VISITOR',
} as const
