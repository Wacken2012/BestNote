<template>
  <div>
    <div v-if="loading">Loading...</div>
    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="member">
      <h2>{{ member.name || member.id }}</h2>
      <div><strong>ID:</strong> {{ member.id }}</div>
      <div v-if="member.email"><strong>Email:</strong> {{ member.email }}</div>
      <div v-if="member.phone"><strong>Phone:</strong> {{ member.phone }}</div>
      <div class="chips"><span v-for="r in (member.roles||[])" :key="r" class="chip">{{ r }}</span></div>
      <div v-if="isAdmin">
        <RolesMultiSelect v-model="member.roles" />
        <button @click="save">Save</button>
        <button @click="confirmDelete">Delete member</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useApi } from '../composables/useApi'
import { useUserStore } from '../store/user'
import RolesMultiSelect from './RolesMultiSelect.vue'
import { useNotify } from '../composables/useNotify'

const route = useRoute()
const router = useRouter()
const id = route.params.id as string
const { request } = useApi()
const member = ref<any>(null)
const loading = ref(false)
const error = ref('')
const user = useUserStore()
const isAdmin = (user.roles as any).includes('admin')
const { push } = useNotify()

async function load() {
  loading.value = true
  try {
    const res = await request(`/api/members/${id}`)
    member.value = res.member
  } catch (e: any) { error.value = e.message }
  loading.value = false
}

function confirmDelete() {
  if (!confirm('Delete member? This cannot be undone')) return
  request(`/api/members/${id}`, { method: 'DELETE' }).then(() => {
    router.push('/members')
    push('Member deleted', 'success')
  }).catch((e:any) => error.value = e.message)
}

function save() {
  if (!isAdmin) return push('Only admins can save', 'error')
  request(`/api/members/${id}`, { method: 'PATCH', body: JSON.stringify({ roles: member.value.roles }) }).then(() => {
    push('Saved', 'success')
  }).catch((e:any) => push(e.message || 'Save failed', 'error'))
}

onMounted(load)
</script>

<style scoped>
.chip { padding: .15rem .4rem; background: #eef; border-radius: 999px; margin-right: .3rem }
.error { color: #b00 }
</style>
