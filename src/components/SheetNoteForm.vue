<template>
  <form @submit.prevent="submit">
    <label for="content">Notiz hinzufügen</label>
    <textarea id="content" v-model="content" />
    <button type="submit">Speichern</button>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useNoteStore } from '../stores/noteStore'
import { useRoute } from 'vue-router'

const store = useNoteStore()
const route = useRoute()
const content = ref('')

function submit() {
  store.addNote(Number(route.params.id), content.value)
  content.value = ''
}
</script>
