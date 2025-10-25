<template>
  <div class="library-view">
    <h2>{{ $t('app.library') }}</h2>

    <div class="controls">
      <label>
        Instrument
        <select v-model="instrument">
          <option value="all">Alle</option>
          <option value="tuba">Tuba</option>
          <option value="violin">Violin</option>
        </select>
      </label>

      <div class="actions">
        <button v-can="'create_setlist'" @click="createSetlist">{{ $t('app.createSetlist') }}</button>
        <button v-can="'add_piece'" @click="openAdd">{{ $t('app.addPiece') }}</button>
      </div>
    </div>

    <div class="grid">
      <LibraryItem v-for="p in filtered" :key="p.id" :piece="p" />
    </div>

    <AddPieceModal v-if="addOpen" @close="() => (addOpen=false)" @added="onAdded" />
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import LibraryItem from '../components/LibraryItem.vue'
import AddPieceModal from '../components/AddPieceModal.vue'
import { useLibraryStore } from '../store/library'
import { useUserStore } from '../store/user'

const instrument = ref('all')
const addOpen = ref(false)
const library = useLibraryStore()
const user = useUserStore()

const filtered = computed(() => {
  let items = library.pieces.slice()
  if (instrument.value !== 'all') {
    items = items.filter(i => (i.voice || '').toLowerCase() === instrument.value.toLowerCase())
  }
  if (!user.roles.includes('dirigent') && !user.roles.includes('notenwart') && !user.roles.includes('admin')) {
    const instrumentName = 'tuba'
    items = items.filter(i => (i.voice || '').toLowerCase() === instrumentName)
  }
  return items
})

function createSetlist() { /* TODO */ }
function openAdd() { addOpen.value = true }
function onAdded(p: any) { console.log('added', p) }
</script>

<style scoped>
.grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:12px }
.controls { display:flex; gap:12px; align-items:center; justify-content:space-between }
.actions { display:flex; gap:8px }
button { padding:8px 12px; border-radius:8px; background:#1976d2; color:white; border:none }
</style>
})
