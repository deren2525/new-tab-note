<template>
  <div class="flex w-full h-full flex-col">
    <div class="h-[35px] w-full bg-bg_primary flex justify-between">
      <span
        class="bg-bg_secondary px-[16px] inline-flex items-center h-full text-text_primary gap-[8px]"
      >
        Edit
        <button
          v-if="props.isPreviewMode"
          type="button"
          class="text-icon_primary"
          :aria-label="MESSAGE_HIDE_EDIT"
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
        <template v-if="!props.isPreviewMode">
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
                <!-- 同期完了アイコン -->
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
                <!-- 同期エラーアイコン -->
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
                <!-- 同期オフアイコン -->
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
              <!-- 同期オンオフボタン -->
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
            <div class="relative flex">
              <button
                type="button"
                class="flex p-[8px] text-icon_primary"
                :aria-label="MESSAGE_SHOW_PREVIEW"
                @mouseenter="showPreviewTooltip = true"
                @mouseleave="showPreviewTooltip = false"
                @focusin="showPreviewTooltip = true"
                @focusout="showPreviewTooltip = false"
                @click="handleOpenPreview"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2.55556 15C2.12778 15 1.7617 14.8478 1.45733 14.5434C1.15296 14.2391 1.00052 13.8727 1 13.4444V2.55556C1 2.12778 1.15244 1.7617 1.45733 1.45733C1.76222 1.15296 2.1283 1.00052 2.55556 1H13.4444C13.8722 1 14.2386 1.15244 14.5434 1.45733C14.8483 1.76222 15.0005 2.1283 15 2.55556V13.4444C15 13.8722 14.8478 14.2386 14.5434 14.5434C14.2391 14.8483 13.8727 15.0005 13.4444 15H2.55556ZM2.55556 13.4444H13.4444V4.11111H2.55556V13.4444ZM8 11.8889C6.93704 11.8889 5.98763 11.6006 5.15178 11.024C4.31593 10.4474 3.70978 9.69867 3.33333 8.77778C3.70926 7.85741 4.31541 7.10893 5.15178 6.53233C5.98815 5.95574 6.93755 5.66718 8 5.66667C9.06244 5.66615 10.0121 5.9547 10.849 6.53233C11.6859 7.10996 12.2918 7.85844 12.6667 8.77778C12.2907 9.69815 11.6849 10.4469 10.849 11.024C10.0131 11.6011 9.06348 11.8894 8 11.8889ZM8 10.7222C8.72592 10.7222 9.38704 10.5503 9.98333 10.2066C10.5796 9.86278 11.0463 9.38652 11.3833 8.77778C11.0463 8.16852 10.5796 7.692 9.98333 7.34822C9.38704 7.00444 8.72592 6.83281 8 6.83333C7.27407 6.83385 6.61296 7.00574 6.01667 7.349C5.42037 7.69226 4.9537 8.16852 4.61667 8.77778C4.9537 9.38704 5.42037 9.86355 6.01667 10.2073C6.61296 10.5511 7.27407 10.7227 8 10.7222ZM8 9.94444C8.32407 9.94444 8.59967 9.83115 8.82678 9.60455C9.05389 9.37796 9.16718 9.10237 9.16667 8.77778C9.16615 8.45318 9.05285 8.17785 8.82678 7.95178C8.6007 7.7257 8.32511 7.61215 8 7.61111C7.67489 7.61007 7.39955 7.72363 7.174 7.95178C6.94844 8.17992 6.83489 8.45526 6.83333 8.77778C6.83178 9.1003 6.94533 9.37589 7.174 9.60455C7.40267 9.83322 7.678 9.94652 8 9.94444Z"
                    fill="currentColor"
                  />
                </svg>
              </button>
              <div
                v-if="showPreviewTooltip"
                class="pointer-events-none absolute top-full right-0 mt-[6px] rounded bg-bg_primary px-[12px] py-[6px] text-small text-text_primary shadow-lg whitespace-nowrap"
              >
                {{ LABEL_PREVIEW_BUTTON }}
              </div>
            </div>
          </div>
          <div v-else class="flex items-center">
            <div class="relative flex">
              <button
                class="flex p-[8px] text-icon_primary"
                type="button"
                :aria-label="MESSAGE_SHOW_PREVIEW"
                @mouseenter="showPreviewTooltip = true"
                @mouseleave="showPreviewTooltip = false"
                @focusin="showPreviewTooltip = true"
                @focusout="showPreviewTooltip = false"
                @click="handleOpenPreview"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2.55556 15C2.12778 15 1.7617 14.8478 1.45733 14.5434C1.15296 14.2391 1.00052 13.8727 1 13.4444V2.55556C1 2.12778 1.15244 1.7617 1.45733 1.45733C1.76222 1.15296 2.1283 1.00052 2.55556 1H13.4444C13.8722 1 14.2386 1.15244 14.5434 1.45733C14.8483 1.76222 15.0005 2.1283 15 2.55556V13.4444C15 13.8722 14.8478 14.2386 14.5434 14.5434C14.2391 14.8483 13.8727 15.0005 13.4444 15H2.55556ZM2.55556 13.4444H13.4444V4.11111H2.55556V13.4444ZM8 11.8889C6.93704 11.8889 5.98763 11.6006 5.15178 11.024C4.31593 10.4474 3.70978 9.69867 3.33333 8.77778C3.70926 7.85741 4.31541 7.10893 5.15178 6.53233C5.98815 5.95574 6.93755 5.66718 8 5.66667C9.06244 5.66615 10.0121 5.9547 10.849 6.53233C11.6859 7.10996 12.2918 7.85844 12.6667 8.77778C12.2907 9.69815 11.6849 10.4469 10.849 11.024C10.0131 11.6011 9.06348 11.8894 8 11.8889ZM8 10.7222C8.72592 10.7222 9.38704 10.5503 9.98333 10.2066C10.5796 9.86278 11.0463 9.38652 11.3833 8.77778C11.0463 8.16852 10.5796 7.692 9.98333 7.34822C9.38704 7.00444 8.72592 6.83281 8 6.83333C7.27407 6.83385 6.61296 7.00574 6.01667 7.349C5.42037 7.69226 4.9537 8.16852 4.61667 8.77778C4.9537 9.38704 5.42037 9.86355 6.01667 10.2073C6.61296 10.5511 7.27407 10.7227 8 10.7222ZM8 9.94444C8.32407 9.94444 8.59967 9.83115 8.82678 9.60455C9.05389 9.37796 9.16718 9.10237 9.16667 8.77778C9.16615 8.45318 9.05285 8.17785 8.82678 7.95178C8.6007 7.7257 8.32511 7.61215 8 7.61111C7.67489 7.61007 7.39955 7.72363 7.174 7.95178C6.94844 8.17992 6.83489 8.45526 6.83333 8.77778C6.83178 9.1003 6.94533 9.37589 7.174 9.60455C7.40267 9.83322 7.678 9.94652 8 9.94444Z"
                    fill="currentColor"
                  />
                </svg>
              </button>
              <div
                v-if="showPreviewTooltip"
                class="pointer-events-none absolute top-full right-0 mt-[6px] rounded bg-bg_primary px-[12px] py-[6px] text-small text-text_primary shadow-lg whitespace-nowrap"
              >
                {{ LABEL_PREVIEW_BUTTON }}
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
    <div class="flex-1 min-h-0 flex flex-col relative">
      <textarea
        ref="textareaRef"
        class="flex-1 w-full h-full resize-none outline-none bg-transparent p-4 overflow-auto text-text_primary text-body"
        :value="props.modelValue"
        @input="handleInput"
        @keydown="handleKeydown"
      />
      <div
        v-if="props.noteUsageText"
        class="pointer-events-none absolute bottom-2 right-4 z-20 text-[11px] leading-none text-text_secondary bg-bg_secondary/80 rounded px-2 py-1"
      >
        {{ props.noteUsageLabel || 'Note size' }}: {{ props.noteUsageText }}
      </div>
      <div
        v-if="props.isFilter"
        class="absolute inset-0 z-10 bg-primary/20 pointer-events-auto flex items-center justify-center px-4"
        style="backdrop-filter: blur(5px)"
        @click="handleFilterTouch"
      >
        <div
          v-if="showTooltip"
          class="pointer-events-none max-w-[260px] w-full rounded bg-bg_primary text-text_primary text-small shadow-lg p-[10px] text-center"
        >
          <p class="whitespace-pre-line">{{ MESSAGE_RESUME_EDIT }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch, ref, nextTick, onMounted, onBeforeUnmount } from 'vue'

const MESSAGE_SYNC_BUTTON_ON = chrome.i18n.getMessage('SYNC_BUTTON_ON') || 'Sync ON'
const MESSAGE_SYNC_BUTTON_OFF = chrome.i18n.getMessage('SYNC_BUTTON_OFF') || 'Sync OFF'
const LABEL_SYNC = chrome.i18n.getMessage('SYNC_LABEL') || 'Sync'
const MESSAGE_SYNC_INFO =
  chrome.i18n.getMessage('SYNC_INFO') ||
  'When sync is on, this note is available on all devices using the same Chrome account. When sync is off, it is saved only on this device.'
const MESSAGE_HIDE_EDIT = chrome.i18n.getMessage('HIDE_EDIT_PANEL') || 'Hide Edit'
const MESSAGE_SHOW_PREVIEW = chrome.i18n.getMessage('SHOW_PREVIEW_PANEL') || 'Show Preview'
const LABEL_PREVIEW_BUTTON = 'Preview'

type Props = {
  isFilter: boolean
  isPreviewMode: boolean
  modelValue: string
  noteId: string
  isSynced: boolean
  syncStatus: 'off' | 'syncing' | 'synced' | 'error'
  canSync: boolean
  noteUsageText?: string
  noteUsageLabel?: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'openPreview'): void
  (e: 'update:modelValue', value: string): void
  (e: 'toggleSync', noteId: string): void
  (e: 'close'): void
}>()

const textareaRef = ref<HTMLTextAreaElement | null>(null)
const isComposing = ref(false)
const showSyncInfo = ref(false)
const showPreviewTooltip = ref(false)
const MESSAGE_RESUME_EDIT =
  chrome.i18n.getMessage('RESUME_EDIT_ALERT') || 'To resume editing, please clear the filter.'
const handleClose = () => {
  emit('close')
}

onMounted(() => {
  nextTick(adjustHeight)
  setMinimumHeight()
  window.addEventListener('resize', setMinimumHeight)

  const el = textareaRef.value
  if (!el) return
  el.addEventListener('compositionstart', () => {
    isComposing.value = true
  })
  el.addEventListener('compositionend', () => {
    isComposing.value = false
  })
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', setMinimumHeight)
})

/**
 * プレビュー表示押下
 */
const handleOpenPreview = () => {
  emit('openPreview')
}

/**
 * 入力更新
 * @param {Event} e 入力イベント
 */
const handleInput = (e: Event) => {
  emit('update:modelValue', (e.target as HTMLTextAreaElement).value)
}

/**
 * テキストエリアの最小高さ自動化
 */
const setMinimumHeight = () => {
  if (!textareaRef.value) return
  const minHeight = window.innerHeight - 70
  textareaRef.value.style.minHeight = `${minHeight}px`
}

/**
 * テキストエリアの高さ自動調整
 */
const adjustHeight = () => {
  const el = textareaRef.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = el.scrollHeight + 'px'
}

/**
 * Tab/Enter やショートカットキーに応じたMarkdown編集補助
 * @param {KeyboardEvent} e キーイベント
 */
const handleKeydown = (e: KeyboardEvent) => {
  if (isComposing.value) return

  const el = textareaRef.value
  if (!el) return
  const { selectionStart, selectionEnd, value } = el

  // Ctrl+B / Cmd+B -> 太字
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
    e.preventDefault()
    wrapSelectionExec('**')
    return
  }

  // Ctrl+I / Cmd+I -> イタリック
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'i') {
    e.preventDefault()
    wrapSelectionExec('*')
    return
  }

  // Ctrl+K -> リンク
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    wrapLinkExec()
    return
  }

  if (e.key === 'Tab') {
    const { selectionStart, selectionEnd, value } = el
    const beforeCursor = value.substring(0, selectionStart)
    const afterCursor = value.substring(selectionEnd)

    const beforeLines = beforeCursor.split('\n')
    const currentLineIndex = beforeLines.length - 1
    const currentLine = beforeLines[currentLineIndex]

    const listPattern = /^(\s*)([*\-+]|\d+\.)\s+/

    if (listPattern.test(currentLine)) {
      e.preventDefault()

      const match = currentLine.match(listPattern)
      const indent = match?.[1] ?? ''
      const restLine = currentLine.slice(indent.length)

      let newLine = ''
      if (e.shiftKey) {
        // Shift+Tab -> インデントを2スペース減らす
        const newIndent = indent.length >= 2 ? indent.slice(0, -2) : ''
        newLine = newIndent + restLine
      } else {
        // Tab -> インデントを2スペース増やす
        newLine = '  ' + currentLine
      }

      beforeLines[currentLineIndex] = newLine
      const newBefore = beforeLines.join('\n')
      const newValue = newBefore + afterCursor

      emit('update:modelValue', newValue)

      nextTick(() => {
        const cursorOffset = newLine.length - currentLine.length
        const newCursor = selectionStart + cursorOffset
        el.selectionStart = el.selectionEnd = newCursor
      })
      return
    }
  }

  // Enterでリスト補完
  if (e.key === 'Enter') {
    const lines = value.substring(0, selectionStart).split('\n')
    const lastLine = lines[lines.length - 1]

    // 空のリスト記号だけ（リスト削除判定）
    const regexEmptyList = /^\s*([*-]|\d+\.)\s?$/
    if (regexEmptyList.test(lastLine)) {
      e.preventDefault()
      // 1行削除してカーソル位置を調整
      lines.pop()
      const before = lines.join('\n')
      const after = value.substring(selectionStart)
      const newValue = before + (before ? '\n' : '') + after

      emit('update:modelValue', newValue)
      nextTick(() => {
        el.selectionStart = el.selectionEnd = before.length + (before ? 1 : 0)
      })
      return
    }

    // * - 数字リスト補完
    const regexList = /^[*-]\s+/
    const regexListChild = /^\s+[*-]\s+/
    const regexNumberList = /^[0-9]+\.\s+/
    let matched: RegExpMatchArray | null = null
    let insertText = ''

    if ((matched = lastLine.match(regexList))) {
      insertText = '\n' + matched[0]
    } else if ((matched = lastLine.match(regexListChild))) {
      insertText = '\n' + matched[0]
    } else if ((matched = lastLine.match(regexNumberList))) {
      const num = parseInt(matched[0], 10)
      insertText = `\n${num + 1}. `
    }

    if (insertText) {
      e.preventDefault()
      const before = value.substring(0, selectionStart)
      const after = value.substring(selectionStart)
      const newValue = before + insertText + after
      emit('update:modelValue', newValue)
      nextTick(() => {
        el.selectionEnd = before.length + insertText.length
        el.selectionStart = el.selectionEnd
      })
      return
    }
  }
}

/**
 * 選択範囲をMarkdownリンク形式へ変換（Ctrl/Cmd+K）
 */
const wrapLinkExec = () => {
  const el = textareaRef.value
  if (!el) return
  const { selectionStart, selectionEnd, value } = el
  const selected = value.substring(selectionStart, selectionEnd) || ''
  const urlPattern = /^(https?:\/\/|ftp:\/\/|www\.)[^\s]+$/i

  let linkText = ''
  let newSelectionStart = 0
  let newSelectionEnd = 0

  if (urlPattern.test(selected)) {
    // 選択部分がURLの場合
    linkText = `[](${selected})`
    newSelectionStart = selectionStart + 1
    newSelectionEnd = selectionStart + 1
  } else {
    // 選択部分がテキストの場合
    linkText = `[${selected || 'リンクテキスト'}](url)`
    const linkStart = selectionStart + linkText.indexOf('(') + 1
    const linkEnd = linkStart + 'url'.length
    newSelectionStart = linkStart
    newSelectionEnd = linkEnd
  }

  el.focus()
  if (document.queryCommandSupported && document.queryCommandSupported('insertText')) {
    el.setSelectionRange(selectionStart, selectionEnd)
    document.execCommand('insertText', false, linkText)
    emit('update:modelValue', el.value)
    nextTick(() => {
      el.selectionStart = newSelectionStart
      el.selectionEnd = newSelectionEnd
    })
  } else {
    const newValue = value.substring(0, selectionStart) + linkText + value.substring(selectionEnd)
    emit('update:modelValue', newValue)
    nextTick(() => {
      el.selectionStart = newSelectionStart
      el.selectionEnd = newSelectionEnd
      el.focus()
    })
  }
}

/**
 * 選択範囲を指定wrapperで囲い、元の選択位置を維持
 * @param {string} wrapper 囲み文字（例: "*" や "**"）
 */
const wrapSelectionExec = (wrapper: string) => {
  const el = textareaRef.value
  if (!el) return
  const { selectionStart, selectionEnd, value } = el
  const selected = value.substring(selectionStart, selectionEnd)
  const newText = wrapper + selected + wrapper

  el.focus()
  if (document.queryCommandSupported && document.queryCommandSupported('insertText')) {
    el.setSelectionRange(selectionStart, selectionEnd)
    document.execCommand('insertText', false, newText)
    emit('update:modelValue', el.value)
    nextTick(() => {
      el.selectionStart = selectionStart + wrapper.length
      el.selectionEnd = selectionEnd + wrapper.length
    })
  } else {
    const newValue = value.substring(0, selectionStart) + newText + value.substring(selectionEnd)
    emit('update:modelValue', newValue)
    nextTick(() => {
      el.selectionStart = selectionStart + wrapper.length
      el.selectionEnd = selectionEnd + wrapper.length
      el.focus()
    })
  }
}

const showTooltip = ref(false)
let tooltipTimeout: ReturnType<typeof setTimeout> | null = null

/**
 * フィルター中にタップした時にツールチップを一定時間表示させる
 */
const handleFilterTouch = () => {
  showTooltip.value = true
  if (tooltipTimeout) {
    clearTimeout(tooltipTimeout)
  }
  tooltipTimeout = setTimeout(() => {
    showTooltip.value = false
  }, 3000)
}

// filter
watch(
  () => props.isFilter,
  (is) => {
    if (!textareaRef.value) return
    textareaRef.value.readOnly = is
  },
  { immediate: true }
)
defineExpose({ textareaRef })
</script>

<style scoped></style>
