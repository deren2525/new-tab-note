<template>
  <div class="flex w-full h-full flex-col border-l border-border_primary">
    <div class="h-[35px] w-full bg-bg_primary flex justify-between">
      <span class="bg-bg_secondary px-[16px] inline-flex items-center h-full gap-[8px]"
        >Preview
        <button class="text-icon_primary" @click="handleRemovePreview">
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
        <button class="flex p-[8px] text-icon_primary" @click="handleRemovePreview">
          <svg
            width="16"
            height="17"
            viewBox="0 0 16 17"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M13.3334 9.16665V4.33233C13.3334 4.22625 13.2913 4.12451 13.2163 4.04949L11.1172 1.95047C11.0422 1.87545 10.9405 1.83331 10.8344 1.83331H3.06675C2.84583 1.83331 2.66675 2.0124 2.66675 2.23331V14.7666C2.66675 14.9876 2.84583 15.1666 3.06675 15.1666H9.33341"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M10.6667 1.83331V4.09998C10.6667 4.32089 10.8458 4.49998 11.0667 4.49998H13.3334"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M10.6667 13.1667H14.6667M14.6667 13.1667L12.6667 11.1667M14.6667 13.1667L12.6667 15.1667"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
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

type Props = {
  data: string
  isFilter: boolean
  isSideMenuOpen: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'removePreview'): void
}>()

const previewRef = ref<HTMLDivElement | null>(null)
const renderedHtml = ref<string>('')

onMounted(() => {
  setMinimumHeight()
  window.addEventListener('resize', setMinimumHeight)
  nextTick(setMinimumHeight)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', setMinimumHeight)
})

const handleRemovePreview = () => {
  emit('removePreview')
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
