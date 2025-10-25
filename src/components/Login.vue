<template>
  <div class="login">
    <h3>Login</h3>
    <div>
      <label>Token (dev)</label>
      <input v-model="token" placeholder="paste JWT here" />
      <button @click="useToken">Use token</button>
    </div>
    <div v-if="devMode">
      <h4>Request dev token</h4>
      <input v-model="devId" placeholder="user id (e.g. u1)" />
      <input v-model="devRoles" placeholder="roles (comma)" />
      <button @click="requestDevToken">Request</button>
    </div>
    <div v-if="error" class="error">{{ error }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '../store/auth'
import { useNotify } from '../composables/useNotify'

const auth = useAuthStore()
const token = ref('')
const devId = ref('')
const devRoles = ref('')
const error = ref('')
const devMode = import.meta.env.MODE === 'development'
const { push } = useNotify()

function useToken() {
  if (!token.value) return error.value = 'token required'
  auth.setToken(token.value)
  push('Logged in', 'success')
}

async function requestDevToken() {
  error.value = ''
  try {
    const res = await fetch('/dev/token', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: devId.value, roles: devRoles.value.split(',').map(s=>s.trim()).filter(Boolean) }) })
    const body = await res.json()
    if (!body || !body.token) return error.value = 'no token returned'
    auth.setToken(body.token)
    push('Dev token erhalten', 'success')
  } catch (e: any) { error.value = e.message }
}

auth.loadFromStorage()
</script>

<style scoped>
.error { color: darkred }
</style>
