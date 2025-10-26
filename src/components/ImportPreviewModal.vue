<template>
  <div class="modal-backdrop" role="presentation">
    <div class="modal" role="dialog" aria-modal="true" :aria-describedby="descId" tabindex="-1" @keydown="onKeydown">
      <h2 id="title">{{ $t('import.confirm_title') }}</h2>
      <p :id="descId">{{ $t('import.confirm_description') }}</p>

      <ul class="summary">
        <li>{{ $t('import.new_count', { count: previewData.newCount }) }}</li>
        <li>{{ $t('import.updated_count', { count: previewData.updatedCount }) }}</li>
      </ul>

      <div v-if="previewData.memberList?.length">
        <h3>{{ $t('import.members_list') }}</h3>
        <ul class="member-list">
          <li v-for="m in previewData.memberList" :key="m.id">{{ m.name }} ({{ m.number }})</li>
        </ul>
      </div>

      <div class="actions">
        <button class="btn" @click="$emit('cancel')">{{ $t('actions.back') }}</button>
        <button class="btn primary" @click="$emit('confirm')">{{ $t('import.start_import') }}</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
const props = defineProps<{ previewData: { newCount: number; updatedCount: number; memberList?: Array<{id:string,name:string,number?:string}> } }>()
const descId = 'import-preview-desc'

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') { (document.activeElement as HTMLElement)?.blur(); (e.currentTarget as HTMLElement).dispatchEvent(new CustomEvent('cancel', { bubbles: true })) }
  if (e.key === 'Enter') { (e.currentTarget as HTMLElement).dispatchEvent(new CustomEvent('confirm', { bubbles: true })) }
}
</script>

<style scoped>
.modal-backdrop { position:fixed; inset:0; background:rgba(0,0,0,0.4); display:flex; align-items:center; justify-content:center }
.modal { background:#fff; padding:16px; width:90%; max-width:720px; border-radius:6px }
.actions { display:flex; gap:8px; justify-content:flex-end; margin-top:12px }
.member-list { max-height:200px; overflow:auto; padding-left:16px }
</style>
