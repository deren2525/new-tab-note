export type ReviewPromptState = {
  firstSeenAt: number
  openCount: number
  snoozedUntil?: number
  dismissed?: boolean
}

export const REVIEW_PROMPT_MIN_AGE_MS = 7 * 24 * 60 * 60 * 1000
export const REVIEW_PROMPT_MIN_OPENS = 5

export const nextReviewPromptState = (
  previous: ReviewPromptState | undefined,
  now: number,
): ReviewPromptState => ({
  firstSeenAt: previous?.firstSeenAt ?? now,
  openCount: (previous?.openCount ?? 0) + 1,
  snoozedUntil: previous?.snoozedUntil,
  dismissed: previous?.dismissed,
})

export const shouldShowReviewPrompt = (state: ReviewPromptState, now: number): boolean => {
  if (state.dismissed) return false
  if (state.snoozedUntil && state.snoozedUntil > now) return false
  return now - state.firstSeenAt >= REVIEW_PROMPT_MIN_AGE_MS && state.openCount >= REVIEW_PROMPT_MIN_OPENS
}
