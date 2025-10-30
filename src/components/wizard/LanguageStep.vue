<template>
  <div>
    <label for="lang-select">{{ $t('setup.language') }}</label>
    <select id="lang-select" v-model="local.lang">
      <option value="de">Deutsch</option>
      <option value="en">English</option>
    </select>
    <p class="help">{{ $t('setup.language_help') }}</p>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSetupStore } from '../../store/setup'
const store = useSetupStore()
const { locale } = useI18n()
const props = defineProps({ modelValue: Object })
const emit = defineEmits(['update:modelValue'])
const local = reactive({ lang: store.language || 'de' })

watch(() => local.lang, (v) => {
  store.setLanguage(v)
  // apply immediately to i18n and html lang
  if (v) {
    locale.value = v
    try { document.documentElement.lang = v } catch (e) { /* ignore in SSR */ }
  }
  emit('update:modelValue', { language: v })
})
</script>
