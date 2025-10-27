<template>
  <header class="app-header">
    <h1>{{ $t('app.title') }}</h1>
    <div class="controls">
        <label for="header-lang-select" class="visually-hidden">{{ $t('common.language') }}</label>
        <select id="header-lang-select" v-model="lang" @change="changeLang" aria-label="{{ $t('common.language') }}">
          <option value="de">DE</option>
          <option value="en">EN</option>
        </select>
        <div class="auth">
          <template v-if="auth.isAuthenticated">
            <span class="user">{{ auth.viewer.name || auth.viewer.id }}</span>
            <button @click="logout">Logout</button>
          </template>
          <template v-else>
            <Login />
          </template>
        </div>
      </div>
  </header>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import Login from './Login.vue'
import { useAuthStore } from '../store/auth'
import Toasts from './Toasts.vue'
const { locale } = useI18n()
const lang = ref(locale.value)
function changeLang() { locale.value = lang.value }
const auth = useAuthStore()
function logout() { auth.clear(); window.location.href = '/library' }
</script>

<style scoped>
.app-header { display:flex; justify-content:space-between; align-items:center; padding:12px 16px; background:#1976d2; color:white }
.controls select { padding:8px; border-radius:6px }
</style>
