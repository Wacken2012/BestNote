<template>
  <section aria-labelledby="import-test-title">
    <h3 id="import-test-title">{{ $t('setup.import_test_title') }}</h3>
    <p class="muted">{{ $t('setup.import_test_description') }}</p>

    <div class="field">
      <label for="sample-file">{{ $t('setup.import_sample_file') }}</label>
      <input id="sample-file" type="file" @change="onFile" accept=".csv,.json" />
    </div>

    <div v-if="preview.length">
      <h4>{{ $t('setup.preview') }}</h4>
      <pre class="preview">{{ preview }}</pre>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const props = defineProps({ modelValue: Object })
const emit = defineEmits(['update:modelValue'])
const preview = ref('')

function onFile(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files && input.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    preview.value = String(reader.result).slice(0, 2000)
    emit('update:modelValue', { preview: preview.value })
  }
  reader.readAsText(file)
}
</script>

<style scoped>
.preview { background:#f7f7f7; padding:8px; max-height:220px; overflow:auto }
</style>
