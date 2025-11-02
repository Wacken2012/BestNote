<template>
  <div v-if="visible" role="status" class="toast">Notiz erfolgreich erstellt!</div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const visible = ref(false)

function showToast() {
  visible.value = true
  setTimeout(() => visible.value = false, 3000)
}

defineExpose({ showToast })
</script>

<style scoped>
.toast { background: #222; color: #fff; padding: 0.5rem 1rem; border-radius: 6px }
</style>
