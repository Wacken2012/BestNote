<template>
  <section aria-labelledby="backup-step-title">
    <h3 id="backup-step-title">{{ $t('setup.backup_title') }}</h3>
    <p class="muted">{{ $t('setup.backup_description') }}</p>

    <label class="checkbox">
      <input type="checkbox" v-model="local.createBackup" />
      <span>{{ $t('setup.backup_before_import') }}</span>
    </label>

    <p class="help">{{ $t('setup.backup_help') }}</p>
  </section>
</template>

<script setup lang="ts">
import { reactive, watch, onMounted } from 'vue'
import { useA11y } from '../../mixins/AccessibilityMixin'

const props = defineProps({ modelValue: Object })
const emit = defineEmits(['update:modelValue'])
const local = reactive({ createBackup: true })
const { focusFirst } = useA11y()

onMounted(() => focusFirst('input[type=checkbox]'))

watch(() => local.createBackup, (v) => emit('update:modelValue', { createBackup: v }))
</script>

<style scoped>
.checkbox { display:flex; gap:8px; align-items:center }
.muted { color:#666 }
</style>
