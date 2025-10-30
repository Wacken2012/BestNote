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
.app-header { display:flex; justify-content:space-between; align-items:center; padding:12px 16px; background:#1976d2; color:#ffffff }
.app-header h1 { margin:0; font-size:1.25rem; font-weight:600; color: #ffffff }
.controls { display:flex; gap:8px; align-items:center }
/* Use transparent control backgrounds so white text remains high-contrast against the blue header.
   Avoid low-opacity white overlays which reduce contrast for white text. Add clearer borders and
   focus styles to aid keyboard users. */
.controls select {
  padding:8px;
  border-radius:6px;
  background: transparent;
  color:#ffffff;
  border:1px solid rgba(255,255,255,0.28);
}
.controls select:focus,
.controls select:focus-visible {
  outline:2px solid rgba(255,255,255,0.18);
  box-shadow:0 0 0 3px rgba(25,118,210,0.18);
}
.controls .user { color: #ffffff }
.app-header button {
  background: transparent;
  color:#ffffff;
  border:1px solid rgba(255,255,255,0.28);
  padding:6px 8px;
  border-radius:6px;
}
.app-header button:focus,
.app-header button:focus-visible {
  outline:2px solid rgba(255,255,255,0.18);
  box-shadow:0 0 0 3px rgba(25,118,210,0.18);
}
</style>
