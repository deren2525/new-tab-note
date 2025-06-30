<template>
  <div class="w-full h-full flex flex-col justify-center items-center bg-bg_secondary">
    <div class="text-h4 mb-[8px]">ノートがありません</div>
    <button class="px-[16px] py-[8px] rounded bg-primary text-white" @click="handleCreateNote">
      新規ノートを作成
    </button>
  </div>
</template>
<script setup lang="ts">
const emit = defineEmits<{ (e: 'create'): void }>()

const handleCreateNote = () => {
  emit('create')
}
</script>
