<template>
  <div class="min-h-screen w-full box-border text-text_black font-sans">
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
import { ref, onMounted, watch, onBeforeUnmount } from 'vue'
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
const theme = ref<Theme>('dark')
const isInitialized = ref(false)

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
const STORAGE_NOTES_KEY = 'new_tab_note:notes'
const STORAGE_TARGET_NOTE_ID_KEY = 'new_tab_note:target_note_id'
const STORAGE_FILTER_KEY = 'new_tab_note:filter'
const STORAGE_PREVIEW_MODE_KEY = 'new_tab_note:preview_mode'
const STORAGE_THEME_COLOR_KEY = 'new_tab_note:theme_color'
const STORAGE_SIDE_MENU_OPEN_KEY = 'new_tab_note:side_menu_open'
const MESSAGE_INIT_TEXT = chrome.i18n.getMessage('INIT_TEXT')
const MESSAGE_CONFIRM_DELETE_NOTE = chrome.i18n.getMessage('CONFIRM_DELETE_NOTE')
// ノート内容を同期保存する処理を1秒(1000ms)だけ遅らせて連続書き込みを防ぐための待機時間
const NOTE_SAVE_DEBOUNCE = 1000
// chrome.storage.sync
const storageArea = chrome?.storage?.sync
// chrome.storage.sync が利用できる環境かどうか
const hasSyncStorage = Boolean(storageArea)

/**
 * カラーテーマを更新する
 * @param {string} value カラーテーマ値
 */
const setThemeColor = (value: string) => {
  document.documentElement.setAttribute('data-theme', value)
}

/**
 * localStorageに残っている旧データを読み込み
 * 適切な型に変換して返す
 * @param {string} key  localStorage key
 */
const readLegacyValue = (key: string) => {
  const raw = window.localStorage.getItem(key)
  if (raw === null) return undefined
  if (raw === 'true') return true
  if (raw === 'false') return false
  try {
    return JSON.parse(raw)
  } catch {
    return raw
  }
}

/**
 * localStorageにデータを保存
 * chrome.storage.syncが利用できない環境ではlocalStorageにデータを書き込むようにする
 * @param {string} key  localStorage key
 * @param {unknown} value
 */
const setLegacyValue = (key: string, value: unknown) => {
  if (value === undefined) {
    window.localStorage.removeItem(key)
    return
  }
  if (typeof value === 'string') {
    window.localStorage.setItem(key, value)
  } else {
    window.localStorage.setItem(key, JSON.stringify(value))
  }
}

/**
 * 指定したキーの値を取得
 * chrome.storage.syncが使えるならそこから非同期に取得
 * 使えない場合はlocalStorageの旧データを読み込んで返す
 * @param {string[]} keys
 */
const getStorageValues = async (keys: string[]) => {
  if (hasSyncStorage) {
    return (await storageArea!.get(keys)) as Record<string, unknown>
  }
  const legacy: Record<string, unknown> = {}
  for (const key of keys) {
    legacy[key] = readLegacyValue(key)
  }
  return legacy
}

/**
 * 指定したキーと値を保存
 * chrome.storage.syncが使えるときはそこに書き込み
 * 使えない場合はlocalStorageに保存
 * @param {string} key
 * @param {unknown} value
 */
const setStorageValue = async (key: string, value: unknown) => {
  if (hasSyncStorage) {
    await storageArea!.set({ [key]: value })
  }
  setLegacyValue(key, value)
}

/**
 * 指定したキーを削除
 * chrome.storage.syncが使えるときはそこから削除
 * 使えない場合はlocalStorageから削除
 * @param {string} key
 */
const removeStorageValue = async (key: string) => {
  if (hasSyncStorage) {
    await storageArea!.remove(key)
  }
  window.localStorage.removeItem(key)
}

/**
 * 現時点のnotesの配列をストレージへ保存
 */
const saveNotesToStorage = async () => {
  await setStorageValue(STORAGE_NOTES_KEY, notes.value)
}

let saveNotesTimeout: ReturnType<typeof setTimeout> | null = null
let shouldSaveAfterInit = false
/**
 * ノートの保存処理をまとめて先送りする
 * 入力のたびに即保存するのを防ぐ
 */
const queueSaveNotes = () => {
  if (!isInitialized.value) {
    shouldSaveAfterInit = true
    return
  }
  if (saveNotesTimeout) {
    clearTimeout(saveNotesTimeout)
  }
  saveNotesTimeout = setTimeout(() => {
    void saveNotesToStorage()
  }, NOTE_SAVE_DEBOUNCE)
}

const flushQueuedNotesSave = () => {
  if (!isInitialized.value) {
    shouldSaveAfterInit = true
    return
  }
  if (saveNotesTimeout) {
    clearTimeout(saveNotesTimeout)
    saveNotesTimeout = null
  }
  void saveNotesToStorage()
}

/**
 * ノート配列かどうか
 * @param value ノート配列候補
 */
const isNoteArray = (value: unknown): value is Note[] => {
  return (
    Array.isArray(value) &&
    value.every((note) => note && typeof note.id === 'string' && typeof note.text === 'string')
  )
}

/**
 * 新しいノートを追加
 */
const createNote = async () => {
  const id = uuidv4()
  const newNote = {
    id,
    text: notes.value.length ? '' : MESSAGE_INIT_TEXT.replace(/\s+$/, ''),
  }
  notes.value.push(newNote)
  currentId.value = id
  text.value = newNote.text
  // ストレージ更新
  await saveNotesToStorage()
  await setStorageValue(STORAGE_TARGET_NOTE_ID_KEY, id)
}

/**
 * 指定ノートを削除
 * @param {string} id
 */
const deleteNote = async (id: string) => {
  if (!window.confirm(MESSAGE_CONFIRM_DELETE_NOTE)) return

  const idx = notes.value.findIndex((n) => n.id === id)
  if (idx === -1) return

  notes.value.splice(idx, 1)
  // ストレージ更新
  await saveNotesToStorage()

  if (notes.value.length === 0) {
    currentId.value = ''
    text.value = ''
    await removeStorageValue(STORAGE_TARGET_NOTE_ID_KEY)
    return
  }

  // 削除後に他にノートが残っている場合は表示させるノートを切り替える
  let newCurrentNote: Note | undefined
  if (notes.value[idx]) {
    newCurrentNote = notes.value[idx]
  } else if (notes.value[idx - 1]) {
    newCurrentNote = notes.value[idx - 1]
  } else {
    newCurrentNote = notes.value[0]
  }
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

// 初期化
onMounted(async () => {
  const storageKeys = [
    STORAGE_NOTES_KEY,
    STORAGE_TARGET_NOTE_ID_KEY,
    STORAGE_FILTER_KEY,
    STORAGE_PREVIEW_MODE_KEY,
    STORAGE_THEME_COLOR_KEY,
    STORAGE_SIDE_MENU_OPEN_KEY,
  ]
  const storedValues = await getStorageValues(storageKeys)

  let shouldSaveNotesToStorage = false
  // ストレージからノート群を取得
  const storedNotes = storedValues[STORAGE_NOTES_KEY]
  if (isNoteArray(storedNotes)) {
    notes.value = storedNotes
  } else {
    // 見つからなかった場合はlocalStorageからノート群を取得
    const legacyNotes = readLegacyValue(STORAGE_NOTES_KEY)
    if (isNoteArray(legacyNotes)) {
      notes.value = legacyNotes
      // chrome.storage.syncに書き戻すためのフラグ
      shouldSaveNotesToStorage = true
    }
  }

  if (!notes.value.length) {
    await createNote()
  }

  /**
   * プレビューモードの初期値をストレージから取得
   * 見つからなければlocalStorageから拾って復元
   */
  const storedPreview = storedValues[STORAGE_PREVIEW_MODE_KEY]
  let shouldPersistPreview = false
  if (typeof storedPreview === 'boolean') {
    isPreviewMode.value = storedPreview
  } else {
    // localStorageから拾って復元
    const legacyPreview = readLegacyValue(STORAGE_PREVIEW_MODE_KEY)
    if (typeof legacyPreview === 'boolean') {
      isPreviewMode.value = legacyPreview
      // chrome.storage.syncに書き戻すためのフラグ
      shouldPersistPreview = true
    }
  }

  /**
   * フィルター設定の初期値をストレージから取得
   * 見つからなければlocalStorageから拾って復元
   */
  const storedFilter = storedValues[STORAGE_FILTER_KEY]
  let shouldPersistFilter = false
  if (typeof storedFilter === 'boolean') {
    isFilter.value = storedFilter
  } else {
    // localStorageから拾って復元
    const legacyFilter = readLegacyValue(STORAGE_FILTER_KEY)
    if (typeof legacyFilter === 'boolean') {
      isFilter.value = legacyFilter
      // chrome.storage.syncに書き戻すためのフラグ
      shouldPersistFilter = true
    }
  }

  /**
   * テーマカラーの初期値をストレージから取得
   * 見つからなければlocalStorageから拾って復元
   */
  const storedTheme = storedValues[STORAGE_THEME_COLOR_KEY]
  let shouldPersistTheme = false
  if (typeof storedTheme === 'string') {
    theme.value = storedTheme as Theme
  } else {
    // localStorageから拾って復元
    const legacyTheme = readLegacyValue(STORAGE_THEME_COLOR_KEY)
    if (typeof legacyTheme === 'string') {
      theme.value = legacyTheme as Theme
      // chrome.storage.syncに書き戻すためのフラグ
      shouldPersistTheme = true
    }
  }

  /**
   * サイドメニューの開閉状態の初期値をストレージから取得
   * 見つからなければlocalStorageから拾って復元
   */
  const storedSideMenu = storedValues[STORAGE_SIDE_MENU_OPEN_KEY]
  let shouldPersistSideMenu = false
  if (typeof storedSideMenu === 'boolean') {
    isOpenSideMenu.value = storedSideMenu
  } else {
    // localStorageから拾って復元
    const legacySideMenu = readLegacyValue(STORAGE_SIDE_MENU_OPEN_KEY)
    if (typeof legacySideMenu === 'boolean') {
      isOpenSideMenu.value = legacySideMenu
      // chrome.storage.syncに書き戻すためのフラグ
      shouldPersistSideMenu = true
    }
  }

  /**
   * 前回開いていたノート情報をストレージから取得
   * 見つからなければlocalStorageから拾って復元
   */
  let targetId = storedValues[STORAGE_TARGET_NOTE_ID_KEY]
  let shouldPersistTargetId = false
  if (typeof targetId !== 'string') {
    // localStorageから拾って復元
    const legacyTargetId = readLegacyValue(STORAGE_TARGET_NOTE_ID_KEY)
    if (typeof legacyTargetId === 'string') {
      targetId = legacyTargetId
      // chrome.storage.syncに書き戻すためのフラグ
      shouldPersistTargetId = true
    }
  }
  if (typeof targetId === 'string' && notes.value.some((n) => n.id === targetId)) {
    // 前回開いていたノートのIDを挿入
    currentId.value = targetId
  } else {
    // 前回開いていたノートが存在しない場合は先頭のノート(存在しなければ空)を表示
    currentId.value = notes.value[0]?.id ?? ''
    // chrome.storage.syncに書き戻すためのフラグ
    shouldPersistTargetId = true
  }
  // ノートの内容を挿入
  const note = notes.value.find((n) => n.id === currentId.value)
  text.value = note ? note.text : ''
  // テーマカラー更新
  setThemeColor(theme.value)

  if (shouldSaveNotesToStorage) {
    // ノート群をchrome.storage.syncに同期
    await saveNotesToStorage()
  }
  if (shouldPersistPreview) {
    // プレビューモードの設定をchrome.storage.syncに同期
    await setStorageValue(STORAGE_PREVIEW_MODE_KEY, isPreviewMode.value)
  }
  if (shouldPersistFilter) {
    // フィルター設定をchrome.storage.syncに同期
    await setStorageValue(STORAGE_FILTER_KEY, isFilter.value)
  }
  if (shouldPersistTheme) {
    // テーマカラー設定をchrome.storage.syncに同期
    await setStorageValue(STORAGE_THEME_COLOR_KEY, theme.value)
  }
  if (shouldPersistSideMenu) {
    // サイドメニュー開閉状態をchrome.storage.syncに同期
    await setStorageValue(STORAGE_SIDE_MENU_OPEN_KEY, isOpenSideMenu.value)
  }
  if (shouldPersistTargetId) {
    if (currentId.value) {
      // 選択中のnote id情報をchrome.storage.syncに同期
      await setStorageValue(STORAGE_TARGET_NOTE_ID_KEY, currentId.value)
    } else {
      // 存在しなかったらストレージから削除
      await removeStorageValue(STORAGE_TARGET_NOTE_ID_KEY)
    }
  }

  isInitialized.value = true

  if (shouldSaveAfterInit) {
    shouldSaveAfterInit = false
    await saveNotesToStorage()
  }

  window.addEventListener('beforeunload', flushQueuedNotesSave)
  window.addEventListener('pagehide', flushQueuedNotesSave)
})

onBeforeUnmount(() => {
  if (saveNotesTimeout) {
    clearTimeout(saveNotesTimeout)
    saveNotesTimeout = null
  }
  window.removeEventListener('beforeunload', flushQueuedNotesSave)
  window.removeEventListener('pagehide', flushQueuedNotesSave)
})

// ノート本文更新時
watch(text, (val) => {
  if (!currentId.value) return
  const idx = notes.value.findIndex((n) => n.id === currentId.value)
  if (idx !== -1 && notes.value[idx].text !== val) {
    notes.value[idx].text = val
    // ストレージに保存
    queueSaveNotes()
  }
})

// 選択中のノート変更時
watch(currentId, (val) => {
  const note = notes.value.find((n) => n.id === val)
  text.value = note ? note.text : ''

  if (!isInitialized.value) return
  if (val) {
    // ストレージに保存
    void setStorageValue(STORAGE_TARGET_NOTE_ID_KEY, val)
  } else {
    // 洗濯中のノートが存在しない場合はストレージから削除
    void removeStorageValue(STORAGE_TARGET_NOTE_ID_KEY)
  }
})

// プレビューモード更新時
watch(isPreviewMode, (val) => {
  if (!isInitialized.value) return
  // ストレージに保存
  void setStorageValue(STORAGE_PREVIEW_MODE_KEY, val)
})

// フィルター設定更新時
watch(isFilter, (val) => {
  if (!isInitialized.value) return
  // ストレージに保存
  void setStorageValue(STORAGE_FILTER_KEY, val)
})

// テーマカラー更新時
watch(theme, (val) => {
  setThemeColor(val)
  if (!isInitialized.value) return
  // ストレージに保存
  void setStorageValue(STORAGE_THEME_COLOR_KEY, val)
})

// サイドメニュー開閉更新時
watch(isOpenSideMenu, (val) => {
  if (!isInitialized.value) return
  // ストレージに保存
  void setStorageValue(STORAGE_SIDE_MENU_OPEN_KEY, val)
})
</script>

<style scoped></style>
