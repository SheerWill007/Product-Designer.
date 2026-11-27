/**
 * Songs for the record player and the volume controls.
 *
 * To add a song:
 *   1. Put the audio file in public/music/ (MP3 or AAC/M4A; prefer kebab-case names without spaces).
 *   2. Optionally put a square cover in public/music/covers/ (~300×300 WebP is plenty).
 *      Songs without a cover get a coloured label with their first letter.
 *   3. Add an entry below. Paths start with "/" and leave out "public".
 *
 * Songs play in this order and loop back to the first after the last.
 * Only use music you have the rights to stream on a public site.
 */
export interface Track {
  title: string
  artist: string
  src: string
  cover?: string
  /** Which part of a non-square cover the round label keeps, as CSS object-position ("right", "30% 50%"). */
  coverPosition?: string
}

export const PLAYLIST: Track[] = [
  {
    title: "Song title",
    artist: "Artist name",
    src: "/music/song-title.mp3",
    cover: "/music/covers/song-title.webp",
  },
  {
    title: "Second song",
    artist: "Artist name",
    src: "/music/second-song.mp3",
    // no cover: the record shows a generated colour label
  },
]
