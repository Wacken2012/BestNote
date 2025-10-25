<template>
  <div id="app" class="app-root">
    <Header />
    <div class="layout">
      <Sidebar />
      <main class="content">
        <MainDashboard v-if="showDashboard" />
        <router-view v-else />
      </main>
    </div>
    <Toasts />
  </div>
</template>

<script lang="ts" setup>
import Header from './components/Header.vue'
import Sidebar from './components/Sidebar.vue'
import MainDashboard from './components/MainDashboard.vue'
import Toasts from './components/Toasts.vue'
import { ref } from 'vue'

// Toggle via Vite env var VITE_SHOW_DASHBOARD (default: true)
const envVal = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SHOW_DASHBOARD
const showDashboard = ref(envVal === undefined ? true : String(envVal) === 'true')
</script>

<style scoped>
.layout { display:flex; }
.content { flex:1; padding:16px; }
.app-root { font-family: Inter, system-ui, Arial, sans-serif; }
</style>
