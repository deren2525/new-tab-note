<template>
  <div class="flex w-full h-full flex-col">
    <div class="h-[35px] w-full bg-bg_primary flex justify-between">
      <span class="bg-bg_secondary px-[16px] inline-flex items-center h-full text-text_primary"
        >Edit</span
      >
      <div class="flex">
        <div class="relative flex">
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
              <p>編集を再開するにはフィルターを解除してください</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="flex-1 min-h-0 flex flex-col relative">
      <textarea
        ref="textareaRef"
        class="flex-1 w-full h-full resize-none outline-none bg-transparent p-4 text-sm overflow-auto text-text_primary"
        :value="props.modelValue"
        @input="handleInput"
        @keydown="handleKeydown"
      />
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

type Props = {
  isFilter: boolean
  isPreviewMode: boolean
  modelValue: string
  noteId: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'filter', isFilter: boolean): void
  (e: 'openPreview'): void
  (e: 'update:modelValue', value: string): void
}>()

const isComposing = ref(false)

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

const textareaRef = ref<HTMLTextAreaElement | null>(null)

const handleFilter = (isFilter: boolean) => {
  emit('filter', !isFilter)
}

const handleOpenPreview = () => {
  emit('openPreview')
}

const handleInput = (e: Event) => {
  emit('update:modelValue', (e.target as HTMLTextAreaElement).value)
}

// テキストエリア最低高さ
const setMinimumHeight = () => {
  console.log(textareaRef.value, 'textareaRef.value')
  if (!textareaRef.value) return
  const minHeight = window.innerHeight - 70
  textareaRef.value.style.minHeight = `${minHeight}px`
}

// テキストエリア高さ自動調整
const adjustHeight = () => {
  const el = textareaRef.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = el.scrollHeight + 'px'
}

// Tab/Enterキー対応（リスト補完など）
const handleKeydown = (e: KeyboardEvent) => {
  if (isComposing.value) {
    // 日本語変換中なら処理をスキップ
    return
  }

  const el = textareaRef.value
  if (!el) return

  console.log(e.key)

  // --- 1. Ctrl+B / Cmd+B → 太字 ---
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
    e.preventDefault()
    wrapSelectionExec('**')
    return
  }

  // --- 2. Ctrl+I / Cmd+I → イタリック ---
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'i') {
    e.preventDefault()
    wrapSelectionExec('*')
    return
  }

  // --- 3. Ctrl+K → リンク ---
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    wrapLinkExec()
    return
  }

  // Tabでスペース2つ
  if (e.key === 'Tab') {
    e.preventDefault()
    const { selectionStart, selectionEnd, value } = el
    const before = value.substring(0, selectionStart)
    const after = value.substring(selectionEnd)
    const newValue = before + '\t' + after
    emit('update:modelValue', newValue)
    nextTick(() => {
      el.selectionStart = el.selectionEnd = selectionStart + 2
    })
    return
  }

  // Enterでリスト補完
  if (e.key === 'Enter') {
    const { selectionStart, value } = el
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
        el.selectionStart = el.selectionEnd = before.length + insertText.length
      })
      return
    }
  }
}

// [](url) 生成（Ctrl+K）
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
    // fallback: 手動置換
    const newValue = value.substring(0, selectionStart) + linkText + value.substring(selectionEnd)
    emit('update:modelValue', newValue)
    nextTick(() => {
      el.selectionStart = newSelectionStart
      el.selectionEnd = newSelectionEnd
      el.focus()
    })
  }
}

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
    // fallback: 手動置換
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

const handleFilterTouch = () => {
  showTooltip.value = true
  if (tooltipTimeout) {
    clearTimeout(tooltipTimeout)
  }
  tooltipTimeout = setTimeout(() => {
    showTooltip.value = false
  }, 3000)
}

// filter（読み取り専用）制御
watch(
  () => props.isFilter,
  (is) => {
    if (!textareaRef.value) return
    textareaRef.value.readOnly = is
  },
  { immediate: true }
)
defineExpose({ textareaRef }) // 必要なら外部からref参照
</script>

<style scoped></style>
