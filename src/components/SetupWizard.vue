<template>
  <div data-testid="setup-wizard" class="setup-wizard" role="dialog" aria-modal="true" aria-labelledby="setup-title">
    <h2 id="setup-title">{{ $t('setup.title') }}</h2>
    <div class="progress" aria-hidden="true">
      <!-- expose progressbar semantics for assistive tech -->
      <progress
        :value="currentStep"
        :max="steps.length"
        role="progressbar"
        :aria-valuenow="currentStep"
        aria-valuemin="1"
        :aria-valuemax="steps.length"
      ></progress>
      <span class="sr-only">{{ $t('setup.step') }} {{ currentStep }} / {{ steps.length }}</span>
    </div>

    <form @submit.prevent="nextStep" @keydown.enter.prevent>
      <component :is="steps[currentStep-1].component" v-model="form" :step-index="currentStep" />

      <div class="actions">
        <button type="button" class="btn" @click="prevStep" :disabled="currentStep===1">{{ $t('actions.back') }}</button>
  <!-- use real disabled attribute so keyboard users cannot tab to a submitting button -->
  <button type="submit" class="btn primary" :disabled="submitting">{{ currentStep===steps.length ? $t('actions.finish') : $t('actions.next') }}</button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useSetupStore } from '../store/setup'
import LanguageStep from './wizard/LanguageStep.vue'
import AdminStep from './wizard/AdminStep.vue'
import BackupStep from './wizard/BackupStep.vue'
import ImportTestStep from './wizard/ImportTestStep.vue'
import PermissionsStep from './wizard/PermissionsStep.vue'
import FinishStep from './wizard/FinishStep.vue'

const store = useSetupStore()
const router = useRouter()
const { locale } = useI18n()

const steps = [
  { key: 'language', component: LanguageStep },
  { key: 'admin', component: AdminStep },
  { key: 'backup', component: BackupStep },
  { key: 'import', component: ImportTestStep },
  { key: 'permissions', component: PermissionsStep },
  { key: 'finish', component: FinishStep }
]

const currentStep = ref(1)
const submitting = ref(false)
const form = ref({})

// react to language changes in the store
watch(() => store.language, (v) => { if (v) locale.value = v })

function prevStep() {
  if (currentStep.value > 1) currentStep.value--
}

async function nextStep() {
  if (currentStep.value < steps.length) {
    currentStep.value++
    return
  }
  // finish: persist and redirect
  submitting.value = true
  store.setSetupCompleted(true)
  // store persists to localStorage in the action; also ensure i18n locale set
  if (store.language) locale.value = store.language
  submitting.value = false
  // navigate to dashboard
  await router.push({ name: 'Dashboard' })
}

onMounted(() => {
  // ensure i18n uses stored language at mount
  if (store.language) locale.value = store.language
})
</script>

<style scoped>
.setup-wizard { max-width: 760px; margin: 1rem auto; padding: 1rem; }
.actions { display:flex; gap:8px; justify-content:flex-end; margin-top:12px }
.btn { padding:8px 12px; font-size:1rem }
.primary { background:#036; color:#fff }
.sr-only { position:absolute; left:-10000px }
</style>
