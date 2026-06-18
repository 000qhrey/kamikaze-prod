/** Site-wide performance defaults — applied on all devices */
export const PERF = {
  sigilDesktopDpr: [1, 1.25] as [number, number],
  sigilMobileDpr: [1, 1] as [number, number],

  asciiFpsIntervalMs: 50,
  asciiAutoCycleMinMs: 12_000,
  asciiAutoCycleRangeMs: 8_000,

  emberParticleCount: 6,

  dataStreamBassMs: 500,
  dataStreamGlitchMs: 4_000,
  dataStreamCorruptMs: 8_000,
  dataStreamSysLogMs: 5_000,
  dataStreamFlickerMs: 4_000,
} as const
