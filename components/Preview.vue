<template>
  <div class="flex w-full h-full flex-col border-l border-border_primary">
    <div class="h-[35px] w-full bg-bg_primary flex justify-between">
      <span
        class="bg-bg_secondary px-[16px] inline-flex items-center h-full text-text_primary gap-[8px]"
      >
        Preview
        <button
          v-if="props.isEditVisible"
          type="button"
          class="text-icon_primary"
          :aria-label="MESSAGE_HIDE_PREVIEW"
          @click="handleClose"
        >
          <svg
            width="17"
            height="17"
            viewBox="0 0 17 17"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M5.00562 11.995L8.5007 8.49998M8.5007 8.49998L11.9958 5.00488M8.5007 8.49998L5.00562 5.00488M8.5007 8.49998L11.9958 11.995"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      </span>
      <div class="flex">
        <div v-if="props.canSync" class="relative flex items-center gap-[4px] px-[8px]">
          <div class="flex items-center gap-[4px] px-[8px]">
            <div class="flex items-center pointer-events-none">
              <!-- 同期中アイコン -->
              <svg
                v-if="props.syncStatus === 'syncing'"
                class="h-4 w-4 animate-spin text-icon_primary"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  class="opacity-25"
                  cx="8"
                  cy="8"
                  r="6"
                  stroke="currentColor"
                  stroke-width="2"
                />
                <path
                  class="opacity-75"
                  d="M14 8A6 6 0 0 0 8 2"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>
              <svg
                v-else-if="props.syncStatus === 'synced'"
                class="h-4 w-4 text-green-500"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3 8L6.2 11 13 4"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              <svg
                v-else-if="props.syncStatus === 'error'"
                class="h-4 w-4 text-red-500"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M8 5V9" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                <path
                  d="M8 11.5H8.01"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                />
                <path
                  d="M8 2.5L14 13.5H2L8 2.5Z"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              <svg
                v-else
                class="h-4 w-4 text-text_secondary"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5.5 12H11a2.5 2.5 0 0 0 .312-4.978A3.5 3.5 0 0 0 4.954 6.7a2.75 2.75 0 0 0 .384 5.3H5.5Z"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M3 3l10 10"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                />
              </svg>
            </div>
            <div
              class="relative flex items-center gap-[6px] text-small text-text_primary cursor-help"
              @mouseenter="showSyncInfo = true"
              @mouseleave="showSyncInfo = false"
              @focusin="showSyncInfo = true"
              @focusout="showSyncInfo = false"
            >
              <span class="text-small">{{ LABEL_SYNC }}</span>
              <button
                class="relative inline-flex h-[20px] w-[40px] items-center rounded-full border border-border_primary transition-colors duration-200 disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-bg_button_primary"
                :class="[
                  props.isSynced
                    ? 'bg-bg_button_primary border-bg_button_primary'
                    : 'bg-bg_secondary',
                ]"
                role="switch"
                :aria-checked="props.isSynced"
                :aria-label="props.isSynced ? MESSAGE_SYNC_BUTTON_ON : MESSAGE_SYNC_BUTTON_OFF"
                :disabled="!props.noteId"
                @click="$emit('toggleSync', props.noteId)"
              >
                <span class="sr-only">
                  {{ props.isSynced ? MESSAGE_SYNC_BUTTON_ON : MESSAGE_SYNC_BUTTON_OFF }}
                </span>
                <span
                  class="absolute left-[2px] h-[16px] w-[16px] rounded-full bg-white shadow transition-transform duration-200"
                  :class="[props.isSynced ? 'translate-x-[20px]' : 'translate-x-0']"
                ></span>
              </button>
              <div
                v-if="showSyncInfo"
                class="absolute z-30 top-full right-0 mt-2 w-[260px] max-w-[calc(100vw-24px)] rounded bg-bg_primary text-text_primary text-small shadow-lg p-[10px]"
              >
                <p class="whitespace-pre-line text-small">{{ MESSAGE_SYNC_INFO }}</p>
              </div>
            </div>
          </div>
          <div v-if="!props.isEditVisible" class="relative flex">
            <button
              type="button"
              class="flex p-[8px] text-icon_primary"
              :aria-label="MESSAGE_SHOW_EDIT"
              @mouseenter="showEditTooltip = true"
              @mouseleave="showEditTooltip = false"
              @focusin="showEditTooltip = true"
              @focusout="showEditTooltip = false"
              @click="handleOpenEdit"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clip-path="url(#clip0_66_287)">
                  <path
                    d="M10.6116 3.11003L11.7508 1.97169C12.0528 1.66967 12.4624 1.5 12.8896 1.5C13.3167 1.5 13.7263 1.66967 14.0283 1.97169C14.3303 2.2737 14.5 2.68332 14.5 3.11044C14.5 3.53756 14.3303 3.94718 14.0283 4.24919L12.89 5.38835M10.6116 3.11003L3.92132 9.80036C3.07223 10.6503 2.64728 11.0744 2.35803 11.592C2.06877 12.1096 1.77788 13.3308 1.5 14.5C2.66841 14.2221 3.89045 13.9312 4.40802 13.642C4.9256 13.3527 5.35055 12.9278 6.19964 12.0787L12.89 5.38835M10.6116 3.11003L12.89 5.38835"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M7.18774 14.5H12.0629"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_66_287">
                    <rect width="16" height="16" fill="white" />
                  </clipPath>
                </defs>
              </svg>
            </button>
            <div
              v-if="showEditTooltip"
              class="pointer-events-none absolute top-full right-0 mt-[6px] rounded bg-bg_primary px-[12px] py-[6px] text-small text-text_primary shadow-lg whitespace-nowrap"
            >
              {{ LABEL_EDIT_BUTTON }}
            </div>
          </div>
        </div>
        <div v-else class="flex items-center">
          <div v-if="!props.isEditVisible" class="relative flex">
            <button
              type="button"
              class="flex p-[8px] text-icon_primary"
              :aria-label="MESSAGE_SHOW_EDIT"
              @mouseenter="showEditTooltip = true"
              @mouseleave="showEditTooltip = false"
              @focusin="showEditTooltip = true"
              @focusout="showEditTooltip = false"
              @click="handleOpenEdit"
            >
              <svg
                width="16"
                height="17"
                viewBox="0 0 16 17"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M11.3333 6.49998L9.49992 4.66665M10.9999 2.16665L4.11392 9.05263C3.91657 9.24998 3.80392 9.51355 3.80392 9.78865V11.3333H5.34858C5.62367 11.3333 5.88724 11.2207 6.08459 11.0234L12.9706 4.1374C13.157 3.95104 13.157 3.6496 12.9706 3.46324L10.9999 1.49257C10.8135 1.30621 10.5121 1.30621 10.3258 1.49257Z"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M3.33325 13.1667H12.6666"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                />
              </svg>
            </button>
            <div
              v-if="showEditTooltip"
              class="pointer-events-none absolute top-full right-0 mt-[6px] rounded bg-bg_primary px-[12px] py-[6px] text-small text-text_primary shadow-lg whitespace-nowrap"
            >
              {{ LABEL_EDIT_BUTTON }}
            </div>
          </div>
        </div>
      </div>
    </div>
    <div
      class="c-preview flex-1 min-h-0 p-[16px] relative"
      :class="[
        props.isFilter ? 'overflow-hidden' : 'overflow-auto',
        props.isSideMenuOpen ? 'c-side-menu-open' : '',
      ]"
    >
      <div v-html="renderedHtml"></div>
      <div
        v-if="props.isFilter"
        class="absolute inset-0 z-10 bg-primary/20 pointer-events-auto"
        style="backdrop-filter: blur(5px)"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch, onMounted, nextTick, onBeforeUnmount, ref } from 'vue'
import { marked } from 'marked'

marked.setOptions({
  breaks: true,
})

type Props = {
  data: string
  isFilter: boolean
  isSideMenuOpen: boolean
  canSync: boolean
  syncStatus: 'off' | 'syncing' | 'synced' | 'error'
  isSynced: boolean
  noteId: string
  isPreviewMode: boolean
  isEditVisible: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'toggleSync', noteId: string): void
  (e: 'openEdit'): void
  (e: 'restoreEdit'): void
}>()

const previewRef = ref<HTMLDivElement | null>(null)
const renderedHtml = ref<string>('')
const showSyncInfo = ref(false)
const showEditTooltip = ref(false)

const MESSAGE_SYNC_BUTTON_ON = chrome.i18n.getMessage('SYNC_BUTTON_ON') || 'Sync ON'
const MESSAGE_SYNC_BUTTON_OFF = chrome.i18n.getMessage('SYNC_BUTTON_OFF') || 'Sync OFF'
const LABEL_SYNC = chrome.i18n.getMessage('SYNC_LABEL') || 'Sync'
const MESSAGE_SYNC_INFO =
  chrome.i18n.getMessage('SYNC_INFO') ||
  'When sync is on, this note is available on all devices using the same Chrome account. When sync is off, it is saved only on this device.'
const MESSAGE_HIDE_PREVIEW = chrome.i18n.getMessage('HIDE_PREVIEW_PANEL') || 'Hide Preview'
const MESSAGE_SHOW_EDIT = chrome.i18n.getMessage('SHOW_EDIT_PANEL') || 'Show Edit'
const LABEL_EDIT_BUTTON = 'Edit'

onMounted(() => {
  setMinimumHeight()
  window.addEventListener('resize', setMinimumHeight)
  nextTick(setMinimumHeight)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', setMinimumHeight)
})

const handleClose = () => {
  emit('close')
}

const handleOpenEdit = () => {
  emit('openEdit')
}

// 高さをウィンドウに合わせて維持
const setMinimumHeight = () => {
  if (!previewRef.value) return
  const minHeight = window.innerHeight - 70
  previewRef.value.style.minHeight = `${minHeight}px`
}

watch(
  () => props.data,
  async (md) => {
    let html = await marked.parse(md || '')

    // チェックボックス化
    // - [x], - [ ] -> input type=checkbox
    html = html
      .replace(/\[x\]/g, "<input type='checkbox' checked='checked'>")
      .replace(/\[ \]/g, "<input type='checkbox'>")
    renderedHtml.value = html
  },
  { immediate: true }
)
</script>

<style scoped></style>
