<template>
  <aside class="sidebar">
    <nav>
      <ul>
        <li><router-link to="/library">📚 {{$t('app.library')}}</router-link></li>
        <li><router-link to="/members">👥 {{$t('app.members')}}</router-link></li>
        <li><router-link to="/events">📅 {{$t('app.events')}}</router-link></li>
        <li><router-link to="/finances">💰 {{$t('app.finances')}}</router-link></li>
        <li><router-link to="/settings">⚙️ {{$t('app.settings')}}</router-link></li>
      </ul>
    </nav>
  </aside>
</template>

<script lang="ts" setup>
</script>

<style scoped>
.sidebar { width:220px; background:#f5f7fa; padding:12px }
.sidebar ul { list-style:none; padding:0 }
.sidebar li { margin:8px 0 }
.sidebar a { text-decoration:none; color:#333; font-weight:600 }
</style>
