<template>
  <div v-if="updateAvailable" class="sw-toast">
    🔄 Neue Version verfügbar.
    <button @click="reload">Jetzt aktualisieren</button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const updateAvailable = ref(false)

onMounted(() => {
  window.addEventListener('sw-update-available', () => {
    updateAvailable.value = true
  })
})

function reload() {
  navigator.serviceWorker.getRegistration().then(reg => {
    if (reg?.waiting) {
      reg.waiting.postMessage({ type: 'SKIP_WAITING' })
      window.location.reload()
    }
  })
}
</script>

<style scoped>
.sw-toast {
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  background: #333;
  color: white;
  padding: 1rem;
  border-radius: 4px;
  z-index: 1000;
}
.sw-toast button {
  margin-left: 1rem;
  background: #fff;
  color: #333;
  border: none;
  padding: 0.5rem 1rem;
  cursor: pointer;
}
</style>
