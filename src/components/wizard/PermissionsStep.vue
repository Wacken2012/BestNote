<template>
  <section aria-labelledby="permissions-title">
    <h3 id="permissions-title">{{ $t('setup.permissions.title') }}</h3>

    <div class="permission-row">
      <input
        id="allow-import"
        type="checkbox"
        :checked="allowImport"
        @change="onToggle($event.target.checked)"
      />
      <label for="allow-import">{{ $t('setup.permissions.allowImport') }}</label>
    </div>

    <p class="hint" v-if="hint">{{ hint }}</p>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ modelValue?: any, stepIndex?: number }>()
const emit = defineEmits(['update:modelValue'])

const allowImport = computed(() => {
  return !!(props.modelValue && props.modelValue.permissions && props.modelValue.permissions.allowImport)
})

const hint = ''

function onToggle(checked: boolean) {
  const base = props.modelValue && typeof props.modelValue === 'object' ? { ...props.modelValue } : {}
  base.permissions = { ...(base.permissions || {}), allowImport: !!checked }
  emit('update:modelValue', base)
}
</script>

<style scoped>
.permission-row { display:flex; align-items:center; gap:8px; margin:8px 0 }
.hint { color: #666; font-size: 0.9rem }
</style>
