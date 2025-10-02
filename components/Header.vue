<template>
  <div class="flex w-full h-[35px] border-b border-border_primary items-center px-[8px]">
    <div class="relative ml-auto flex items-center">
      <button
        class="flex p-[8px] text-icon_primary"
        type="button"
        @click="handleFilter(props.isFilter)"
      >
        <svg
          v-if="props.isFilter"
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

      <button @click="isOpen = !isOpen" class="flex p-[8px] bg-bg_primary text-icon_primary">
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g clip-path="url(#clip0_68_264)">
            <path
              d="M4.66666 2.22732C5.67918 1.63985 6.82938 1.33136 7.99999 1.33332C11.682 1.33332 14.6667 4.32599 14.6667 8.01732C14.6667 13.452 9.22599 9.61266 8.17466 11.284C7.91132 11.7027 8.19599 12.224 8.54466 12.574C8.75391 12.7839 8.8714 13.0682 8.8714 13.3647C8.8714 13.6611 8.75391 13.9454 8.54466 14.1553C8.19599 14.5053 7.72132 14.714 7.23132 14.6573C3.91132 14.2753 1.33332 11.448 1.33332 8.01732C1.33134 6.84088 1.6407 5.68486 2.22999 4.66666"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
            />
            <path
              d="M11.6666 8.66666C12.2189 8.66666 12.6666 8.21894 12.6666 7.66666C12.6666 7.11437 12.2189 6.66666 11.6666 6.66666C11.1143 6.66666 10.6666 7.11437 10.6666 7.66666C10.6666 8.21894 11.1143 8.66666 11.6666 8.66666Z"
              stroke="currentColor"
              stroke-width="1.5"
            />
            <path
              d="M4.33331 8.66666C4.8856 8.66666 5.33331 8.21894 5.33331 7.66666C5.33331 7.11437 4.8856 6.66666 4.33331 6.66666C3.78103 6.66666 3.33331 7.11437 3.33331 7.66666C3.33331 8.21894 3.78103 8.66666 4.33331 8.66666Z"
              stroke="currentColor"
              stroke-width="1.5"
            />
            <path
              d="M7.39002 4.66666C7.39002 4.93187 7.28466 5.18623 7.09712 5.37376C6.90959 5.5613 6.65523 5.66666 6.39001 5.66666C6.1248 5.66666 5.87044 5.5613 5.68291 5.37376C5.49537 5.18623 5.39001 4.93187 5.39001 4.66666C5.39001 4.40144 5.49537 4.14709 5.68291 3.95955C5.87044 3.77201 6.1248 3.66666 6.39001 3.66666C6.65523 3.66666 6.90959 3.77201 7.09712 3.95955C7.28466 4.14709 7.39002 4.40144 7.39002 4.66666ZM10.6667 4.66666C10.6667 4.93187 10.5613 5.18623 10.3738 5.37376C10.1863 5.5613 9.9319 5.66666 9.66668 5.66666C9.40147 5.66666 9.14711 5.5613 8.95958 5.37376C8.77204 5.18623 8.66668 4.93187 8.66668 4.66666C8.66668 4.40144 8.77204 4.14709 8.95958 3.95955C9.14711 3.77201 9.40147 3.66666 9.66668 3.66666C9.9319 3.66666 10.1863 3.77201 10.3738 3.95955C10.5613 4.14709 10.6667 4.40144 10.6667 4.66666Z"
              stroke="currentColor"
              stroke-width="1.5"
            />
          </g>
          <defs>
            <clipPath id="clip0_68_264">
              <rect width="16" height="16" fill="white" />
            </clipPath>
          </defs>
        </svg>
      </button>

      <div
        v-if="isOpen"
        class="absolute right-0 top-[25px] w-32 bg-bg_primary border border-border_primary rounded shadow z-50"
      >
        <ul class="py-1">
          <li
            v-for="option in props.themeOptions"
            :key="option.name"
            @click.stop="handleChangeTheme(option.name)"
            class="flex items-center gap-[8px] px-[16px] py-[8px] cursor-pointer"
          >
            <span
              class="inline-block w-[12px] h-[12px] rounded-full cursor-pointer"
              :style="{
                backgroundColor: option.color,
                border: `1px solid ${option.border || '#ccc'}`,
              }"
            ></span>
            {{ option.name }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

type Props = {
  currentThemeColor: string
  themeOptions: { name: string; color: string; border: string }[]
  isFilter: boolean
}
const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'changeTheme', colorName: string): void
  (e: 'filter', value: boolean): void
}>()

const isOpen = ref(false)

const handleChangeTheme = (name: string) => {
  emit('changeTheme', name.toLowerCase())
  isOpen.value = false
}

/**
 * フィルターモードのON/OFFのトグル
 * @param {boolean} isFilter 現在のフィルター状態
 */
const handleFilter = (isFilter: boolean) => {
  emit('filter', !isFilter)
}
</script>
