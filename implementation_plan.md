# KAMIKAZE - Implementation Blueprint

> Dark cybersigilism rave label website. Biomechanical. Corrupted. Alive.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [File Structure](#file-structure)
4. [Design System](#design-system)
5. [Core Animation Systems](#core-animation-systems)
6. [Global Components](#global-components)
7. [Page Specifications](#page-specifications)
8. [Performance Optimization](#performance-optimization)
9. [Implementation Order](#implementation-order)
10. [Asset Requirements](#asset-requirements)

---

## Project Overview

### Purpose
Five-page dark underground rave label website for Kamikaze. Pages: Home, Events, Artists, Moto, Contact.

### Aesthetic
Dark cybersigilism — biomechanical, corrupted, organism-like. The site feels alive, broken, dangerous. Reference energy: teletech.events but more organic and violent.

### Core Visual Identity
- The PNG sequence sigil animation is the ONLY source of colour (gold, teal, purple, red)
- Everything else: black, white, grey
- No gradients, neons, pastels, or blues anywhere except the sigil

---

## Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Framework | Next.js 14 (App Router) | SSR, routing, image optimization |
| Language | TypeScript | Type safety |
| Styling | Tailwind CSS + raw CSS | Layout + custom effects |
| Animation | GSAP + ScrollTrigger | Scroll and text animations |
| Smooth Scroll | Lenis.js (@studio-freight/lenis) | Inertia scrolling |
| Canvas | Native Canvas API | PNG sequence, pixel dissolve, cursor trail |
| Fonts | MedievalSharp + Space Mono | Self-hosted from Google Fonts |

### Package Dependencies

```json
{
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "gsap": "^3.12.0",
    "@studio-freight/lenis": "^1.0.0"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "@types/react": "^18.3.0",
    "@types/node": "^20.0.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0"
  }
}
```

---

## File Structure

```
kamikaze/
├── public/
│   ├── sequence/                    # PNG frames 1.png - 120.png (EXISTS)
│   ├── sigil-static.png             # Static sigil for nav/cursor (NEED)
│   ├── sigil-tendrils.svg           # Corner tendril decorations (NEED)
│   ├── cursor-crosshair.svg         # Custom cursor (GENERATE)
│   ├── cursor-sigil.png             # Hover cursor 40px (GENERATE)
│   ├── drip.svg                     # Nav active indicator (GENERATE)
│   └── fonts/
│       ├── MedievalSharp-Regular.woff2
│       └── SpaceMono-Regular.woff2
│
├── src/
│   ├── app/
│   │   ├── layout.tsx               # Root layout with providers
│   │   ├── page.tsx                 # Home page
│   │   ├── events/
│   │   │   └── page.tsx             # Events listing
│   │   ├── artists/
│   │   │   ├── page.tsx             # Artists grid
│   │   │   └── [slug]/
│   │   │       └── page.tsx         # Individual artist
│   │   ├── moto/
│   │   │   └── page.tsx             # Manifesto scroll-snap
│   │   └── contact/
│   │       └── page.tsx             # Contact constellation
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navigation.tsx       # Fixed nav with sigil
│   │   │   ├── MobileNav.tsx        # Fullscreen mobile overlay
│   │   │   └── Footer.tsx           # Minimal footer
│   │   │
│   │   ├── canvas/
│   │   │   ├── SigilAnimation.tsx   # PNG sequence player
│   │   │   ├── PixelTransition.tsx  # Page transition overlay
│   │   │   ├── CursorTrail.tsx      # Red smear cursor effect
│   │   │   ├── FilmGrain.tsx        # Noise overlay
│   │   │   └── PerspectiveGrid.tsx  # Floor grid effect
│   │   │
│   │   ├── effects/
│   │   │   ├── GlitchSlice.tsx      # Entry animation wrapper
│   │   │   ├── ScrambleText.tsx     # Character scramble effect
│   │   │   ├── BurnIn.tsx           # Text burn/brand effect
│   │   │   ├── TypewriterText.tsx   # Character-by-character reveal
│   │   │   └── LetterBurn.tsx       # Individual letter flash entry
│   │   │
│   │   ├── ui/
│   │   │   ├── JaggedCard.tsx       # Irregular clip-path card
│   │   │   ├── ScrollIndicator.tsx  # Blood-fill scroll progress
│   │   │   ├── TerminalButton.tsx   # > COMMAND_ style button
│   │   │   ├── TornInput.tsx        # Irregular border input
│   │   │   └── AudioPlayer.tsx      # Dark custom audio player
│   │   │
│   │   ├── home/
│   │   │   ├── Hero.tsx             # Sigil + title + tagline
│   │   │   ├── Manifesto.tsx        # Label statement section
│   │   │   └── TeaseCards.tsx       # Preview cards grid
│   │   │
│   │   ├── events/
│   │   │   ├── EventCard.tsx        # Terminal-style event card
│   │   │   └── PastEventCard.tsx    # Desaturated + scanlines
│   │   │
│   │   ├── artists/
│   │   │   ├── ArtistTile.tsx       # Grid tile with tendril overlay
│   │   │   └── ArtistHeader.tsx     # Full-width artist hero
│   │   │
│   │   ├── moto/
│   │   │   └── MotoPanel.tsx        # Scroll-snap panel
│   │   │
│   │   └── contact/
│   │       ├── ContactConstellation.tsx  # Radiating contact info
│   │       └── ContactForm.tsx      # Torn input form
│   │
│   ├── hooks/
│   │   ├── useImagePreloader.ts     # Preload PNG sequence
│   │   ├── useSigilAnimation.ts     # Canvas playback control
│   │   ├── usePixelDissolve.ts      # Transition capture/animate
│   │   ├── useLenis.ts              # Smooth scroll setup
│   │   ├── useScrollProgress.ts     # 0-1 scroll position
│   │   ├── useInView.ts             # Intersection observer
│   │   └── useGSAP.ts               # GSAP context cleanup
│   │
│   ├── lib/
│   │   ├── canvas/
│   │   │   ├── pixelDissolve.ts     # Pixel block shatter logic
│   │   │   ├── sigilPlayer.ts       # Frame sequence renderer
│   │   │   ├── cursorTrail.ts       # Red smear renderer
│   │   │   └── filmGrain.ts         # Noise generator
│   │   │
│   │   ├── animations/
│   │   │   ├── glitchSlice.ts       # Horizontal band offset
│   │   │   ├── scrambleText.ts      # Character randomizer
│   │   │   └── burnIn.ts            # White bloom -> settle
│   │   │
│   │   └── utils/
│   │       ├── clipPath.ts          # Jagged polygon generator
│   │       └── easing.ts            # Custom easing functions
│   │
│   ├── providers/
│   │   ├── TransitionProvider.tsx   # Page transition context
│   │   ├── LenisProvider.tsx        # Smooth scroll context
│   │   └── CursorProvider.tsx       # Custom cursor context
│   │
│   ├── styles/
│   │   ├── globals.css              # Base styles, fonts, cursor
│   │   ├── effects.css              # Scanlines, grain overlays
│   │   └── clip-paths.css           # Jagged border definitions
│   │
│   └── data/
│       ├── events.ts                # Event data
│       ├── artists.ts               # Artist data
│       └── moto.ts                  # Manifesto statements
│
├── tailwind.config.ts
├── next.config.js
├── tsconfig.json
└── package.json
```

---

## Design System

### Colour Palette

```css
:root {
  /* Core */
  --black: #000000;           /* Background - pure black */
  --white: #EFEFEF;           /* Text primary - bone white */
  --grey-dark: #1A1A1A;       /* UI lines, borders */
  --grey-mid: #333333;        /* Subtle elements */

  /* Accent - ONLY for interactions */
  --red-dark: #8B0000;        /* Deep blood */
  --red-bright: #CC0000;      /* Active states */

  /* Sigil colours (reference only - live in PNG frames) */
  --sigil-gold: #D4AF37;
  --sigil-teal: #008080;
  --sigil-purple: #800080;
  --sigil-red: #CC0000;
}
```

### Typography

```css
/* Display - Blackletter */
@font-face {
  font-family: 'MedievalSharp';
  src: url('/fonts/MedievalSharp-Regular.woff2') format('woff2');
  font-display: swap;
}

/* Body - Monospace */
@font-face {
  font-family: 'Space Mono';
  src: url('/fonts/SpaceMono-Regular.woff2') format('woff2');
  font-display: swap;
}

.font-display {
  font-family: 'MedievalSharp', cursive;
  -webkit-font-smoothing: none;
  -moz-osx-font-smoothing: unset;
  text-rendering: geometricPrecision;
}

.font-mono {
  font-family: 'Space Mono', monospace;
  -webkit-font-smoothing: none;
}
```

### Tailwind Configuration

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        black: '#000000',
        white: '#EFEFEF',
        grey: {
          dark: '#1A1A1A',
          mid: '#333333',
        },
        red: {
          dark: '#8B0000',
          bright: '#CC0000',
        },
      },
      fontFamily: {
        display: ['MedievalSharp', 'cursive'],
        mono: ['Space Mono', 'monospace'],
      },
      letterSpacing: {
        wider: '0.15em',
        widest: '0.3em',
      },
      animation: {
        'slow-rotate': 'rotate 40s linear infinite',
        'fast-rotate': 'rotate 3s linear infinite',
        'drift': 'drift 60s ease-in-out infinite',
        'grain': 'grain 50ms steps(1) infinite',
      },
      keyframes: {
        rotate: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        drift: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '50%': { transform: 'translate(20px, 10px)' },
        },
        grain: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '10%': { transform: 'translate(-1%, -1%)' },
          '20%': { transform: 'translate(1%, 1%)' },
          '30%': { transform: 'translate(-1%, 1%)' },
          '40%': { transform: 'translate(1%, -1%)' },
          '50%': { transform: 'translate(-1%, 0)' },
          '60%': { transform: 'translate(1%, 0)' },
          '70%': { transform: 'translate(0, -1%)' },
          '80%': { transform: 'translate(0, 1%)' },
          '90%': { transform: 'translate(-1%, -1%)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
```

---

## Core Animation Systems

### 1. PNG Sequence Player (Sigil Animation)

**Location**: `src/lib/canvas/sigilPlayer.ts`

```typescript
interface SigilPlayerConfig {
  canvas: HTMLCanvasElement
  frames: HTMLImageElement[]
  fps: number              // Default: 24
  loop: boolean            // Default: true
}

class SigilPlayer {
  private frameIndex: number = 0
  private lastFrameTime: number = 0
  private isPlaying: boolean = false

  constructor(config: SigilPlayerConfig)

  play(): void
  pause(): void
  setFPS(fps: number): void  // For hover speed change
  dispose(): void
}
```

**Implementation Notes**:
- Preload all 120 frames into `HTMLImageElement[]` array on mount
- Use `requestAnimationFrame` loop with time-based frame advancement
- Frame interval: `1000 / fps` milliseconds
- At 24fps with 120 frames = 5 second loop (matches "slow breathing pulse" spec)
- Canvas `drawImage` for each frame, clearing previous

**Hook**: `src/hooks/useSigilAnimation.ts`

```typescript
function useSigilAnimation(canvasRef: RefObject<HTMLCanvasElement>) {
  const [isHovering, setIsHovering] = useState(false)
  const playerRef = useRef<SigilPlayer | null>(null)

  // Preload frames
  // Initialize player
  // Handle hover state -> setFPS(isHovering ? 40 : 24)

  return { setIsHovering, isLoaded }
}
```

### 2. Pixel Dissolve Transition

**Location**: `src/lib/canvas/pixelDissolve.ts`

This is the signature page transition effect. Every navigation triggers:
1. Current page shatters into 32x32px blocks
2. Blocks scatter with random velocity/rotation over 400ms
3. Black screen with 2-frame sigil flash (80% opacity, ~83ms)
4. New page assembles from blocks flying in from opposite directions over 400ms

**Implementation**:

```typescript
interface PixelBlock {
  x: number              // Current position
  y: number
  originX: number        // Starting position
  originY: number
  targetX: number        // Final position (for assembly)
  targetY: number
  vx: number             // Velocity
  vy: number
  rotation: number
  rotationSpeed: number
  imageData: ImageData   // 32x32 pixel data
}

class PixelDissolveTransition {
  private blocks: PixelBlock[] = []
  private phase: 'idle' | 'scatter' | 'flash' | 'assemble' = 'idle'

  async captureAndScatter(): Promise<void> {
    // 1. html2canvas or drawWindow to capture current DOM
    // 2. Split into 32x32 grid
    // 3. Animate scatter with random velocities outward
  }

  async flash(): Promise<void> {
    // 1. Clear to black
    // 2. Draw sigil frame at 80% opacity for 2 animation frames (~83ms)
    // 3. Clear to black
  }

  async assembleFromCapture(targetImageData: ImageData): Promise<void> {
    // 1. Split target into blocks
    // 2. Position blocks at random starting positions
    // 3. Animate inward to final positions
  }
}
```

**Integration**: Wrap Next.js router with transition provider that intercepts navigation.

### 3. Cursor Trail Effect

**Location**: `src/lib/canvas/cursorTrail.ts`

```typescript
interface TrailPoint {
  x: number
  y: number
  age: number      // ms since creation
  opacity: number  // Decays over 300ms
}

class CursorTrail {
  private points: TrailPoint[] = []
  private maxPoints: number = 5
  private decayTime: number = 300

  addPoint(x: number, y: number): void
  render(ctx: CanvasRenderingContext2D): void
  update(deltaTime: number): void
}
```

**Cursor States**:
- Default: Custom SVG crosshair reticle (24px, #EFEFEF, no fill)
- Interactive hover: Small sigil PNG (40px, static frame)
- Both states maintain red smear trail

### 4. Glitch-Slice Entry Animation

**Location**: `src/lib/animations/glitchSlice.ts`

Elements enter split into 3-4 horizontal bands, offset ±15-20px, then snap into alignment.

```typescript
interface GlitchSliceConfig {
  element: HTMLElement
  bands: number           // 3-4
  maxOffset: number       // 15-20px
  duration: number        // 300ms
  easing: string          // Slight elastic
}

function createGlitchSlice(config: GlitchSliceConfig): gsap.core.Timeline {
  // Clone element into bands using clip-path
  // Set initial random horizontal offsets
  // Animate to offset: 0 with elastic ease
  // Clean up clones, reveal original
}
```

**React Component**: `src/components/effects/GlitchSlice.tsx`

```typescript
interface GlitchSliceProps {
  children: ReactNode
  delay?: number
  threshold?: number  // Intersection observer threshold
}
```

### 5. Scramble Text Effect

**Location**: `src/lib/animations/scrambleText.ts`

Characters cycle through random characters at 30ms intervals for 400ms, then resolve.

```typescript
interface ScrambleConfig {
  element: HTMLElement
  duration: number        // 400ms
  interval: number        // 30ms between character swaps
  resolveToColor?: string // #CC0000 for artist names
  finalColor?: string     // #EFEFEF after resolve
}

function scrambleText(config: ScrambleConfig): void {
  const original = element.textContent
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*'

  // setInterval to randomize characters
  // After duration, resolve back to original with color transition
}
```

### 6. Burn-In Text Effect

**Location**: `src/lib/animations/burnIn.ts`

Brief white bloom flash, then text settles to normal weight.

```typescript
function burnInText(element: HTMLElement, duration: number = 400): void {
  // 1. Set initial: text-shadow with large white bloom, high brightness
  // 2. Animate: reduce bloom radius and brightness to 0
  // 3. Final: normal text rendering
}
```

---

## Global Components

### Navigation (`src/components/layout/Navigation.tsx`)

```typescript
interface NavigationProps {
  currentPath: string
}

// Structure:
// - Fixed position, transparent background
// - Left: Small sigil (36px static PNG)
//   - Hover: rotation speed increases dramatically
// - Center/Right: NAV LINKS in blackletter
//   - HOME | EVENTS | ARTISTS | MOTO | CONTACT
//   - Hover: scramble text effect
//   - Active: red drip SVG beneath

const NAV_LINKS = [
  { href: '/', label: 'HOME' },
  { href: '/events', label: 'EVENTS' },
  { href: '/artists', label: 'ARTISTS' },
  { href: '/moto', label: 'MOTO' },
  { href: '/contact', label: 'CONTACT' },
]
```

### Mobile Navigation (`src/components/layout/MobileNav.tsx`)

```typescript
// Trigger: Tap on sigil icon (replaces hamburger)
// Opens: Full-screen overlay via pixel dissolve
// Content:
//   - Links centered, massive blackletter
//   - Staggered glitch-slice entry (150ms delay each)
// Close: Tap anywhere, pixel dissolve out
```

### Film Grain Overlay (`src/components/canvas/FilmGrain.tsx`)

```typescript
// Fixed position canvas, pointer-events: none, z-index: 9999
// Redraws random noise every 50ms
// Very low opacity (~3%)
// Covers entire viewport
```

### Scroll Indicator (`src/components/ui/ScrollIndicator.tsx`)

```typescript
// Position: Right edge of viewport
// Visual: Vertical line, #1A1A1A base
// Behavior: Fills red from top proportional to scroll depth
// Like blood running down the edge
```

### Perspective Grid (`src/components/canvas/PerspectiveGrid.tsx`)

```typescript
// Rendered at bottom of every page
// CSS perspective: 500px
// Grid lines: #1A1A1A
// Fades to black at edges via gradient mask
```

---

## Page Specifications

### Page 1: HOME (`src/app/page.tsx`)

#### Hero Section (Above Fold)

**Layout**: Full viewport, centred

**Sigil Animation**:
- Canvas element, 60-70vw on desktop
- On page load: assembles from pixel blocks flying in (1.2s)
- Continuous slow rotation: 1 revolution / 40 seconds (CSS transform on wrapper)
- On hover: rotation jumps to 1 revolution / 3 seconds, eases back on leave

**Title "KAMIKAZE"**:
- Below sigil, blackletter
- Each letter burns in individually, left to right
- 80ms stagger per letter
- Brief #CC0000 flash per letter, decays to #EFEFEF

**Tagline**:
- "Enter or be entered."
- Space Mono, small
- Appears after title animation completes
- Simple opacity fade in, no motion

#### Below Fold

**Manifesto Section**:
- 2-3 sentences, Space Mono
- Words appear one by one on scroll trigger

**Tease Cards** (3 cards):
- Next event / Featured artist / Latest release
- Jagged clip-path borders
- Glitch-slice entry on scroll
- Hover: contained pixel dissolve, reassembles with full detail

### Page 2: EVENTS (`src/app/events/page.tsx`)

#### Layout
Vertically stacked event cards on pure black

#### Event Card Structure

```
┌──────────────────────────────────────┐
│ 23.04.2025                           │  ← Large monospace date
│                                      │
│         DESCENT INTO VOID            │  ← Blackletter event name
│                                      │
│ VENUE: Warehouse 17, Berlin          │  ← Small monospace
│ LINEUP: Artist A, Artist B, Artist C │
│                                      │
│ > BUY_TICKET_                        │  ← Terminal button, blinking cursor
└──────────────────────────────────────┘
```

**Border**: clip-path polygon with irregular jagged points (not clean rectangle)

**Hover Behaviour**:
- Card pixel-dissolves (contained, not full page)
- Reassembles showing expanded info + ticket CTA

**Sold Out State**:
- Hover triggers deep red diagonal "VOID" stamp
- Brief bloom effect on stamp appearance

#### Past Events Section

- CSS filter: `grayscale(1) brightness(0.4)`
- Horizontal scanline corruption overlay (subtle, dying monitor effect)

#### Background
- Extremely faint noise texture (~3% opacity)
- Canvas-rendered film grain that slowly shifts

### Page 3: ARTISTS (`src/app/artists/page.tsx`)

#### Grid Layout
2-3 columns, dossier card tiles

#### Artist Tile (Resting State)

```
┌──────────────────────────────────────┐
│                                      │
│    [B&W high-contrast photo]         │
│    mix-blend-mode: luminosity        │
│                                      │
│    ╔═══╗              ╔═══╗          │  ← Sigil tendril overlays
│                                      │    at corners, opacity: 0.3
│──────────────────────────────────────│
│           ARTIST NAME                │  ← Blackletter
└──────────────────────────────────────┘
```

#### Artist Tile (Hover State)

- Photo gains slight colour: `filter: saturate(0.3)`
- Tendril corners animate inward, opacity to 0.7
- Name letters scramble (random chars 30ms intervals, 400ms total)
- Resolves to #CC0000, then fades to #EFEFEF

#### Individual Artist Page (`src/app/artists/[slug]/page.tsx`)

**Header**:
- Full-width artist photo with `mix-blend-mode`
- Sigil watermark at 8% opacity, drifting slowly behind
- Heavy CSS film grain overlay on photo

**Bio**:
- Typewriter-renders on scroll into view
- Space Mono, character by character, ~30ms per char

**Mixes**:
- Custom dark audio players (no browser defaults)
- Minimal UI: waveform visualizer, play button, timeline

**Socials**:
- Glitched icon SVGs that stabilize on hover

### Page 4: MOTO (`src/app/moto/page.tsx`)

#### Mechanic
Vertical scroll-snap — each scroll step locks to next full-viewport panel

#### Panel Structure

```
┌────────────────────────────────────────────────┐
│                                                │
│                                                │
│    "We don't make music.                       │
│           We make ruptures."                   │
│                                                │
│                                                │
│────────────────────────────────────────────────│
│ [Thin #1A1A1A horizontal rule]                 │
└────────────────────────────────────────────────┘
```

**Text**:
- Centred, blackletter
- `font-size: clamp(3rem, 8vw, 7rem)`
- Enters with burn effect: white bloom flash → settles

**Background**:
- Sigil rendered at 500% scale
- `filter: blur(40px)`, `opacity: 0.06`
- Extremely slow drift animation (60s loop)

#### Panel Content (5 panels)

1. "We don't make music. We make ruptures."
2. "Every event is a controlled collapse."
3. "Underground. Uncompromising. Unrepeatable."
4. "The dancefloor is a warzone. The DJ is munitions."
5. **Final**: Sigil animation at full opacity/size, centred. Single word "KAMIKAZE" below in blackletter. No other text.

### Page 5: CONTACT (`src/app/contact/page.tsx`)

#### Entry Experience
1. Page loads to pure black for 800ms
2. Sigil PNG sequence assembles pixel-by-pixel in centre (~180px)
3. Sigil begins breathing loop animation

#### Interaction (Constellation Reveal)

**Resting State**: Only small sigil visible, centred

**Cursor Proximity** (within 200px of sigil):
- Contact info radiates outward from sigil
- Email, booking email, Instagram handle
- Each appears in Space Mono at different angle around sigil
- Like a constellation revealing itself
- Items appear one by one, 150ms stagger
- Slide out from sigil centre

#### Below Fold - Contact Form

**Input Fields**:
- No box border
- Only bottom border line with torn/irregular clip-path
- Placeholder text: Space Mono, opacity: 0.3
- On focus: bottom border bleeds red left to right (animated)

**Submit Button**:
- Style: `> TRANSMIT_` monospace with blinking cursor
- On click: dissolves into pixels
- Replaced by `SIGNAL_SENT` in red

---

## Performance Optimization

### Image Preloading

**Hook**: `src/hooks/useImagePreloader.ts`

```typescript
function useImagePreloader(imagePaths: string[]): {
  images: HTMLImageElement[]
  progress: number  // 0-1
  isLoaded: boolean
}

// Implementation:
// - Create Image() for each path
// - Track onload/onerror
// - Update progress as images load
// - Return array of loaded images for canvas use
```

**Usage for Sigil**:
```typescript
const framePaths = Array.from({ length: 120 }, (_, i) => `/sequence/${i + 1}.png`)
const { images, isLoaded } = useImagePreloader(framePaths)
```

### Canvas Optimization

1. **Offscreen Canvas**: Use for pixel dissolve compositing
2. **Double Buffering**: Render next frame to offscreen, swap
3. **RequestAnimationFrame**: Single RAF loop for all canvas elements
4. **Cleanup**: Proper disposal in useEffect cleanup

### Bundle Optimization

```javascript
// next.config.js
module.exports = {
  images: {
    formats: ['image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
  },
  experimental: {
    optimizeCss: true,
  },
}
```

### Font Loading

- Self-host fonts (avoid Google Fonts CDN latency)
- Use `font-display: swap`
- Preload critical fonts in `<head>`

### Code Splitting

- Dynamic import for canvas-heavy components
- Route-based code splitting (automatic with App Router)

---

## Implementation Order

### Phase 1: Foundation

1. **Project Setup**
   - Initialize Next.js 14 with TypeScript
   - Configure Tailwind CSS
   - Install dependencies (GSAP, Lenis)
   - Set up font files

2. **Design System**
   - Create `globals.css` with colours, fonts, base styles
   - Configure Tailwind theme
   - Create custom cursor CSS

3. **Core Providers**
   - `LenisProvider` for smooth scroll
   - `CursorProvider` for custom cursor state
   - `TransitionProvider` for page transitions

### Phase 2: Canvas Systems

4. **Image Preloader Hook**
   - `useImagePreloader` for PNG sequence

5. **Sigil Animation**
   - `sigilPlayer.ts` canvas renderer
   - `SigilAnimation.tsx` component
   - `useSigilAnimation` hook

6. **Cursor Trail**
   - `cursorTrail.ts` renderer
   - `CursorTrail.tsx` component

7. **Film Grain**
   - `filmGrain.ts` noise generator
   - `FilmGrain.tsx` overlay component

### Phase 3: Animation Effects

8. **Glitch Slice**
   - `glitchSlice.ts` GSAP animation
   - `GlitchSlice.tsx` wrapper component

9. **Scramble Text**
   - `scrambleText.ts` logic
   - `ScrambleText.tsx` component

10. **Burn-In Effect**
    - `burnIn.ts` animation
    - `BurnIn.tsx` component

11. **Pixel Dissolve Transition**
    - `pixelDissolve.ts` full implementation
    - `PixelTransition.tsx` overlay
    - Router integration

### Phase 4: Layout Components

12. **Navigation**
    - Desktop `Navigation.tsx`
    - Mobile `MobileNav.tsx`
    - Scroll indicator

13. **Root Layout**
    - Provider wrapping
    - Global overlays (grain, cursor, transition)

### Phase 5: Pages

14. **Home Page**
    - Hero with sigil assembly animation
    - Title letter burn effect
    - Manifesto section
    - Tease cards

15. **Events Page**
    - Event card component
    - Past events styling
    - Noise background

16. **Artists Page**
    - Artist grid
    - Tile hover effects
    - Individual artist page template

17. **Moto Page**
    - Scroll-snap panels
    - Burn-in text entry
    - Background sigil blur

18. **Contact Page**
    - Constellation reveal interaction
    - Contact form with torn inputs
    - Submit pixel dissolve

### Phase 6: Polish

19. **Testing & Debug**
    - Cross-browser testing
    - Mobile responsiveness
    - Performance profiling

20. **Optimization**
    - Image optimization
    - Bundle analysis
    - Lighthouse audit

---

## Asset Requirements

### Existing Assets (`/public/sequence/`)
- 120 PNG frames: `1.png` through `120.png`
- Dimensions: High-res (verify exact dimensions)
- Format: PNG with transparency

### Assets to Create

| Asset | Path | Description |
|-------|------|-------------|
| Static sigil | `/public/sigil-static.png` | Single frame for nav/cursor (36px and 40px versions) |
| Sigil tendrils | `/public/sigil-tendrils.svg` | Corner decorations for artist tiles |
| Crosshair cursor | `/public/cursor-crosshair.svg` | 24px, #EFEFEF stroke, no fill |
| Sigil cursor | `/public/cursor-sigil.png` | 40px version for interactive hovers |
| Drip indicator | `/public/drip.svg` | Small red drip for active nav |
| VOID stamp | `/public/void-stamp.svg` | Diagonal stamp for sold out events |

### Fonts to Download

1. **MedievalSharp** (Google Fonts)
   - Download: https://fonts.google.com/specimen/MedievalSharp
   - Convert to WOFF2
   - Place in `/public/fonts/`

2. **Space Mono** (Google Fonts)
   - Download: https://fonts.google.com/specimen/Space+Mono
   - Regular weight only
   - Convert to WOFF2
   - Place in `/public/fonts/`

---

## Content Data

### Events Data (`src/data/events.ts`)

```typescript
interface Event {
  id: string
  name: string
  date: string          // ISO date
  venue: string
  city: string
  lineup: string[]
  ticketUrl?: string    // Undefined = sold out
  isPast: boolean
}

export const events: Event[] = [
  {
    id: 'descent-into-void',
    name: 'DESCENT INTO VOID',
    date: '2025-04-23',
    venue: 'Warehouse 17',
    city: 'Berlin',
    lineup: ['KNTXT', 'TRYM', 'VTSS'],
    ticketUrl: 'https://...',
    isPast: false,
  },
  // ... more events
]
```

### Artists Data (`src/data/artists.ts`)

```typescript
interface Artist {
  id: string
  name: string
  slug: string
  photo: string         // Path to B&W photo
  bio: string
  socials: {
    instagram?: string
    soundcloud?: string
    bandcamp?: string
  }
  mixes: {
    title: string
    url: string
  }[]
}

export const artists: Artist[] = [
  {
    id: '1',
    name: 'KNTXT',
    slug: 'kntxt',
    photo: '/artists/kntxt.jpg',
    bio: 'Industrial techno architect...',
    socials: {
      instagram: 'https://instagram.com/kntxt',
      soundcloud: 'https://soundcloud.com/kntxt',
    },
    mixes: [
      { title: 'Boiler Room Berlin 2024', url: '...' },
    ],
  },
  // ... more artists
]
```

### Manifesto Data (`src/data/moto.ts`)

```typescript
export const manifesto: string[] = [
  "We don't make music. We make ruptures.",
  "Every event is a controlled collapse.",
  "Underground. Uncompromising. Unrepeatable.",
  "The dancefloor is a warzone. The DJ is munitions.",
]
```

---

## Critical Implementation Details

### PNG Sequence Frame Timing

```typescript
// 120 frames at 24fps = 5 second loop
const TOTAL_FRAMES = 120
const DEFAULT_FPS = 24
const HOVER_FPS = 40

// Frame interval in ms
const frameInterval = 1000 / fps  // ~41.67ms at 24fps
```

### Pixel Dissolve Grid

```typescript
// 32x32 pixel blocks for page transition
const BLOCK_SIZE = 32

// For 1920x1080 viewport:
// 60 columns x 34 rows = 2040 blocks
// Each block: 32x32 = 1024 pixels

// Scatter velocity: random in range [-500, 500] px/s
// Rotation speed: random in range [-180, 180] deg/s
// Duration: 400ms scatter + 83ms flash + 400ms assemble = ~883ms total
```

### Cursor Trail Points

```typescript
const MAX_TRAIL_POINTS = 5
const TRAIL_DECAY_MS = 300
const TRAIL_COLOR = '#CC0000'

// Render as fading dots, not connected line
// Oldest point: opacity approaches 0
// Newest point: full opacity
```

### Glitch Slice Bands

```typescript
const BAND_COUNT = 3 or 4  // Random
const MAX_OFFSET = 20      // px horizontal offset
const DURATION = 300       // ms
const EASING = 'elastic.out(1, 0.5)'
```

---

## Accessibility Considerations

While this is a highly visual, experimental site, maintain baseline accessibility:

1. **Reduced Motion**
   - Respect `prefers-reduced-motion`
   - Disable pixel dissolve, use simple fades
   - Disable glitch effects, use opacity transitions
   - Keep sigil static or very slow

2. **Screen Readers**
   - Proper heading hierarchy
   - Alt text for artist images
   - ARIA labels on interactive elements

3. **Keyboard Navigation**
   - Tab order preserved
   - Focus states visible (can be styled red outline)
   - Enter/Space triggers interactions

4. **Contrast**
   - Text (#EFEFEF) on black (#000000) exceeds WCAG AAA
   - Red accent (#CC0000) on black passes AA

---

## Notes for Implementing Agent

1. **Do not use GIF or video tags** for the sigil — canvas-rendered sprite animation only

2. **The pixel dissolve must be custom canvas**, not a pre-built library. This is the signature effect.

3. **Film grain is separate from page content** — fixed overlay canvas at highest z-index

4. **All text animations (scramble, burn-in, typewriter) use raw DOM manipulation**, not React state per character

5. **Lenis.js handles smooth scroll with inertia** — configure slight overshoot

6. **GSAP ScrollTrigger for scroll-based animations** — glitch slice entries, manifesto reveals

7. **No component libraries** — all UI is custom built

8. **Test on both Chrome and Firefox** — canvas rendering differs

9. **Mobile-first responsive** — sigil scales with viewport, nav collapses to overlay

10. **Performance budget**: First contentful paint < 2s, Time to interactive < 4s
