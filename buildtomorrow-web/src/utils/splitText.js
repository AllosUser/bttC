/**
 * Splits a string into character objects: { char, index, total }.
 * Spaces are preserved as non-breaking placeholders so they hold layout.
 */
export function splitText(text) {
  const chars = Array.from(text)
  const total = chars.length
  return chars.map((char, index) => ({
    char: char === ' ' ? ' ' : char,
    raw: char,
    isSpace: char === ' ',
    index,
    total,
  }))
}

export function splitWords(text) {
  return text.split(' ').map((word, i, arr) => ({
    word,
    index: i,
    total: arr.length,
  }))
}
