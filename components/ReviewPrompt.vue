<template>
  <aside
    class="fixed bottom-[20px] right-[20px] z-50 w-[min(360px,calc(100vw-40px))] rounded-[8px] border border-border_primary bg-bg_primary p-[16px] shadow-lg"
    role="dialog"
    aria-live="polite"
    :aria-label="TITLE"
  >
    <p class="font-semibold">{{ TITLE }}</p>
    <p class="mt-[4px] text-small text-text_primary">{{ MESSAGE }}</p>
    <div class="mt-[12px] flex flex-wrap gap-[8px]">
      <button
        type="button"
        class="rounded-[4px] bg-bg_button_primary px-[12px] py-[7px] text-small text-text_button_primary"
        @click="$emit('review')"
      >
        {{ REVIEW_LABEL }}
      </button>
      <button
        type="button"
        class="rounded-[4px] border border-border_primary px-[12px] py-[7px] text-small"
        @click="$emit('later')"
      >
        {{ LATER_LABEL }}
      </button>
      <button type="button" class="px-[8px] py-[7px] text-small" @click="$emit('dismiss')">
        {{ DISMISS_LABEL }}
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
defineEmits<{ review: []; later: []; dismiss: [] }>()

const TITLE = chrome.i18n.getMessage('REVIEW_PROMPT_TITLE') || 'Enjoying NEW TAB NOTE?'
const MESSAGE =
  chrome.i18n.getMessage('REVIEW_PROMPT_MESSAGE') ||
  'A short Chrome Web Store review helps us improve the extension.'
const REVIEW_LABEL = chrome.i18n.getMessage('REVIEW_PROMPT_REVIEW') || 'Write a review'
const LATER_LABEL = chrome.i18n.getMessage('REVIEW_PROMPT_LATER') || 'Later'
const DISMISS_LABEL = chrome.i18n.getMessage('REVIEW_PROMPT_DISMISS') || "Don't show again"
</script>
