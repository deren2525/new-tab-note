export type StoredNotePayload = {
  id: string
  text: string
  isSynced?: boolean
  syncedText?: string | null
}

export type Note = {
  id: string
  text: string
  isSynced: boolean
  syncedText: string | null
}

const utf8Encoder = new TextEncoder()

export const measureUtf8Bytes = (input: string): number => utf8Encoder.encode(input).length

export const chunkUtf8String = (input: string, maxBytes: number): string[] => {
  if (maxBytes <= 0) return []
  const chunks: string[] = []
  let currentChunk = ''
  let currentBytes = 0

  for (const character of input) {
    const characterBytes = measureUtf8Bytes(character)
    if (currentChunk && currentBytes + characterBytes > maxBytes) {
      chunks.push(currentChunk)
      currentChunk = ''
      currentBytes = 0
    }

    currentChunk += character
    currentBytes += characterBytes
  }

  if (currentChunk) chunks.push(currentChunk)
  return chunks
}

export const isStoredNoteArray = (value: unknown): value is StoredNotePayload[] =>
  Array.isArray(value) &&
  value.every(
    (note) =>
      note &&
      typeof note.id === 'string' &&
      typeof note.text === 'string' &&
      (note.isSynced === undefined || typeof note.isSynced === 'boolean') &&
      (note.syncedText === undefined ||
        note.syncedText === null ||
        typeof note.syncedText === 'string')
  )

export const toLocalNote = (payload: StoredNotePayload): Note => {
  const isSynced = payload.isSynced === true
  const syncedText =
    typeof payload.syncedText === 'string'
      ? payload.syncedText
      : payload.syncedText === null
        ? null
        : isSynced
          ? payload.text
          : null
  return { id: payload.id, text: payload.text, isSynced, syncedText }
}
