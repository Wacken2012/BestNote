<template>
  <form>
    <label for="orgName">{{ t('setup.orgName') }}</label>
    <input id="orgName" v-model="form.orgName" />

    <label for="language">{{ t('setup.language') }}</label>
    <select id="language" v-model="form.language">
      <option value="de">Deutsch</option>
      <option value="en">English</option>
    </select>

    <label>
      <input type="checkbox" v-model="form.demoMode" />
      {{ t('setup.enableDemo') }}
    </label>
  </form>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
defineProps<{ form: { orgName: string; language: string; demoMode: boolean } }>()
</script>
