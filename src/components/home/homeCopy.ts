/**
 * Homepage copy — Japanese primary, English secondary.
 *
 * Every string that varies with the FLAVOUR toggle lives here as a
 * `{ jp, en }` pair so the layout has one source of truth.
 *
 * Japanese phrasing is intentionally short and blunt — matches the
 * underground-collective voice we already use in English. Latin brand
 * names (KAMIKAZE, SHADOW CIRCUIT, OBSCURE / NEXUS / BFFERD / VANTA)
 * are left untranslated per the reference designs.
 */

import type { FlavourPair } from '@/providers/FlavourProvider'

export const HOME_COPY = {
  topbar: {
    collective: { jp: 'テクノ集団', en: 'TECHNO COLLECTIVE' },
    city: { jp: 'チェンナイ', en: 'CHENNAI' },
    menu: { jp: 'メニュー', en: 'MENU' },
  },

  hero: {
    kanjiStack: { jp: '神風\nテクノ\n集団', en: 'KAMI KAZE / TECHNO / COLLECTIVE' },
    tagline: {
      jp: 'イベントではない、\n瞬間を築く。',
      en: "WE DON'T THROW EVENTS.\nWE BUILD MOMENTS.",
    },
    enter: { jp: '信号を受信 →', en: 'ENTER THE SIGNAL →' },
    est: { jp: '創立 2026', en: 'EST. 2026' },
    scroll: { jp: 'スクロール', en: 'SCROLL' },
    coordsCity: { jp: 'チェンナイ / タミルナードゥ / インド', en: 'CHENNAI / TN / IN' },
    tuneIn: { jp: '周波数を合わせろ。信号に入れ。', en: 'TUNE IN. ENTER THE SIGNAL.' },
  },

  about: {
    number: { jp: '章', en: 'ACT' },
    label: { jp: '集団について', en: 'ABOUT THE COLLECTIVE' },
    heading: {
      jp: '集団について',
      en: 'ABOUT THE COLLECTIVE',
    },
    body: {
      jp: '私たちはサウンド、スペース、\nエネルギーを通して地下文化を\n増幅するために集まった。',
      en: 'We came together to amplify\nunderground culture through\nsound, space, and energy.',
    },
    cta: { jp: 'マニフェストを読む →', en: 'READ THE MANIFESTO →' },
    caption: { jp: '図 01 — 未公開の部屋', en: 'FIG. 01 — UNDISCLOSED ROOM' },
    frequency: { jp: '周波数に入る', en: 'ENTER THE FREQUENCY' },
  },

  event: {
    number: { jp: '章', en: 'ACT' },
    label: { jp: '次のイベント', en: 'NEXT EVENT' },
    name: { jp: 'SHADOW CIRCUIT', en: 'SHADOW CIRCUIT' },
    date: { jp: '22 — 06 — 26', en: '22 — 06 — 26' },
    location: { jp: '場所未定', en: 'LOCATION TBA' },
    cta: { jp: '詳細を見る →', en: 'VIEW DETAILS →' },
    caption: { jp: '図 02 — テストフロア', en: 'FIG. 02 — TEST FLOOR' },
    status: { jp: '一夜、一部屋', en: 'ONE NIGHT · ONE ROOM' },
    upcoming: { jp: '次回', en: 'UPCOMING' },
  },

  residents: {
    number: { jp: '章', en: 'ACT' },
    label: { jp: 'レジデント', en: 'RESIDENTS' },
    heading: { jp: '四つの名前。\n一つの部屋。', en: 'FOUR NAMES.\nONE ROOM.' },
    viewAll: { jp: '全員を見る →', en: 'VIEW ALL →' },
    role: (n: number): FlavourPair => ({
      jp: `レジデント・${String(n).padStart(3, '0')}`,
      en: `RESIDENT · ${String(n).padStart(3, '0')}`,
    }),
  },

  sigil: {
    number: { jp: '章', en: 'ACT' },
    label: { jp: '印', en: 'SIGIL' },
    heading: {
      jp: 'サウンドは自由。\n沈黙は自由ではない。',
      en: 'SOUND IS FREEDOM.\nSILENCE IS NOT.',
    },
    caption: { jp: '神風 / 二〇二六', en: 'KAMIKAZE / MMXXVI' },
  },

  footer: {
    flavourLabel: { jp: 'フレーバー', en: 'FLAVOUR' },
    joinPrompt: { jp: '周波数に参加する。', en: 'JOIN THE FREQUENCY.' },
    emailPlaceholder: { jp: 'メールアドレス', en: 'ENTER EMAIL' },
    events: { jp: 'イベント', en: 'EVENTS' },
    collective: { jp: '集団', en: 'COLLECTIVE' },
    archive: { jp: 'アーカイブ', en: 'ARCHIVE' },
    contact: { jp: '連絡', en: 'CONTACT' },
    stayUnderground: { jp: '地下に留まれ', en: 'STAY UNDERGROUND' },
  },

  motto: {
    marquee: {
      jp: '[!] 警告：VIPなし。バックステージなし。一つの魂。一つのチケット。一つの部屋。',
      en: '[!] WARNING: NO VIP. NO BACKSTAGE. ONE SOUL. ONE TICKET. ONE ROOM.',
    },
  },
} as const

/** Latin brand words that never translate — kept here for clarity. */
export const CONSTANT = {
  wordmark: 'KAMIKAZE',
  brushKanji: ['神', '風'] as const,
  eventName: 'SHADOW CIRCUIT',
  eventDate: '22 — 06 — 26',
  coords: { lat: '13.0827° N', lon: '80.2707° E' },
  residents: [
    { name: 'OBSCURE', handle: '@0BSCURE', href: '/artists/obscure' },
    { name: 'NEXUS', handle: '@N3XUS', href: '/artists/nexus' },
    { name: 'BFFERD', handle: '@BFFERD', href: '/artists/bfferd' },
    { name: 'VANTA', handle: '@V4NTA', href: '/artists/vanta' },
  ],
} as const
