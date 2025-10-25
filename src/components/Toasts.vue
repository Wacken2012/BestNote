<template>
  <div class="toasts">
    <div v-for="t in toasts" :key="t.id" :class="['toast', t.type]">{{ t.message }}</div>
  </div>
</template>

<script setup lang="ts">
import { useNotify } from '../composables/useNotify'
const { toasts } = useNotify()
</script>

<style scoped>
.toasts { position: fixed; right: 12px; top: 12px; z-index: 1000 }
.toast { margin-bottom: 8px; padding: 8px 12px; border-radius: 6px; color: white }
.toast.info { background: #1976d2 }
.toast.success { background: #2e7d32 }
.toast.error { background: #c62828 }
</style>
