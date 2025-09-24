<template>
  <div
    class="flex h-full border-r border-border_primary flex-col min-h-0"
    :class="[props.isOpenMenu ? 'w-[225px] min-w-[225px]' : 'w-[48px] min-w-[48px]']"
  >
    <!-- menu open/close -->
    <div
      class="p-[12px] border-b border-border_primary flex"
      :class="[props.isOpenMenu ? 'justify-end' : 'justify-center']"
    >
      <button @click.stop="handleToggleMenu" class="text-icon_primary">
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
          data-rtl-flip=""
          class="icon max-md:hidden"
        >
          <path
            d="M6.83496 3.99992C6.38353 4.00411 6.01421 4.0122 5.69824 4.03801C5.31232 4.06954 5.03904 4.12266 4.82227 4.20012L4.62207 4.28606C4.18264 4.50996 3.81498 4.85035 3.55859 5.26848L3.45605 5.45207C3.33013 5.69922 3.25006 6.01354 3.20801 6.52824C3.16533 7.05065 3.16504 7.71885 3.16504 8.66301V11.3271C3.16504 12.2712 3.16533 12.9394 3.20801 13.4618C3.25006 13.9766 3.33013 14.2909 3.45605 14.538L3.55859 14.7216C3.81498 15.1397 4.18266 15.4801 4.62207 15.704L4.82227 15.79C5.03904 15.8674 5.31234 15.9205 5.69824 15.9521C6.01398 15.9779 6.383 15.986 6.83398 15.9902L6.83496 3.99992ZM18.165 11.3271C18.165 12.2493 18.1653 12.9811 18.1172 13.5702C18.0745 14.0924 17.9916 14.5472 17.8125 14.9648L17.7295 15.1415C17.394 15.8 16.8834 16.3511 16.2568 16.7353L15.9814 16.8896C15.5157 17.1268 15.0069 17.2285 14.4102 17.2773C13.821 17.3254 13.0893 17.3251 12.167 17.3251H7.83301C6.91071 17.3251 6.17898 17.3254 5.58984 17.2773C5.06757 17.2346 4.61294 17.1508 4.19531 16.9716L4.01855 16.8896C3.36014 16.5541 2.80898 16.0434 2.4248 15.4169L2.27051 15.1415C2.03328 14.6758 1.93158 14.167 1.88281 13.5702C1.83468 12.9811 1.83496 12.2493 1.83496 11.3271V8.66301C1.83496 7.74072 1.83468 7.00898 1.88281 6.41985C1.93157 5.82309 2.03329 5.31432 2.27051 4.84856L2.4248 4.57317C2.80898 3.94666 3.36012 3.436 4.01855 3.10051L4.19531 3.0175C4.61285 2.83843 5.06771 2.75548 5.58984 2.71281C6.17898 2.66468 6.91071 2.66496 7.83301 2.66496H12.167C13.0893 2.66496 13.821 2.66468 14.4102 2.71281C15.0069 2.76157 15.5157 2.86329 15.9814 3.10051L16.2568 3.25481C16.8833 3.63898 17.394 4.19012 17.7295 4.84856L17.8125 5.02531C17.9916 5.44285 18.0745 5.89771 18.1172 6.41985C18.1653 7.00898 18.165 7.74072 18.165 8.66301V11.3271ZM8.16406 15.995H12.167C13.1112 15.995 13.7794 15.9947 14.3018 15.9521C14.8164 15.91 15.1308 15.8299 15.3779 15.704L15.5615 15.6015C15.9797 15.3451 16.32 14.9774 16.5439 14.538L16.6299 14.3378C16.7074 14.121 16.7605 13.8478 16.792 13.4618C16.8347 12.9394 16.835 12.2712 16.835 11.3271V8.66301C16.835 7.71885 16.8347 7.05065 16.792 6.52824C16.7605 6.14232 16.7073 5.86904 16.6299 5.65227L16.5439 5.45207C16.32 5.01264 15.9796 4.64498 15.5615 4.3886L15.3779 4.28606C15.1308 4.16013 14.8165 4.08006 14.3018 4.03801C13.7794 3.99533 13.1112 3.99504 12.167 3.99504H8.16406C8.16407 3.99667 8.16504 3.99829 8.16504 3.99992L8.16406 15.995Z"
          ></path>
        </svg>
      </button>
    </div>
    <div class="flex h-full flex-col min-h-0">
      <!-- menu open -->
      <div v-if="isOpenMenu" class="flex-1 flex flex-col min-h-0">
        <div class="mb-[8px] border-b border-border_primary p-[8px]">
          <!-- create note -->
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
            {{ MESSAGE_NEW_NOTE }}
          </button>
        </div>
        <!-- note list -->
        <div class="flex-1 overflow-y-auto min-h-0">
          <ul class="pb-[16px]">
            <li
              v-for="menu in props.menus"
              :key="menu.id"
              class="flex h-[36px] px-[8px] cursor-pointer items-center gap-[4px] relative group text-small"
              :class="[props.currentNoteId === menu.id ? 'bg-bg_active' : '']"
              @click="handleChangeNote(menu.id)"
            >
              <span class="flex items-center justify-center w-[16px] pointer-events-none">
                <!-- 同期中アイコン -->
                <svg
                  v-if="getStatus(menu.id) === 'syncing'"
                  class="h-3 w-3 animate-spin text-icon_primary"
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
                  v-else-if="getStatus(menu.id) === 'synced'"
                  class="h-3 w-3 text-green-500"
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
                  v-else-if="getStatus(menu.id) === 'error'"
                  class="h-3 w-3 text-red-500"
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
                  v-else-if="getStatus(menu.id) === 'off'"
                  class="h-3.5 w-3.5 text-text_secondary"
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
              </span>
              <span class="flex-1 truncate pr-[32px]">
                {{ (menu.text.trim() || 'new note').substring(0, 25) }}
              </span>
              <button
                v-if="menu.id === props.currentNoteId"
                class="bg-bg_delete px-[8px] opacity-0 group-hover:opacity-100 transition-opacity absolute right-0 h-[36px] text-text_button_primary"
                @click.stop="handleDeleteNote(menu.id)"
                title="Delete"
                tabindex="-1"
              >
                <svg
                  width="16"
                  height="17"
                  viewBox="0 0 16 17"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M13.3333 6.5L12.0033 14.0642C11.8912 14.7017 11.3374 15.1667 10.6902 15.1667H5.30979C4.66249 15.1667 4.10869 14.7017 3.9966 14.0642L2.66663 6.5"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M14 4.49998H10.25M10.25 4.49998V3.16665C10.25 2.43027 9.65307 1.83331 8.91667 1.83331H7.08333C6.34695 1.83331 5.75 2.43027 5.75 3.16665V4.49998M10.25 4.49998H5.75M2 4.49998H5.75"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
            </li>
          </ul>
        </div>
      </div>
      <div v-else class="p-[8px]">
        <!-- new note button -->
        <div class="flex items-center justify-center">
          <button
            class="p-[8px] bg-bg_button_primary rounded-[4px] text-text_button_primary"
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
          </button>
        </div>
      </div>
      <div
        v-if="props.isOpenMenu && props.syncUsageText"
        class="shrink-0 border-t border-border_primary px-[12px] py-[12px]"
      >
        <div class="flex flex-col gap-[2px] text-small leading-tight text-text_secondary">
          <span class="tracking-wide text-small text-text_secondary/70">
            {{ props.syncUsageLabel || 'Sync storage usage' }}
          </span>
          <span class="text-text_primary text-small">{{ props.syncUsageText }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const MESSAGE_NEW_NOTE = chrome.i18n.getMessage('NEW_NOTE') || 'New Note'

type SyncStatus = 'off' | 'syncing' | 'synced' | 'error'

type Props = {
  menus: { id: string; text: string; isSynced: boolean }[]
  currentNoteId: string
  isOpenMenu: boolean
  syncStatuses: Record<string, SyncStatus>
  syncUsageText?: string
  syncUsageLabel?: string
}
const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'delete', menuId: string): void
  (e: 'change', menuId: string): void
  (e: 'create'): void
  (e: 'toggleMenu', isOpenMenu: boolean): void
}>()

/**
 * 同期ステータス取得
 * @param {string} id ノートid
 */
const getStatus = (id: string): SyncStatus => {
  return (
    props.syncStatuses?.[id] ??
    (props.menus.find((menu) => menu.id === id)?.isSynced ? 'synced' : 'off')
  )
}

/**
 * ノート削除押下
 * @param {string} noteId ノートID
 */
const handleDeleteNote = (noteId: string) => {
  emit('delete', noteId)
}
/**
 * 新規ノート作成押下
 */
const handleCreateNote = () => {
  emit('create')
}
/**
 * 選択ノート変更押下
 * @param {string} noteId ノートID
 */
const handleChangeNote = (noteId: string) => {
  emit('change', noteId)
}

/**
 * サイドメニューの開閉トグル
 */
const handleToggleMenu = () => {
  emit('toggleMenu', !props.isOpenMenu)
}
</script>

<style scoped></style>
