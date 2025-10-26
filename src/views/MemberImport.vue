<template>
  <main data-testid="member-import" class="page member-import">
    <h1>{{ t('import.title') }}</h1>
    <p class="muted">{{ t('import.description') }}</p>

    <section aria-labelledby="import-controls">
  <label id="import-controls" for="import-file">{{ t('import.choose_file') }}</label>
  <input id="import-file" type="file" accept="application/json" @change="onFile" aria-label="Import JSON file" aria-describedby="import-controls" />

      <label class="checkbox">
        <input type="checkbox" v-model="createBackup" />
        <span>{{ t('import.backup_before') }}</span>
      </label>

      <div class="actions">
        <button type="button" class="btn" @click="startImport" :disabled="!file || loading">{{ t('import.start_import') }}</button>
      </div>

      <div v-if="loading" role="status" aria-live="polite">{{ t('import.loading') }} <span class="spinner">⏳</span></div>

      <div v-if="preview">
          <h2>{{ t('import.preview') }}</h2>
          <pre class="preview">{{ preview }}</pre>
        </div>

      <div v-if="result" role="status" aria-live="polite" class="result">{{ result }}</div>
    </section>
    <ImportPreviewModal v-if="showConfirm" :previewData="previewData" @confirm="onModalConfirm" @cancel="onModalCancel" />

  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useNotify } from '../composables/useNotify'
import ImportPreviewModal from '../components/ImportPreviewModal.vue'

const { t } = useI18n()
// small readiness signal for Playwright so tests can wait until this view has mounted
onMounted(() => {
  try {
    ;(window as any).APP_READY_FOR_TESTS = true
    try { console.info('APP_READY_FOR_TESTS set (MemberImport)') } catch (e) {}
  } catch (e) { /* noop */ }
})
const file = ref<File | null>(null)
const preview = ref('')
const createBackup = ref(true)
const loading = ref(false)
const result = ref('')
const notify = useNotify()

// confirm modal helpers
const showConfirm = ref(false)
let confirmResolver: ((v: boolean)=>void) | null = null
function waitForConfirm() {
  return new Promise<boolean>((res) => { confirmResolver = res; showConfirm.value = true })
}
function doConfirm(v:boolean) {
  showConfirm.value = false
  if (confirmResolver) confirmResolver(v)
  confirmResolver = null
}

const previewData = ref<{ newCount:number; updatedCount:number; memberList?: any[] }>({ newCount:0, updatedCount:0, memberList:[] })

function onModalConfirm() {
  // user confirmed - emit the internal confirm resolver
  doConfirm(true)
}

function onModalCancel() {
  doConfirm(false)
}

function onFile(e: Event) {
  const input = e.target as HTMLInputElement
  const f = input.files?.[0] || null
  file.value = f
  preview.value = ''
  if (f) {
    const reader = new FileReader()
    reader.onload = () => { preview.value = String(reader.result).slice(0, 2000) }
    reader.readAsText(f)
  }
}

async function startImport() {
  if (!file.value) return
  loading.value = true
  result.value = ''
  try {
    const text = await file.value.text()
    const payload = JSON.parse(text)
    // dry-run by default: call endpoint with ?dry=true first
    const dry = await fetch('/api/members/import?dry=true', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ members: payload, backup: createBackup.value })
    })
    const dryJson = await dry.json()
    // show preview from server and open confirm modal
    // expected dryJson shape: { newCount, updatedCount, members }
    previewData.value = {
      newCount: dryJson.newCount || 0,
      updatedCount: dryJson.updatedCount || 0,
      memberList: dryJson.members || []
    }
    preview.value = JSON.stringify(dryJson, null, 2)
    showConfirm.value = true
    // wait for user confirmation
    const confirmed = await waitForConfirm()
    if (!confirmed) {
      result.value = t('import.cancelled') || 'Cancelled'
      notify.push(result.value, 'info')
      return
    }

    // commit after confirmation
    const commit = await fetch('/api/members/import', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ members: payload, backup: createBackup.value })
    })
    if (!commit.ok) throw new Error('Commit failed')
    const commitJson = await commit.json()
    result.value = t('import.success')
    notify.push(t('import.success'), 'success')
  } catch (err: any) {
    result.value = t('import.error') + ': ' + (err?.message || String(err))
    notify.push(result.value, 'error')
  } finally {
    loading.value = false
  }
}

</script>

<style scoped>
.preview { background:#f7f7f7; padding:8px; max-height:320px; overflow:auto }
.checkbox { display:flex; gap:8px; align-items:center; margin-top:8px }
.actions { margin-top:12px }
.spinner { margin-left:8px }
.result { margin-top:12px; font-weight:600 }
</style>
