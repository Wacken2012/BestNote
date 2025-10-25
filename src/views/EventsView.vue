<template>
  <div>
    <h2>Termine</h2>
    <div v-if="mayAccessCalendar">
      <p>Kalenderintegration via CalDAV / Nextcloud (Platzhalter)</p>
      <!-- Hier kommt die Calendar-Komponente / Sync-Logik -->
    </div>
    <div v-else>
      <p>Sie haben keine Berechtigung, den Kalender einzusehen.</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useUserStore } from '@/store/user'
import { canAccessCalendar } from '@/services/PermissionService'

const userStore = useUserStore()
const mayAccessCalendar = computed(() => {
  const role = userStore.primaryRole
  const user = { role }
  return canAccessCalendar(user as any)
})
</script>

<style scoped>
</style>
