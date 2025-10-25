<template>
  <div>
    <h2>Members</h2>
    <div v-if="loading">Loading...</div>
    <div v-if="error" class="error">{{ error }}</div>
    <ul>
      <li v-for="m in members" :key="m.id">
        <router-link :to="`/members/${m.id}`">{{ m.name || m.id }}</router-link>
        <span class="chips">
          <span v-for="r in (m.roles || [])" :key="r" class="chip">{{ r }}</span>
        </span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useApi } from '../composables/useApi'
const members = ref<any[]>([])
const loading = ref(false)
const error = ref('')
const { request } = useApi()

async function load() {
  loading.value = true
  try {
    const res = await request('/api/members')
    members.value = res.members || []
  } catch (e: any) { error.value = e.message }
  loading.value = false
}

onMounted(load)
</script>

<style scoped>
.chip { padding: .15rem .4rem; background: #eef; border-radius: 999px; margin-left: .3rem }
.error { color: #b00 }
</style>
