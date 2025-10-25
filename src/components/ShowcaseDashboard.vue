<template>
  <section class="showcase">
    <h2>Showcase Dashboard</h2>
    <p><strong>Current roles:</strong> <span>{{ rolesDisplay }}</span></p>

    <h3>Available actions (sample)</h3>
    <ul>
      <li v-for="perm in permissionList" :key="perm.key">
        <strong>{{ perm.label }}:</strong>
        <span v-if="allowedActions.includes(perm.key)">allowed</span>
        <span v-else class="muted">not allowed</span>
      </li>
    </ul>

    <h3>Store snapshot</h3>
    <pre>{{ userSnapshot }}</pre>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUserStore } from '../store/user'
import { can } from '../services/PermissionService'

const userStore = useUserStore()

const permissionList = [
  { key: 'add_piece', label: 'Add piece / Add Piece' },
  { key: 'upload_piece', label: 'Upload piece / Upload Piece' },
  { key: 'create_setlist', label: 'Create setlist / Create Setlist' },
  { key: 'unknown_perm', label: 'Unknown permission' }
]

const allowedActions = computed(() => {
  return permissionList.filter(p => can(p.key, userStore.roles)).map(p => p.key)
})

const rolesDisplay = computed(() => (userStore.roles.length ? userStore.roles.join(', ') : '—'))

const userSnapshot = computed(() => JSON.stringify({ id: userStore.id, name: userStore.name, roles: userStore.roles }, null, 2))
</script>

<style scoped>
.showcase { padding: 1rem; border: 1px solid #e6e6e6; border-radius: 6px }
.muted { color: #888 }
pre { background: #f9f9f9; padding: .5rem; border-radius: 4px }
</style>
