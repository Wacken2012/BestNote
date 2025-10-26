<template>
  <section aria-labelledby="admin-step-title">
    <h3 id="admin-step-title">{{ $t('setup.admin_title') }}</h3>

    <div class="field">
      <label for="admin-email">{{ $t('setup.admin_email') }}</label>
      <input id="admin-email" type="email" v-model="local.adminEmail" required autocomplete="email" />
      <p class="help" id="admin-email-help">{{ $t('setup.admin_email_help') }}</p>
    </div>

    <div class="field">
      <label for="admin-password">{{ $t('setup.admin_password') }}</label>
      <input id="admin-password" type="password" v-model="local.adminPassword" required autocomplete="new-password" aria-describedby="password-help" />
      <p class="help" id="password-help">{{ $t('setup.admin_password_help') }}</p>
    </div>

    <div class="field">
      <label for="admin-display">{{ $t('setup.admin_display_name') }}</label>
      <input id="admin-display" type="text" v-model="local.displayName" autocomplete="name" />
    </div>
  </section>
</template>

<script setup lang="ts">
import { reactive, watch, onMounted } from 'vue'
import { useA11y } from '../../mixins/AccessibilityMixin'

const props = defineProps({ modelValue: Object })
const emit = defineEmits(['update:modelValue'])

const local = reactive({ adminEmail: '', adminPassword: '', displayName: '' })
const { focusFirst, announce } = useA11y()

onMounted(() => {
  focusFirst('#admin-email')
  announce('' + (typeof (props as any).modelValue === 'object' ? 'Admin setup step' : ''))
})

watch(() => ({ ...local }), (v) => {
  emit('update:modelValue', v)
}, { deep: true })
</script>

<style scoped>
.field { margin-bottom: 12px }
label { display:block; font-weight:600; margin-bottom:6px }
input { width:100%; padding:8px; font-size:1rem }
.help { color: #666; font-size:0.9rem; margin-top:4px }
</style>
