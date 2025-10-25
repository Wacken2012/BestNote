<template>
  <header class="app-header">
    <h1>{{ $t('app.title') }}</h1>
    <div class="controls">
      <select v-model="lang" @change="changeLang">
        <option value="de">DE</option>
        <option value="en">EN</option>
      </select>
    </div>
  </header>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
const { locale } = useI18n()
const lang = ref(locale.value)
function changeLang() { locale.value = lang.value }
</script>

<style scoped>
.app-header { display:flex; justify-content:space-between; align-items:center; padding:12px 16px; background:#1976d2; color:white }
.controls select { padding:8px; border-radius:6px }
</style>
