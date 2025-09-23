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
        :sync-statuses="syncStatusMap"
        :sync-usage-label="MESSAGE_SYNC_USAGE_LABEL"
        :sync-usage-text="syncUsageText"
        @delete="deleteNote"
        @create="createNote"
        @change="changeNote"
        @toggle-menu="(v: boolean) => (isOpenSideMenu = v)"
      />
      <div class="bg-bg_secondary w-full flex">
        <EmptyState v-if="!notes.length" @create="createNote" />
        <template v-else>
          <Edit
            v-model="text"
            :is-filter="isFilter"
            :is-preview-mode="isPreviewMode"
            :note-id="currentId"
            :is-synced="currentNote?.isSynced ?? false"
            :sync-status="currentSyncStatus"
            :can-sync="hasSyncStorage"
            :note-usage-text="currentNoteUsageText"
            :note-usage-label="MESSAGE_NOTE_USAGE_LABEL"
            @filter="(v) => (isFilter = v)"
            @openPreview="isPreviewMode = true"
            @toggleSync="toggleNoteSync"
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
import { ref, onMounted, watch, onBeforeUnmount, computed } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import Header from '@/components/Header.vue'
import SideMenu from '@/components/SideMenu.vue'
import Edit from '@/components/Edit.vue'
import Preview from '@/components/Preview.vue'
import EmptyState from '@/components/EmptyState.vue'

type Note = {
  /** note id */
  id: string
  /** 本文 */
  text: string
  /** chrome.storage.syncへ同期するかどうか */
  isSynced: boolean
  /** 最後に同期した本文。同期OFF中の差分検出と競合解消に利用する */
  syncedText: string | null
}

type StoredNotePayload = {
  /** note id */
  id: string
  /** 本文 */
  text: string
  /** chrome.storage.syncへ同期するかどうか */
  isSynced?: boolean
  /** 最後に同期した本文。同期OFF中の差分検出と競合解消に利用する */
  syncedText?: string | null
}

type SyncedStorageNote = {
  /** note id */
  id: string
  /** 本文 */
  text: string
  /** chrome.storage.syncへ同期するかどうか */
  isSynced?: boolean
}

type Theme = (typeof themeOptions)[number]['name']
type SyncStatus = 'off' | 'syncing' | 'synced' | 'error'

// 編集対象の全ノート
const notes = ref<Note[]>([])
// 現在選択されているノートID
const currentId = ref<string>('')
// マークダウンのフィルター表示を行うか
const isFilter = ref<boolean>(false)
// プレビュー画面を開いているか
const isPreviewMode = ref<boolean>(false)
// 現在編集中の本文
const text = ref<string>('')
// サイドメニュー開閉状態
const isOpenSideMenu = ref<boolean>(true)
// テーマカラー
const theme = ref<Theme>('dark')
// 初期化フラグ(onMounted 完了以降 true)
const isInitialized = ref(false)
// 各ノートの同期ステータス管理
const syncStatusMap = ref<Record<string, SyncStatus>>({})
// chrome.storage.sync 使用バイト数
const syncUsageBytes = ref<number | null>(null)

/**
 * 現在選択しているノートを取得
 */
const currentNote = computed(() => {
  return notes.value.find((n) => n.id === currentId.value) ?? null
})

/**
 * 表示中のノートに対する同期ステータス
 * 同期OFFなら'off'
 */
const currentSyncStatus = computed<SyncStatus>(() => {
  return currentNote.value ? getSyncStatus(currentNote.value.id) : 'off'
})

/**
 * chrome.storage.sync の総使用量の表示用テキスト
 */
const syncUsageText = computed(() => {
  if (!hasSyncStorage || syncUsageBytes.value === null) return ''
  const usedKB = syncUsageBytes.value / 1024
  const totalKB = SYNC_TOTAL_BYTES_LIMIT / 1024
  return `${usedKB.toFixed(1)} KB / ${totalKB.toFixed(0)} KB`
})

/**
 * 現在編集中ノートの本文バイト数表示用テキスト
 */
const currentNoteUsageText = computed(() => {
  const note = currentNote.value
  if (!note) return ''
  const bytes = measureUtf8Bytes(note.text)
  if (!bytes) return '0 KB'
  if (bytes < 1024) {
    return `${bytes} B`
  }
  return `${(bytes / 1024).toFixed(1)} KB`
})

// カラーテーマ一覧
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
const STORAGE_SYNCED_NOTES_KEY = 'new_tab_note:synced_notes'
const STORAGE_TARGET_NOTE_ID_KEY = 'new_tab_note:target_note_id'
const STORAGE_FILTER_KEY = 'new_tab_note:filter'
const STORAGE_PREVIEW_MODE_KEY = 'new_tab_note:preview_mode'
const STORAGE_THEME_COLOR_KEY = 'new_tab_note:theme_color'
const STORAGE_SIDE_MENU_OPEN_KEY = 'new_tab_note:side_menu_open'
const SYNC_MAX_BYTES_PER_ITEM = 8 * 1024
const SYNC_TOTAL_BYTES_LIMIT = 102_400
const SYNC_CHUNK_SAFE_BYTES = 7000
const SYNC_CHUNK_META_VERSION = 2
const SYNC_CHUNK_KEY_PREFIX = `${STORAGE_SYNCED_NOTES_KEY}__chunk_`
const MESSAGE_INIT_TEXT = chrome.i18n.getMessage('INIT_TEXT')
const MESSAGE_CONFIRM_DELETE_NOTE =
  chrome.i18n.getMessage('CONFIRM_DELETE_NOTE') || 'Are you sure you want to delete this note?'
const MESSAGE_CONFIRM_DELETE_SYNCED_NOTE =
  chrome.i18n.getMessage('CONFIRM_DELETE_SYNCED_NOTE') ||
  'Deleting this note will remove it from all synced devices. If needed, please back it up before deleting.'
const MESSAGE_RESUME_SYNC_USE_LOCAL =
  chrome.i18n.getMessage('SYNC_RESUME_USE_LOCAL') ||
  'This note differs from its content before sync was stopped. Do you want to resume syncing with the current content?'
const MESSAGE_SYNC_QUOTA_EXCEEDED =
  chrome.i18n.getMessage('SYNC_QUOTA_EXCEEDED') ||
  'Sync storage is full. Turn off sync or delete notes you do not need to free up space.'
const MESSAGE_SYNC_USAGE_LABEL = chrome.i18n.getMessage('SYNC_USAGE_LABEL') || 'Sync storage usage'
const MESSAGE_NOTE_USAGE_LABEL = chrome.i18n.getMessage('NOTE_USAGE_LABEL') || 'Note size'

// ノート内容を同期保存する処理を1秒(1000ms)だけ遅らせて連続書き込みを防ぐための待機時間
const NOTE_SAVE_DEBOUNCE = 1000
// chrome.storage.sync
const storageArea = chrome?.storage?.sync
// chrome.storage.sync が利用できる環境かどうか
const hasSyncStorage = Boolean(storageArea)
const utf8Encoder = new TextEncoder()

let lastSyncedChunksCount = 0

/**
 * chrome.storage.sync の総使用バイト数を取得
 */
const getSyncBytesInUse = (): Promise<number> => {
  return new Promise((resolve, reject) => {
    if (!storageArea) {
      resolve(0)
      return
    }
    storageArea.getBytesInUse(null, (bytes) => {
      const lastError = chrome.runtime?.lastError
      if (lastError) {
        reject(lastError)
      } else {
        resolve(bytes)
      }
    })
  })
}

/**
 * 表示用の同期バイト数更新
 */
const updateSyncUsageBytes = async () => {
  if (!hasSyncStorage) {
    syncUsageBytes.value = null
    return
  }
  try {
    syncUsageBytes.value = await getSyncBytesInUse()
  } catch (error) {
    console.error('[new-tab-note] Failed to read sync storage usage', error)
  }
}

/**
 * syncStatusMap(各ノートの同期ステータス管理)に指定したノートの状態をセット
 * @param {string} id ノートid
 * @param {SyncStatus} status 同期ステータス
 */
const setSyncStatus = (id: string, status: SyncStatus) => {
  syncStatusMap.value[id] = status
}

/**
 * syncStatusMap(各ノートの同期ステータス管理)から指定したノートの状態を削除
 * @param {string} id ノートid
 */
const clearSyncStatus = (id: string) => {
  delete syncStatusMap.value[id]
}

/**
 * 現在保持しているノート一覧からステータスを再計算し、不要なIDを掃除
 */
const refreshAllSyncStatuses = () => {
  const knownIds = new Set<string>()
  for (const note of notes.value) {
    knownIds.add(note.id)
    const current = syncStatusMap.value[note.id]
    if (current === 'error') {
      // エラー状態はユーザー操作で明示的に解消されるまで維持
      continue
    }
    if (!note.isSynced) {
      setSyncStatus(note.id, 'off')
    } else if (note.text !== note.syncedText) {
      setSyncStatus(note.id, 'syncing')
    } else {
      setSyncStatus(note.id, 'synced')
    }
  }
  for (const id of Object.keys(syncStatusMap)) {
    if (!knownIds.has(id)) {
      clearSyncStatus(id)
    }
  }
}

/**
 * 指定したノートの同期ステータスを取得
 * @param {string} id ノートid
 */
const getSyncStatus = (id: string): SyncStatus => {
  return syncStatusMap.value[id] ?? 'off'
}

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
 * @param {string} key localStorage key
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

const measureUtf8Bytes = (input: string) => {
  return utf8Encoder.encode(input).length
}

const chunkUtf8String = (input: string, maxBytes: number) => {
  if (maxBytes <= 0) return []
  const encoder = new TextEncoder()
  const decoder = new TextDecoder()
  const bytes = encoder.encode(input)
  const chunks: string[] = []
  let offset = 0
  while (offset < bytes.length) {
    const end = Math.min(offset + maxBytes, bytes.length)
    const slice = bytes.slice(offset, end)
    const chunk = decoder.decode(slice, { stream: end !== bytes.length })
    chunks.push(chunk)
    offset = end
  }
  const tail = decoder.decode()
  if (tail) {
    const lastIndex = chunks.length - 1
    if (lastIndex >= 0) {
      chunks[lastIndex] += tail
    } else {
      chunks.push(tail)
    }
  }
  return chunks
}

const getSyncChunkKey = (index: number) => {
  return `${SYNC_CHUNK_KEY_PREFIX}${index}`
}

/**
 * 指定したキーの値を取得
 * chrome.storage.syncが使えるならそこから非同期に取得
 * 使えない場合はlocalStorageの旧データを読み込んで返す
 * @param {string[]} keys
 */
const getStorageValues = async (keys: string[]) => {
  if (hasSyncStorage) {
    const values = (await storageArea!.get(keys)) as Record<string, unknown>
    if (keys.includes(STORAGE_SYNCED_NOTES_KEY)) {
      const { notes: syncedNotes, chunkCount } = await readSyncedNotesFromStorage(
        values[STORAGE_SYNCED_NOTES_KEY]
      )
      lastSyncedChunksCount = chunkCount
      if (syncedNotes !== undefined) {
        values[STORAGE_SYNCED_NOTES_KEY] = syncedNotes
      } else {
        delete values[STORAGE_SYNCED_NOTES_KEY]
      }
    }
    return values
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
    try {
      await storageArea!.set({ [key]: value })
    } catch (error) {
      console.error(error)
    }
  }
  setLegacyValue(key, value)
}

// chrome.storage.sync に最後に書き込んだノート情報
let lastSyncedNotesJSON = ''
// chrome.storage.onChangedで受け取った同期データをローカルに反映中かどうか
let isApplyingStorageUpdate = false
// onChangedの後処理でisApplyingStorageUpdateを解除するsetTimeout ID
let storageUpdateReleaseTimerId: ReturnType<typeof setTimeout> | null = null

/**
 * storage.onChanged の反映処理中であることのフラグを立てる
 * 完了後に自動解除する
 */
const runWithStorageUpdate = async (task: () => void | Promise<void>) => {
  isApplyingStorageUpdate = true
  if (storageUpdateReleaseTimerId) {
    clearTimeout(storageUpdateReleaseTimerId)
    storageUpdateReleaseTimerId = null
  }
  try {
    await task()
  } finally {
    storageUpdateReleaseTimerId = setTimeout(() => {
      isApplyingStorageUpdate = false
      storageUpdateReleaseTimerId = null
    }, 0)
  }
}

/**
 * リモートの同期データをローカル側へ統合しつつ、同期OFFのローカルノートは維持する。
 * @param payload 同期ストレージから取得したノート一覧
 */
const applySyncedNotesUpdate = (payload: StoredNotePayload[]) => {
  const remoteList = payload.map((remote) => toLocalNote({ ...remote, syncedText: remote.text }))
  const remoteOrder = new Set(remoteList.map((note) => note.id))
  const merged: Note[] = []

  // 同期側に同名ノートがあれば差分をマージ。無ければそのまま採用
  for (const remote of remoteList) {
    const local = notes.value.find((note) => note.id === remote.id)
    if (local) {
      const updated: Note = {
        ...local,
        syncedText: remote.syncedText,
        isSynced: remote.isSynced,
        text: remote.isSynced ? remote.text : local.text, // 同期OFFの場合はローカル側の情報を反映
      }
      merged.push(updated)
    } else {
      merged.push(remote)
    }
  }

  // リモートに無い＆同期OFFのノートはローカル専用として残す
  for (const local of notes.value) {
    if (!remoteOrder.has(local.id) && !local.isSynced) {
      merged.push(local)
    }
  }

  notes.value.splice(0, notes.value.length, ...merged)
  // localStorageへ保存
  setLegacyValue(STORAGE_NOTES_KEY, notes.value)
  // 最終同期情報
  lastSyncedNotesJSON = JSON.stringify(payload)

  if (!notes.value.some((note) => note.id === currentId.value)) {
    currentId.value = notes.value[0]?.id ?? ''
  }

  const activeNote = notes.value.find((note) => note.id === currentId.value)
  text.value = activeNote ? activeNote.text : ''
  refreshAllSyncStatuses()
}

/**
 * 同期ストレージからノートが消えた場合にローカルバックアップで復旧
 * なければ初期状態へ戻す
 */
const handleSyncedNotesCleared = () => {
  console.warn('[new-tab-note] storage.onChanged -> notes cleared, attempting recovery')
  const legacyNotes = readLegacyValue(STORAGE_NOTES_KEY)
  if (isStoredNoteArray(legacyNotes) && legacyNotes.length) {
    // ローカルバックアップがあれば復旧し、同期領域へ書き戻す
    const restoredNotes = legacyNotes.map(toLocalNote)
    notes.value.splice(0, notes.value.length, ...restoredNotes)
    lastSyncedNotesJSON = ''
    if (!restoredNotes.some((note) => note.id === currentId.value)) {
      currentId.value = notes.value[0]?.id ?? ''
    }
    const activeNote = notes.value.find((note) => note.id === currentId.value)
    text.value = activeNote ? activeNote.text : ''
    void saveNotesToStorage()
  } else {
    notes.value = []
    setLegacyValue(STORAGE_NOTES_KEY, [])
    lastSyncedNotesJSON = ''
    currentId.value = ''
    text.value = ''
  }
  refreshAllSyncStatuses()
}

/**
 * chrome.storage.onChanged の反映処理
 * - 同期したノートをローカル側にマージ
 * - 不足分は復活、余剰は除外
 * - 保存ループ防止のため runWithStorageUpdate で処理をラップ
 * @param changes chrome.storage から渡される差分
 * @param areaName 更新が発生したストレージ領域名
 */
const storageChangeHandler: Parameters<typeof chrome.storage.onChanged.addListener>[0] = (
  changes,
  areaName
) => {
  if (areaName !== 'sync') return

  const changedKeys = Object.keys(changes)
  const notesKeysChanged =
    STORAGE_SYNCED_NOTES_KEY in changes ||
    STORAGE_NOTES_KEY in changes ||
    changedKeys.some((key) => key.startsWith(SYNC_CHUNK_KEY_PREFIX))

  if (notesKeysChanged) {
    const metaValue = changes[STORAGE_SYNCED_NOTES_KEY]?.newValue
    void runWithStorageUpdate(async () => {
      const { notes: syncedPayload, chunkCount } = await readSyncedNotesFromStorage(metaValue)
      lastSyncedChunksCount = chunkCount

      if (syncedPayload !== undefined && isStoredNoteArray(syncedPayload)) {
        applySyncedNotesUpdate(syncedPayload)
        await updateSyncUsageBytes()
        return
      }

      if (metaValue === undefined) {
        handleSyncedNotesCleared()
        await updateSyncUsageBytes()
        return
      }

      const fallback = changes[STORAGE_NOTES_KEY]?.newValue
      if (isStoredNoteArray(fallback)) {
        applySyncedNotesUpdate(fallback)
        await updateSyncUsageBytes()
        return
      }

      await updateSyncUsageBytes()
    })
  }

  /**
   * テーマカラー更新
   */
  const themeChange = changes[STORAGE_THEME_COLOR_KEY]
  if (themeChange && typeof themeChange.newValue === 'string') {
    void runWithStorageUpdate(() => {
      const newTheme = themeChange.newValue as Theme
      if (theme.value !== newTheme) {
        theme.value = newTheme
        setLegacyValue(STORAGE_THEME_COLOR_KEY, newTheme)
      }
    })
  }
}

/**
 * chrome.storage.syncへ同期対象ノート一覧を書き込む。
 * @param payload 同期対象として整形済みのノート配列
 * 1. JSONへシリアライズし、サイズが閾値以下なら単一キーに保存
 * 2. 8KBを超える場合はチャンク分割して複数キーへ保存し、メタ情報を更新
 * 3. チャンク数が減ったときは不要キーを掃除し、上限超過時はエラーを投げる
 */
const writeSyncedNotesToStorage = async (payload: SyncedStorageNote[]) => {
  if (!hasSyncStorage) {
    return { success: true }
  }

  const json = JSON.stringify(payload)
  const totalBytes = measureUtf8Bytes(json)

  if (totalBytes <= SYNC_MAX_BYTES_PER_ITEM) {
    await storageArea!.set({ [STORAGE_SYNCED_NOTES_KEY]: payload })
    if (lastSyncedChunksCount > 0) {
      const keysToRemove = Array.from({ length: lastSyncedChunksCount }, (_, index) =>
        getSyncChunkKey(index)
      )
      if (keysToRemove.length) {
        await storageArea!.remove(keysToRemove)
      }
      lastSyncedChunksCount = 0
    }
    return { success: true }
  }

  if (totalBytes > SYNC_TOTAL_BYTES_LIMIT) {
    return { success: false, reason: 'total-limit', totalBytes }
  }

  const chunks = chunkUtf8String(json, SYNC_CHUNK_SAFE_BYTES)
  if (!chunks.length) {
    await storageArea!.set({ [STORAGE_SYNCED_NOTES_KEY]: [] })
    if (lastSyncedChunksCount > 0) {
      const keysToRemove = Array.from({ length: lastSyncedChunksCount }, (_, index) =>
        getSyncChunkKey(index)
      )
      if (keysToRemove.length) {
        await storageArea!.remove(keysToRemove)
      }
      lastSyncedChunksCount = 0
    }
    return { success: true }
  }

  for (const chunk of chunks) {
    if (measureUtf8Bytes(chunk) > SYNC_MAX_BYTES_PER_ITEM) {
      return { success: false, reason: 'chunk-limit', totalBytes }
    }
  }

  const data: Record<string, unknown> = {
    [STORAGE_SYNCED_NOTES_KEY]: {
      version: SYNC_CHUNK_META_VERSION,
      chunkCount: chunks.length,
      totalBytes,
    },
  }

  chunks.forEach((chunk, index) => {
    data[getSyncChunkKey(index)] = chunk
  })

  await storageArea!.set(data)

  if (lastSyncedChunksCount > chunks.length) {
    const keysToRemove = []
    for (let i = chunks.length; i < lastSyncedChunksCount; i++) {
      keysToRemove.push(getSyncChunkKey(i))
    }
    if (keysToRemove.length) {
      await storageArea!.remove(keysToRemove)
    }
  }

  lastSyncedChunksCount = chunks.length
  return { success: true }
}

/**
 * 現時点のノート配列をlocalStorage / chrome.storage.syncに保存する
 * @param sync true のときのみchrome.storage.syncに書き込む
 * 1. ローカルバックアップを最新化
 * 2. 同期対象リストに変更なければ終了
 * 3. 差分があれば同期ストレージに書き込み結果を反映
 */
const saveNotesToStorage = async ({ sync = true }: { sync?: boolean } = {}) => {
  const localSnapshot = notes.value.map((note) => ({ ...note }))
  // localStorage保存
  setLegacyValue(STORAGE_NOTES_KEY, localSnapshot)

  for (const note of notes.value) {
    if (!note.isSynced) {
      setSyncStatus(note.id, 'off')
    } else if (note.text !== note.syncedText) {
      setSyncStatus(note.id, 'syncing')
    } else {
      setSyncStatus(note.id, 'synced')
    }
  }

  if (!sync || !hasSyncStorage) {
    refreshAllSyncStatuses()
    if (hasSyncStorage) {
      await updateSyncUsageBytes()
    } else {
      syncUsageBytes.value = null
    }
    return
  }

  const syncedNotesPayload: SyncedStorageNote[] = notes.value
    .filter((note) => note.isSynced)
    .map((note) => ({
      id: note.id,
      text: note.text,
      isSynced: true,
    }))

  const snapshot = JSON.stringify(syncedNotesPayload)
  if (snapshot === lastSyncedNotesJSON) {
    refreshAllSyncStatuses()
    return
  }

  try {
    const writeResult = await writeSyncedNotesToStorage(syncedNotesPayload)
    if (writeResult?.success === false) {
      const quotaExceeded = writeResult.reason === 'total-limit'
      const chunkTooLarge = writeResult.reason === 'chunk-limit'
      const activeNoteId = currentId.value
      const activeNote = notes.value.find((note) => note.id === activeNoteId)

      for (const note of notes.value) {
        if (!note.isSynced) {
          setSyncStatus(note.id, 'off')
          continue
        }

        if ((quotaExceeded || chunkTooLarge) && activeNote && note.id === activeNote.id) {
          note.isSynced = false
          note.syncedText = null
          setSyncStatus(note.id, 'off')
          continue
        }

        if (note.text !== note.syncedText) {
          setSyncStatus(note.id, 'error')
        } else {
          setSyncStatus(note.id, 'synced')
        }
      }

      if (quotaExceeded || chunkTooLarge) {
        setLegacyValue(
          STORAGE_NOTES_KEY,
          notes.value.map((note) => ({ ...note }))
        )
        window.alert(MESSAGE_SYNC_QUOTA_EXCEEDED)
      }
      await updateSyncUsageBytes()
      return
    }

    lastSyncedNotesJSON = snapshot
    for (const note of notes.value) {
      if (note.isSynced) {
        note.syncedText = note.text
      }
    }
    refreshAllSyncStatuses()
    await updateSyncUsageBytes()
  } catch (error) {
    console.error(error)
    const message = error instanceof Error ? (error.message ?? '') : String(error)
    const errorName = error instanceof Error ? error.name : ''
    const quotaExceeded =
      errorName === 'SyncStorageTotalLimitExceeded' ||
      errorName === 'SyncStorageChunkTooLarge' ||
      message.includes('QUOTA_BYTES') ||
      message.includes('QUOTA_BYTES_PER_ITEM')
    const activeNoteId = currentId.value
    const activeNote = notes.value.find((note) => note.id === activeNoteId)
    for (const note of notes.value) {
      if (!note.isSynced) {
        setSyncStatus(note.id, 'off')
        continue
      }

      if (quotaExceeded && activeNote && note.id === activeNote.id) {
        note.isSynced = false
        note.syncedText = null
        setSyncStatus(note.id, 'off')
        continue
      }

      if (note.text !== note.syncedText) {
        setSyncStatus(note.id, 'error')
      } else {
        setSyncStatus(note.id, 'synced')
      }
    }
    if (quotaExceeded) {
      setLegacyValue(
        STORAGE_NOTES_KEY,
        notes.value.map((note) => ({ ...note }))
      )
      window.alert(MESSAGE_SYNC_QUOTA_EXCEEDED)
    }
    await updateSyncUsageBytes()
  }
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
  // ページ離脱などの直前に即時保存を走らせる
  void saveNotesToStorage()
}

/**
 * ノート配列かどうか
 * @param value ノート配列候補
 */
const isStoredNoteArray = (value: unknown): value is StoredNotePayload[] => {
  return (
    Array.isArray(value) &&
    value.every(
      (note) =>
        note &&
        typeof note.id === 'string' &&
        typeof note.text === 'string' &&
        (note.isSynced === undefined || typeof note.isSynced === 'boolean') &&
        (note.syncedText === undefined ||
          note.syncedText === null ||
          typeof note.syncedText === 'string')
    )
  )
}

/**
 * chrome.storage.syncから同期ノートを取得し、チャンク構成にも対応して復元する
 * @param metaValue onChangedなどで受け取ったメタ情報
 */
const readSyncedNotesFromStorage = async (
  metaValue?: unknown
): Promise<{ notes: StoredNotePayload[] | undefined; chunkCount: number }> => {
  if (!hasSyncStorage) {
    return { notes: undefined, chunkCount: 0 }
  }

  let baseValue = metaValue
  if (baseValue === undefined) {
    const result = await storageArea!.get(STORAGE_SYNCED_NOTES_KEY)
    baseValue = result[STORAGE_SYNCED_NOTES_KEY]
  }

  if (baseValue === undefined || baseValue === null) {
    return { notes: undefined, chunkCount: 0 }
  }

  if (Array.isArray(baseValue)) {
    return { notes: baseValue, chunkCount: 0 }
  }

  if (typeof baseValue === 'object') {
    const meta = baseValue as Record<string, unknown>
    const version = meta.version
    const chunkCountValue = Number(meta.chunkCount ?? 0)
    if (
      version === SYNC_CHUNK_META_VERSION &&
      Number.isFinite(chunkCountValue) &&
      chunkCountValue >= 0
    ) {
      const chunkCount = Math.floor(chunkCountValue)
      if (chunkCount === 0) {
        return { notes: [], chunkCount: 0 }
      }
      const chunkKeys = Array.from({ length: chunkCount }, (_, index) => getSyncChunkKey(index))
      const chunkResult = await storageArea!.get(chunkKeys)
      const json = chunkKeys
        .map((key) => {
          const chunk = chunkResult[key]
          return typeof chunk === 'string' ? chunk : ''
        })
        .join('')
      if (!json) {
        return { notes: [], chunkCount }
      }
      try {
        const parsed = JSON.parse(json)
        if (isStoredNoteArray(parsed)) {
          return { notes: parsed, chunkCount }
        }
      } catch (error) {
        console.error('[new-tab-note] Failed to parse synced notes chunks', error)
      }
      return { notes: [], chunkCount }
    }
  }

  return { notes: undefined, chunkCount: 0 }
}

/**
 * storage.payloadをNote型に整形
 * @param payload chrome.storage.syncやlocalStorageから取り出した生データ
 */
const toLocalNote = (payload: StoredNotePayload): Note => {
  const isSynced = payload.isSynced === true
  const syncedText =
    typeof payload.syncedText === 'string'
      ? payload.syncedText
      : payload.syncedText === null
        ? null
        : isSynced
          ? payload.text
          : null

  return {
    id: payload.id,
    text: payload.text,
    isSynced,
    syncedText,
  }
}

/**
 * 新しいノートを追加
 */
const createNote = async () => {
  const id = uuidv4()
  const newNote = {
    id,
    text: notes.value.length ? '' : MESSAGE_INIT_TEXT.replace(/\s+$/, ''),
    isSynced: false,
    syncedText: null,
  }
  notes.value.push(newNote)
  setSyncStatus(id, 'off')
  currentId.value = id
  text.value = newNote.text
  // ストレージ更新
  await saveNotesToStorage()
  // localStorage保存
  setLegacyValue(STORAGE_TARGET_NOTE_ID_KEY, id)
}

/**
 * 指定したノートを削除
 * @param {string} id
 */
const deleteNote = async (id: string) => {
  const idx = notes.value.findIndex((n) => n.id === id)
  if (idx === -1) return

  const targetNote = notes.value[idx]
  const confirmMessage = targetNote?.isSynced
    ? MESSAGE_CONFIRM_DELETE_SYNCED_NOTE || MESSAGE_CONFIRM_DELETE_NOTE
    : MESSAGE_CONFIRM_DELETE_NOTE
  if (!window.confirm(confirmMessage)) return

  notes.value.splice(idx, 1)
  clearSyncStatus(id)
  // ストレージ更新
  await saveNotesToStorage()

  if (notes.value.length === 0) {
    currentId.value = ''
    text.value = ''
    setLegacyValue(STORAGE_TARGET_NOTE_ID_KEY, undefined)
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

  refreshAllSyncStatuses()
}

/**
 * 現在表示するノートを切り替える
 * @param {string} id ノートid
 */
const changeNote = (id: string) => {
  if (currentId.value === id) return
  currentId.value = id
}

/**
 * テーマカラーの選択を更新する
 * @param {string} colorName テーマカラー名
 */
const changeTheme = (colorName: string) => {
  theme.value = colorName
}

/**
 * chrome.storage.sync に保存されている指定ノートの本文を取得
 * @param {string} id ノートid
 */
const getRemoteNoteSnapshot = async (id: string): Promise<string | null> => {
  if (!hasSyncStorage) return null
  try {
    const { notes: payload } = await readSyncedNotesFromStorage()
    if (!payload) return null
    const target = payload.find((note) => note.id === id)
    return target ? target.text : null
  } catch (error) {
    console.error(error)
    return null
  }
}

/**
 * 同期トグルのON/OFF処理
 * ローカル/同期データ間の競合解決もここで行う
 * @param {string} id ノートid
 */
const toggleNoteSync = async (id: string) => {
  if (!hasSyncStorage) return // 同期機能が使えない環境では何もしない
  const note = notes.value.find((n) => n.id === id)
  if (!note) return

  if (note.isSynced) {
    note.isSynced = false
    if (note.syncedText === null) {
      note.syncedText = note.text
    }
    setSyncStatus(note.id, 'off')
    await saveNotesToStorage()
    return
  }

  let remoteText: string | null = note.syncedText
  const latestRemote = await getRemoteNoteSnapshot(id)
  if (latestRemote !== null) {
    remoteText = latestRemote // 同期領域に残っている最新の本文を採用
  }

  if (remoteText !== null && remoteText !== note.text) {
    // 同期をOFFにした後に編集した場合に、今の内容で同期をしていいかの確認
    if (!window.confirm(MESSAGE_RESUME_SYNC_USE_LOCAL)) return
  }

  note.isSynced = true
  note.syncedText = note.text
  setSyncStatus(note.id, 'syncing')
  await saveNotesToStorage()
}

// 初期化
onMounted(async () => {
  const storageKeys = [STORAGE_SYNCED_NOTES_KEY, STORAGE_NOTES_KEY, STORAGE_THEME_COLOR_KEY]
  const storedValues = await getStorageValues(storageKeys)

  const legacyNotes = readLegacyValue(STORAGE_NOTES_KEY)
  if (isStoredNoteArray(legacyNotes)) {
    notes.value = legacyNotes.map(toLocalNote)
  }

  const syncedFromStorage =
    storedValues[STORAGE_SYNCED_NOTES_KEY] ?? storedValues[STORAGE_NOTES_KEY]
  if (isStoredNoteArray(syncedFromStorage)) {
    const remoteList = syncedFromStorage.map((payload) =>
      toLocalNote({ ...payload, syncedText: payload.text })
    )
    const remoteOrder = new Map(remoteList.map((note, index) => [note.id, index]))
    const merged: Note[] = []

    for (const remote of remoteList) {
      const local = notes.value.find((note) => note.id === remote.id)
      if (local) {
        // 同じnote idが見つかった場合は同期設定によって上書きする情報を変える
        const updated: Note = {
          ...local,
          isSynced: remote.isSynced,
          syncedText: remote.syncedText,
          text: remote.isSynced ? remote.text : local.text, // 同期OFFの場合は勝手に更新されない
        }
        merged.push(updated)
      } else {
        merged.push(remote)
      }
    }

    for (const local of notes.value) {
      if (!remoteOrder.has(local.id) && !local.isSynced) {
        // リモートに無い＆同期OFFのノートはローカル専用として残す
        merged.push(local)
      }
    }

    notes.value.splice(0, notes.value.length, ...merged)
    // 最終同期情報
    lastSyncedNotesJSON = JSON.stringify(syncedFromStorage)
    // localStorageに保存
    setLegacyValue(STORAGE_NOTES_KEY, notes.value)
  }

  refreshAllSyncStatuses()

  if (!notes.value.length) {
    await createNote() // データが何も無ければ初期ノートを生成
  }

  /**
   * プレビューモードの初期値をlocalStorageから取得
   */
  const legacyPreview = readLegacyValue(STORAGE_PREVIEW_MODE_KEY)
  if (typeof legacyPreview === 'boolean') {
    isPreviewMode.value = legacyPreview
  }

  /**
   * フィルター設定の初期値をlocalStorageから取得
   */
  const legacyFilter = readLegacyValue(STORAGE_FILTER_KEY)
  if (typeof legacyFilter === 'boolean') {
    isFilter.value = legacyFilter
  }

  /**
   * テーマカラーの初期値をストレージから取得
   * 見つからなければlocalStorageから拾って復元
   */
  const storedTheme = storedValues[STORAGE_THEME_COLOR_KEY]
  if (typeof storedTheme === 'string') {
    theme.value = storedTheme as Theme
  } else {
    // localStorageから拾って復元
    const legacyTheme = readLegacyValue(STORAGE_THEME_COLOR_KEY)
    if (typeof legacyTheme === 'string') {
      theme.value = legacyTheme as Theme
    }
  }

  /**
   * サイドメニューの開閉状態の初期値をlocalStorageから取得
   */
  const legacySideMenu = readLegacyValue(STORAGE_SIDE_MENU_OPEN_KEY)
  if (typeof legacySideMenu === 'boolean') {
    isOpenSideMenu.value = legacySideMenu
  }

  let targetId = readLegacyValue(STORAGE_TARGET_NOTE_ID_KEY)
  if (typeof targetId !== 'string') {
    targetId = notes.value[0]?.id ?? ''
  }
  if (typeof targetId === 'string' && notes.value.some((n) => n.id === targetId)) {
    // 前回開いていたノートのIDを挿入
    currentId.value = targetId
  } else {
    // 前回開いていたノートが存在しない場合は先頭のノート(存在しなければ空)を表示
    currentId.value = notes.value[0]?.id ?? ''
  }

  await saveNotesToStorage()

  // ノートの内容を挿入
  const note = notes.value.find((n) => n.id === currentId.value)
  text.value = note ? note.text : ''
  // テーマカラー更新
  setThemeColor(theme.value)

  isInitialized.value = true

  if (shouldSaveAfterInit) {
    shouldSaveAfterInit = false
    await saveNotesToStorage()
  }

  await updateSyncUsageBytes()

  if (chrome?.storage?.onChanged) {
    chrome.storage.onChanged.addListener(storageChangeHandler)
  }

  window.addEventListener('beforeunload', flushQueuedNotesSave)
  window.addEventListener('pagehide', flushQueuedNotesSave)
})

onBeforeUnmount(() => {
  if (saveNotesTimeout) {
    clearTimeout(saveNotesTimeout)
    saveNotesTimeout = null
  }
  if (storageUpdateReleaseTimerId) {
    clearTimeout(storageUpdateReleaseTimerId)
    storageUpdateReleaseTimerId = null
  }
  window.removeEventListener('beforeunload', flushQueuedNotesSave)
  window.removeEventListener('pagehide', flushQueuedNotesSave)
  if (chrome?.storage?.onChanged) {
    chrome.storage.onChanged.removeListener(storageChangeHandler)
  }
})

// ノート本文更新時
watch(text, (val) => {
  if (!currentId.value) return
  const idx = notes.value.findIndex((n) => n.id === currentId.value)
  if (idx === -1) return

  // 更新内容が同じだった場合はスキップ
  if (notes.value[idx].text === val) return

  notes.value[idx].text = val

  // chrome.storage.onChangedから受け取った更新だった場合はスキップ
  if (isApplyingStorageUpdate) return

  if (isInitialized.value && notes.value[idx].isSynced) {
    setSyncStatus(notes.value[idx].id, 'syncing')
  }

  // 同期対象ならchrome.storage.syncへ書き込み、ストレージに保存
  queueSaveNotes()
})

// 選択中のノート変更時
watch(currentId, (val) => {
  const note = notes.value.find((n) => n.id === val)
  const next = note ? note.text : ''
  if (text.value !== next) {
    // 選択ノートが変わったら本文を同期
    text.value = next
  }

  // 初期化前や同期反映中は保存しない
  if (!isInitialized.value || isApplyingStorageUpdate) return

  if (val) {
    // 選択中のノートIDをlocalStorageに保存
    setLegacyValue(STORAGE_TARGET_NOTE_ID_KEY, val)
  } else {
    // ノートがなくなったらlocalStorageに保持していたIDを破棄
    setLegacyValue(STORAGE_TARGET_NOTE_ID_KEY, undefined)
  }
})

// プレビューモード更新時
watch(isPreviewMode, (val) => {
  if (!isInitialized.value || isApplyingStorageUpdate) return // 初期化前・同期反映中は書き込み不要
  // 端末ごとに保持するためlocalStorageに保存
  setLegacyValue(STORAGE_PREVIEW_MODE_KEY, val)
})

// フィルター設定更新時
watch(isFilter, (val) => {
  if (!isInitialized.value || isApplyingStorageUpdate) return // 初期化前・同期反映中は書き込み不要
  // 端末ごとに保持するためlocalStorageに保存
  setLegacyValue(STORAGE_FILTER_KEY, val)
})

// テーマカラー更新時
watch(theme, (val) => {
  setThemeColor(val)
  if (!isInitialized.value || isApplyingStorageUpdate) return // 初期化前・同期反映中は保存しない
  // テーマカラーは端末間で共有するため同期ストレージへ保存
  void setStorageValue(STORAGE_THEME_COLOR_KEY, val)
})

// サイドメニュー開閉更新時
watch(isOpenSideMenu, (val) => {
  if (!isInitialized.value || isApplyingStorageUpdate) return // 初期化前・同期反映中は保存しない
  // 端末ごとに保持するためlocalStorageに保存
  setLegacyValue(STORAGE_SIDE_MENU_OPEN_KEY, val)
})
</script>

<style scoped></style>
