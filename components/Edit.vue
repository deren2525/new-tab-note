<template>
  <div class="flex w-full h-full flex-col">
    <div class="h-[35px] w-full bg-bg_primary flex justify-between">
      <span class="bg-bg_secondary px-[16px] inline-flex items-center h-full text-text_primary"
        >Edit</span
      >
      <div class="flex">
        <div v-if="props.canSync" class="relative flex items-center gap-[4px]">
          <div class="flex items-center gap-[4px]">
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

          <button class="flex p-[8px] text-icon_primary" @click="handleFilter(props.isFilter)">
            <svg
              v-if="isFilter"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M13 10.6667L11.3499 8.40253"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M8 11.6666V9.33331"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M3 10.6667L4.64597 8.40826"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M2 5.33331C4.4 10.6666 11.6 10.6666 14 5.33331"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <svg
              v-else
              width="16"
              height="17"
              viewBox="0 0 16 17"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2 9.16669C4.4 3.83335 11.6 3.83335 14 9.16669"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M8 11.8333C6.8954 11.8333 6 10.9379 6 9.83331C6 8.72871 6.8954 7.83331 8 7.83331C9.1046 7.83331 10 8.72871 10 9.83331C10 10.9379 9.1046 11.8333 8 11.8333Z"
                fill="currentColor"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
          <button
            v-if="!props.isPreviewMode"
            class="flex p-[8px] text-icon_primary"
            @click="handleOpenPreview"
          >
            <svg
              width="16"
              height="17"
              viewBox="0 0 16 17"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8.66659 14.5H2.66659C1.93021 14.5 1.33325 13.9031 1.33325 13.1667V3.83333C1.33325 3.09695 1.93021 2.5 2.66659 2.5H13.3333C14.0697 2.5 14.6666 3.09695 14.6666 3.83333V9.83333"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
              />
              <path
                d="M8 2.5L8 14.5"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M13.4161 13.9123C13.7769 13.5505 14 13.0513 14 12.5C14 11.3954 13.1046 10.5 12 10.5C10.8954 10.5 10 11.3954 10 12.5C10 13.6046 10.8954 14.5 12 14.5C12.5533 14.5 13.054 14.2753 13.4161 13.9123ZM13.4161 13.9123L14.6667 15.1667"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
          <div
            v-if="showTooltip"
            class="absolute z-20 top-full mt-[10px] w-[230px]"
            :class="[props.isPreviewMode ? 'left-1/2 -translate-x-1/2' : 'right-[16px] ']"
          >
            <div
              class="relative bg-bg_primary text-text_primary text-body rounded px-[12px] py-[8px]"
            >
              <p>
                {{ MESSAGE_RESUME_EDIT }}
              </p>
            </div>
          </div>
        </div>
        <div v-else class="flex items-center">
          <button class="flex p-[8px] text-icon_primary" @click="handleFilter(props.isFilter)">
            <svg
              v-if="isFilter"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M13 10.6667L11.3499 8.40253"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M8 11.6666V9.33331"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M3 10.6667L4.64597 8.40826"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M2 5.33331C4.4 10.6666 11.6 10.6666 14 5.33331"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <svg
              v-else
              width="16"
              height="17"
              viewBox="0 0 16 17"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2 9.16669C4.4 3.83335 11.6 3.83335 14 9.16669"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M8 11.8333C6.8954 11.8333 6 10.9379 6 9.83331C6 8.72871 6.8954 7.83331 8 7.83331C9.1046 7.83331 10 8.72871 10 9.83331C10 10.9379 9.1046 11.8333 8 11.8333Z"
                fill="currentColor"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
          <button
            v-if="!props.isPreviewMode"
            class="flex p-[8px] text-icon_primary"
            @click="handleOpenPreview"
          >
            <svg
              width="16"
              height="17"
              viewBox="0 0 16 17"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8.66659 14.5H2.66659C1.93021 14.5 1.33325 13.9031 1.33325 13.1667V3.83333C1.33325 3.09695 1.93021 2.5 2.66659 2.5H13.3333C14.0697 2.5 14.6666 3.09695 14.6666 3.83333V9.83333"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
              />
              <path
                d="M8 2.5L8 14.5"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M13.4161 13.9123C13.7769 13.5505 14 13.0513 14 12.5C14 11.3954 13.1046 10.5 12 10.5C10.8954 10.5 10 11.3954 10 12.5C10 13.6046 10.8954 14.5 12 14.5C12.5533 14.5 13.054 14.2753 13.4161 13.9123ZM13.4161 13.9123L14.6667 15.1667"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
        </div>
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
        class="absolute inset-0 z-10 bg-primary/20 pointer-events-auto"
        style="backdrop-filter: blur(5px)"
        @click="handleFilterTouch"
      ></div>
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
  (e: 'filter', isFilter: boolean): void
  (e: 'openPreview'): void
  (e: 'update:modelValue', value: string): void
  (e: 'toggleSync', noteId: string): void
}>()

const textareaRef = ref<HTMLTextAreaElement | null>(null)
const isComposing = ref(false)
const showSyncInfo = ref(false)
const MESSAGE_RESUME_EDIT =
  chrome.i18n.getMessage('RESUME_EDIT_ALERT') || 'To resume editing, please clear the filter.'

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
 * フィルターモードのON/OFFのトグル
 * @param {boolean} isFilter 現在のフィルター状態
 */
const handleFilter = (isFilter: boolean) => {
  emit('filter', !isFilter)
}

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
