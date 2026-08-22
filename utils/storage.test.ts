import { describe, expect, it } from 'vitest'
import { chunkUtf8String, isStoredNoteArray, measureUtf8Bytes, toLocalNote } from './storage'

describe('SYNC-002 UTF-8 storage helpers', () => {
  it('measures ASCII, Japanese, and emoji in UTF-8 bytes', () => {
    expect(measureUtf8Bytes('abc')).toBe(3)
    expect(measureUtf8Bytes('日本')).toBe(6)
    expect(measureUtf8Bytes('😀')).toBe(4)
  })

  it('splits without corrupting multibyte characters or exceeding the limit', () => {
    const input = 'ab日本😀cd'
    const chunks = chunkUtf8String(input, 7)

    expect(chunks.join('')).toBe(input)
    expect(chunks.every((chunk) => measureUtf8Bytes(chunk) <= 7)).toBe(true)
  })

  it('returns no chunks for empty input or a non-positive limit', () => {
    expect(chunkUtf8String('', 10)).toEqual([])
    expect(chunkUtf8String('text', 0)).toEqual([])
  })
})

describe('NOTE-001 stored note validation', () => {
  it('accepts current and legacy note payloads', () => {
    expect(isStoredNoteArray([{ id: '1', text: 'legacy' }])).toBe(true)
    expect(
      isStoredNoteArray([{ id: '2', text: 'current', isSynced: true, syncedText: 'current' }])
    ).toBe(true)
    expect(isStoredNoteArray([])).toBe(true)
  })

  it.each([
    null,
    {},
    [{ text: 'missing id' }],
    [{ id: '1' }],
    [{ id: 1, text: 'invalid id' }],
    [{ id: '1', text: 'invalid sync flag', isSynced: 'yes' }],
    [{ id: '1', text: 'invalid synced text', syncedText: 1 }],
  ])('rejects malformed payload %#', (payload) => {
    expect(isStoredNoteArray(payload)).toBe(false)
  })
})

describe('NOTE-001 / SYNC-005 stored note normalization', () => {
  it('normalizes a legacy local note', () => {
    expect(toLocalNote({ id: '1', text: 'hello' })).toEqual({
      id: '1',
      text: 'hello',
      isSynced: false,
      syncedText: null,
    })
  })

  it('uses the current text as the baseline for a legacy synced note', () => {
    expect(toLocalNote({ id: '1', text: 'hello', isSynced: true })).toEqual({
      id: '1',
      text: 'hello',
      isSynced: true,
      syncedText: 'hello',
    })
  })

  it('preserves an explicit synced baseline', () => {
    expect(toLocalNote({ id: '1', text: 'edited', isSynced: false, syncedText: 'remote' })).toEqual(
      { id: '1', text: 'edited', isSynced: false, syncedText: 'remote' }
    )
  })
})
