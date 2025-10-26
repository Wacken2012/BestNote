<template>
  <div class="main-dashboard">
    <h2>{{ $t ? $t('members.title') : 'Members' }}</h2>
    <div style="margin-bottom:1rem">
      <label>
        <input type="checkbox" v-model="seniorMode" /> Senior mode
      </label>
      <select v-model="lang" @change="changeLang">
        <option value="en">EN</option>
        <option value="de">DE</option>
      </select>
    </div>

    <table>
      <thead>
        <tr><th>#</th><th>Name</th><th>Role</th><th>Actions</th></tr>
      </thead>
      <tbody>
        <tr v-for="(m, idx) in members" :key="m.id">
          <td>{{ idx + 1 }}</td>
          <td>{{ m.name }}</td>
          <td>{{ m.role }}</td>
          <td>
            <button v-if="can('edit-member')" @click="edit(m)">Edit</button>
            <button v-if="can('delete-member')" @click="remove(m)">Delete</button>
            <span v-if="!can('edit-member')">—</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '../store/user'
import { createPinia } from 'pinia'
import * as PermissionService from '../services/PermissionService'
// i18n exports are plain locale objects; avoid importing useI18n here

const pinia = createPinia()
const userStore = useUserStore(pinia)

const members = ref([])
const seniorMode = ref(false)
const lang = ref('de')

function can(permission) {
  return PermissionService.can(permission, userStore.roles)
}

function edit(member) {
  // placeholder: wire to modal or route
  console.log('edit', member)
}

function remove(member) {
  console.log('remove', member)
}

function changeLang() {
  try {
    // set document language as minimal runtime effect; the app's i18n store will pick up persisted language elsewhere
    document.documentElement.lang = lang.value
  } catch (e) {}
}

onMounted(async () => {
  try {
    const res = await fetch('/server/data/db.json')
    if (!res.ok) throw new Error('Failed to fetch members')
    const data = await res.json()
    members.value = data.members || []
  } catch (err) {
    console.error('Load members failed', err)
  }
})
</script>

<style scoped>
table { width: 100%; border-collapse: collapse }
td, th { padding: 8px; border: 1px solid #ddd }
</style>
