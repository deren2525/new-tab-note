<template>
  <div class="flex w-full h-[35px] border-b border-border_primary items-center px-[8px]">
    <div class="relative ml-auto">
      <button @click="isOpen = !isOpen" class="relative bg-bg_primary text-icon_primary">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M20.5096 9.54C20.4243 9.77932 20.2918 9.99909 20.12 10.1863C19.9483 10.3735 19.7407 10.5244 19.5096 10.63C18.2796 11.1806 17.2346 12.0745 16.5002 13.2045C15.7659 14.3345 15.3733 15.6524 15.3696 17C15.3711 17.4701 15.418 17.9389 15.5096 18.4C15.5707 18.6818 15.5747 18.973 15.5215 19.2564C15.4682 19.5397 15.3588 19.8096 15.1996 20.05C15.0649 20.2604 14.8877 20.4403 14.6793 20.5781C14.4709 20.7158 14.2359 20.8085 13.9896 20.85C13.4554 20.9504 12.9131 21.0006 12.3696 21C11.1638 21.0006 9.97011 20.7588 8.85952 20.2891C7.74893 19.8194 6.74405 19.1314 5.90455 18.2657C5.06506 17.4001 4.40807 16.3747 3.97261 15.2502C3.53714 14.1257 3.33208 12.9252 3.36959 11.72C3.4472 9.47279 4.3586 7.33495 5.92622 5.72296C7.49385 4.11097 9.60542 3.14028 11.8496 3H12.3596C14.0353 3.00042 15.6777 3.46869 17.1017 4.35207C18.5257 5.23544 19.6748 6.49885 20.4196 8C20.6488 8.47498 20.6812 9.02129 20.5096 9.52V9.54Z"
            stroke="currentColor"
            stroke-width="1.5"
          />
          <path
            d="M8 16.01L8.01 15.9989"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M6 12.01L6.01 11.9989"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M8 8.01001L8.01 7.9989"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M12 6.01001L12.01 5.9989"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M16 8.01001L16.01 7.9989"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
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
}
const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'changeTheme', colorName: string): void
}>()

const isOpen = ref(false)

const handleChangeTheme = (name: string) => {
  emit('changeTheme', name.toLowerCase())
  isOpen.value = false
}
</script>
