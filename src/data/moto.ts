export interface MotoPanel {
  id: number
  statement: string
  isFinal?: boolean
}

export const manifesto: MotoPanel[] = [
  {
    id: 1,
    statement: "We don't make music. We make ruptures.",
  },
  {
    id: 2,
    statement: "Every event is a controlled collapse.",
  },
  {
    id: 3,
    statement: "Underground. Uncompromising. Unrepeatable.",
  },
  {
    id: 4,
    statement: "The dancefloor is a warzone. The DJ is munitions.",
  },
  {
    id: 5,
    statement: "KAMIKAZE",
    isFinal: true,
  },
]

export const contactInfo = {
  email: 'enter@kamikaze.events',
  booking: 'booking@kamikaze.events',
  instagram: '@kamikaze.events',
  instagramUrl: 'https://instagram.com/kamikaze.events',
}
