<template>
  <div id="app" class="app-root">
    <Header />
    <div class="layout">
      <Sidebar />
      <main class="content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script lang="ts" setup>
import Header from './components/Header.vue'
import Sidebar from './components/Sidebar.vue'
</script>

<style scoped>
.layout { display:flex; }
.content { flex:1; padding:16px; }
.app-root { font-family: Inter, system-ui, Arial, sans-serif; }
</style>
