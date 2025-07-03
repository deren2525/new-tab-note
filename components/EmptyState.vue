<template>
  <div
    class="w-full h-full flex flex-col justify-center items-center bg-bg_secondary text-text_primary"
  >
    <div class="text-h4 mb-[8px]">{{ MESSAGE_NO_NOTES }}</div>
    <div class="w-[160px]">
      <button
        class="flex gap-[8px] p-[8px] bg-bg_button_primary w-full rounded-[4px] items-center text-text_button_primary"
        @click="handleCreateNote"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M2.66669 7.99998V1.73331C2.66669 1.5124 2.84577 1.33331 3.06669 1.33331H10.8344C10.9404 1.33331 11.0422 1.37545 11.1172 1.45047L13.2162 3.54949C13.2912 3.62451 13.3334 3.72625 13.3334 3.83233V14.2666C13.3334 14.4876 13.1543 14.6666 12.9334 14.6666H7.33335"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M10.6667 1.33331V3.59998C10.6667 3.82089 10.8458 3.99998 11.0667 3.99998H13.3334"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M1.32812 12.6667H3.32813M3.32813 12.6667H5.32813M3.32813 12.6667V10.6667M3.32813 12.6667V14.6667"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        {{ MESSAGE_CREATE_NEW_NOTE }}
      </button>
    </div>
  </div>
</template>
<script setup lang="ts">
const emit = defineEmits<{ (e: 'create'): void }>()

const MESSAGE_NO_NOTES = chrome.i18n.getMessage('NO_NOTES')
const MESSAGE_CREATE_NEW_NOTE = chrome.i18n.getMessage('CREATE_NEW_NOTE')

const handleCreateNote = () => {
  emit('create')
}
</script>
