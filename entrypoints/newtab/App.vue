<template>
  <div class="min-h-screen w-full box-border text-text_black font-jp">
    <Header />
    <div class="w-full h-[calc(100svh-35px)] flex">
      <SideMenu
        :menus="notes"
        :current-note-id="currentId"
        @delete="deleteNote"
        @create="createNote"
        @change="changeNote"
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
            @removePreview="isPreviewMode = false"
          />
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import enMessages from '@/public/_locales/en/messages.json'
import { ref, computed, onMounted, watch } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import { marked } from 'marked'
import Header from '@/components/Header.vue'
import SideMenu from '@/components/SideMenu.vue'
import Edit from '@/components/Edit.vue'
import Preview from '@/components/Preview.vue'
import EmptyState from '@/components/EmptyState.vue'

interface Note {
  id: string
  text: string
}

const notes = ref<Note[]>([])
const currentId = ref<string>('')
const currentText = ref<string>('')
const isFilter = ref<boolean>(false)
const isPreviewMode = ref<boolean>(false)
const text = ref<string>('')

const STORAGE_KEY_NOTES = 'new_tab_note:notes'
const STORAGE_KEY_TARGET_ID = 'new_tab_note:target_note_id'
const FILTER_KEY = 'new_tab_note:filter'
const PREVIEW_MODE_KEY = 'new_tab_note:preview_mode'
const INIT_TEXT = enMessages.InitText.message

// 初期化
onMounted(() => {
  console.log('mounted')
  const savedNotes = localStorage.getItem(STORAGE_KEY_NOTES)
  isPreviewMode.value = localStorage.getItem(PREVIEW_MODE_KEY) === 'true'
  isFilter.value = localStorage.getItem(FILTER_KEY) === 'true'
  if (savedNotes) {
    notes.value = JSON.parse(savedNotes)
  } else {
    createNote()
  }

  const savedId = localStorage.getItem(STORAGE_KEY_TARGET_ID)
  if (savedId && notes.value.some((n) => n.id === savedId)) {
    currentId.value = savedId
  } else {
    currentId.value = notes.value[0].id
    localStorage.setItem(STORAGE_KEY_TARGET_ID, currentId.value)
  }

  // テキスト本体
  const note = notes.value.find((n) => n.id === currentId.value)
  text.value = note ? note.text : ''
})

const createNote = () => {
  const id = uuidv4()
  const newNote = {
    id,
    text: notes.value.length ? '' : INIT_TEXT.replace(/\s+$/, ''),
  }
  notes.value.push(newNote)
  currentId.value = id
  text.value = newNote.text
  localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(notes.value))
  localStorage.setItem(STORAGE_KEY_TARGET_ID, id)
}

const deleteNote = (id: string) => {
  // 削除前に確認ダイアログ
  if (!window.confirm('本当にこのノートを削除しますか？')) return

  const idx = notes.value.findIndex((n) => n.id === id)
  if (idx === -1) return

  notes.value.splice(idx, 1)
  localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(notes.value))

  if (notes.value.length === 0) {
    currentId.value = ''
    text.value = ''
    localStorage.removeItem(STORAGE_KEY_TARGET_ID)
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

watch(text, (val) => {
  // テキスト変更時に即保存
  const idx = notes.value.findIndex((n) => n.id === currentId.value)
  if (idx !== -1) {
    notes.value[idx].text = val
    localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(notes.value))
  }
})

// ノート切り替え時
watch(currentId, (val) => {
  localStorage.setItem(STORAGE_KEY_TARGET_ID, val)
  const note = notes.value.find((n) => n.id === val)
  text.value = note ? note.text : ''
})
watch(isPreviewMode, (val) => {
  localStorage.setItem(PREVIEW_MODE_KEY, val ? 'true' : 'false')
})
watch(isFilter, (val) => {
  localStorage.setItem(FILTER_KEY, val ? 'true' : 'false')
})
</script>

<style scoped></style>
