<template>
  <div class="min-h-screen w-full box-border text-text_black font-jp">
    <Header
      @change-theme="changeTheme"
      :current-theme-color="theme"
      :theme-options="themeOptions"
    />
    <div class="w-full h-[calc(100svh-35px)] flex">
      <SideMenu
        :menus="notes"
        :current-note-id="currentId"
        :is-open-menu="isOpenSideMenu"
        @delete="deleteNote"
        @create="createNote"
        @change="changeNote"
        @toggle-menu="(v) => (isOpenSideMenu = v)"
      />
      <div class="bg-bg_secondary w-full flex">
        <EmptyState v-if="!notes.length" @create="createNote" />
        <template v-else>
          <Edit
            v-model="text"
            :is-filter="isFilter"
            :is-preview-mode="isPreviewMode"
            note-id=""
            @filter="(v) => (isFilter = v)"
            @openPreview="isPreviewMode = true"
          />
          <Preview
            v-if="isPreviewMode"
            :data="text"
            :is-filter="isFilter"
            :is-side-menu-open="isOpenSideMenu"
            @removePreview="isPreviewMode = false"
          />
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import Header from '@/components/Header.vue'
import SideMenu from '@/components/SideMenu.vue'
import Edit from '@/components/Edit.vue'
import Preview from '@/components/Preview.vue'
import EmptyState from '@/components/EmptyState.vue'

type Note = {
  id: string
  text: string
}
type Theme = (typeof themeOptions)[number]['name']

const notes = ref<Note[]>([])
const currentId = ref<string>('')
const isFilter = ref<boolean>(false)
const isPreviewMode = ref<boolean>(false)
const text = ref<string>('')
const isOpenSideMenu = ref<boolean>(true)

const themeOptions = [
  { name: 'Dark', color: '#181818', border: '#2b2b2b' },
  { name: 'Light', color: '#ffffff', border: '#d0d0d0' },
  { name: 'Solarized', color: '#073642', border: '#b58900' },
  { name: 'Mono', color: '#f9f9f9', border: '#000000' },
  { name: 'Sky', color: '#eef3f8', border: '#c5d2de' },
  { name: 'Cobalt', color: '#111827', border: '#334155' },
  { name: 'Honey', color: '#ffeede', border: '#fcd34d' },
  { name: 'Lavender', color: '#ede4fb', border: '#d8b4fe' },
  { name: 'Sepia', color: '#eee4d4', border: '#c0ae98' },
  { name: 'Mint', color: '#d1fae5', border: '#5eead4' },
  { name: 'Forest', color: '#1c2e28', border: '#264339' },
  { name: 'Rose', color: '#ffe4e6', border: '#fbcfe8' },
  { name: 'Neon', color: '#141414', border: '#39ff14' },
  { name: 'Aubergine', color: '#291626', border: '#e95420' },
]

const theme = ref<Theme>('dark')

const STORAGE_NOTES_KEY = 'new_tab_note:notes'
const STORAGE_TARGET_NOTE_ID_KEY = 'new_tab_note:target_note_id'
const STORAGE_FILTER_KEY = 'new_tab_note:filter'
const STORAGE_PREVIEW_MODE_KEY = 'new_tab_note:preview_mode'
const STORAGE_THEME_COLOR_KEY = 'new_tab_note:theme_color'
const STORAGE_SIDE_MENU_OPEN_KEY = 'new_tab_note:side_menu_open'
const MESSAGE_INIT_TEXT = chrome.i18n.getMessage('INIT_TEXT')
const MESSAGE_CONFIRM_DELETE_NOTE = chrome.i18n.getMessage('CONFIRM_DELETE_NOTE')

// 初期化
onMounted(() => {
  const savedNotes = localStorage.getItem(STORAGE_NOTES_KEY)
  isPreviewMode.value = localStorage.getItem(STORAGE_PREVIEW_MODE_KEY) === 'true'
  isFilter.value = localStorage.getItem(STORAGE_FILTER_KEY) === 'true'
  theme.value = localStorage.getItem(STORAGE_THEME_COLOR_KEY) || 'dark'
  isOpenSideMenu.value = localStorage.getItem(STORAGE_SIDE_MENU_OPEN_KEY) === 'true'
  if (savedNotes) {
    notes.value = JSON.parse(savedNotes)
  } else {
    createNote()
  }

  const savedId = localStorage.getItem(STORAGE_TARGET_NOTE_ID_KEY)
  if (savedId && notes.value.some((n) => n.id === savedId)) {
    currentId.value = savedId
  } else {
    currentId.value = notes.value[0].id
    localStorage.setItem(STORAGE_TARGET_NOTE_ID_KEY, currentId.value)
  }

  // テキスト本体
  const note = notes.value.find((n) => n.id === currentId.value)
  text.value = note ? note.text : ''
})

const createNote = () => {
  const id = uuidv4()
  const newNote = {
    id,
    text: notes.value.length ? '' : MESSAGE_INIT_TEXT.replace(/\s+$/, ''),
  }
  notes.value.push(newNote)
  currentId.value = id
  text.value = newNote.text
  localStorage.setItem(STORAGE_NOTES_KEY, JSON.stringify(notes.value))
  localStorage.setItem(STORAGE_TARGET_NOTE_ID_KEY, id)
}

const deleteNote = (id: string) => {
  // 削除前に確認ダイアログ
  if (!window.confirm(MESSAGE_CONFIRM_DELETE_NOTE)) return

  const idx = notes.value.findIndex((n) => n.id === id)
  if (idx === -1) return

  notes.value.splice(idx, 1)
  localStorage.setItem(STORAGE_NOTES_KEY, JSON.stringify(notes.value))

  if (notes.value.length === 0) {
    currentId.value = ''
    text.value = ''
    localStorage.removeItem(STORAGE_TARGET_NOTE_ID_KEY)
    return
  }

  // 残りがある場合はcurrentId, textを切替
  let newCurrentNote: Note | undefined
  if (notes.value[idx]) {
    newCurrentNote = notes.value[idx]
  } else if (notes.value[idx - 1]) {
    newCurrentNote = notes.value[idx - 1]
  } else {
    newCurrentNote = notes.value[0]
  }
  console.log(newCurrentNote, 'newCurrentNote')
  if (newCurrentNote) {
    changeNote(newCurrentNote.id)
  }
}

const changeNote = (id: string) => {
  if (currentId.value === id) return
  currentId.value = id
}

const changeTheme = (colorName: string) => {
  theme.value = colorName
}

watch(text, (val) => {
  // テキスト変更時に即保存
  const idx = notes.value.findIndex((n) => n.id === currentId.value)
  if (idx !== -1) {
    notes.value[idx].text = val
    localStorage.setItem(STORAGE_NOTES_KEY, JSON.stringify(notes.value))
  }
})

// ノート切り替え時
watch(currentId, (val) => {
  localStorage.setItem(STORAGE_TARGET_NOTE_ID_KEY, val)
  const note = notes.value.find((n) => n.id === val)
  text.value = note ? note.text : ''
})
watch(isPreviewMode, (val) => {
  localStorage.setItem(STORAGE_PREVIEW_MODE_KEY, val ? 'true' : 'false')
})
watch(isFilter, (val) => {
  localStorage.setItem(STORAGE_FILTER_KEY, val ? 'true' : 'false')
})
watch(theme, (val) => {
  document.documentElement.setAttribute('data-theme', val)
  localStorage.setItem(STORAGE_THEME_COLOR_KEY, val)
})
watch(isOpenSideMenu, (val) => {
  localStorage.setItem(STORAGE_SIDE_MENU_OPEN_KEY, val ? 'true' : 'false')
})
</script>

<style scoped></style>
