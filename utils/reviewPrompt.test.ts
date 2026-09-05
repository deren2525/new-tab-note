import { describe, expect, it } from 'vitest'
import {
  nextReviewPromptState,
  REVIEW_PROMPT_MIN_AGE_MS,
  REVIEW_PROMPT_MIN_OPENS,
  shouldShowReviewPrompt,
} from './reviewPrompt'

describe('review prompt eligibility', () => {
  it('preserves the first visit and increments opens', () => {
    const first = nextReviewPromptState(undefined, 100)
    const second = nextReviewPromptState(first, 200)
    expect(second).toMatchObject({ firstSeenAt: 100, openCount: 2 })
  })

  it('waits for both a week of use and enough opens', () => {
    const eligible = { firstSeenAt: 0, openCount: REVIEW_PROMPT_MIN_OPENS }
    expect(shouldShowReviewPrompt(eligible, REVIEW_PROMPT_MIN_AGE_MS - 1)).toBe(false)
    expect(shouldShowReviewPrompt(eligible, REVIEW_PROMPT_MIN_AGE_MS)).toBe(true)
    expect(
      shouldShowReviewPrompt(
        { firstSeenAt: 0, openCount: REVIEW_PROMPT_MIN_OPENS - 1 },
        REVIEW_PROMPT_MIN_AGE_MS,
      ),
    ).toBe(false)
  })

  it('respects snooze and permanent dismissal', () => {
    const base = { firstSeenAt: 0, openCount: REVIEW_PROMPT_MIN_OPENS }
    expect(shouldShowReviewPrompt({ ...base, snoozedUntil: 101 }, 100)).toBe(false)
    expect(shouldShowReviewPrompt({ ...base, dismissed: true }, REVIEW_PROMPT_MIN_AGE_MS)).toBe(
      false,
    )
  })
})
