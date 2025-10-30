<template>
  <section aria-labelledby="finish-title">
    <h3 id="finish-title">{{ $t('setup.finish.title') }}</h3>
    <p>{{ $t('setup.finish.description') }}</p>
    <p class="note">{{ $t('setup.finish.note') }}</p>
  </section>
</template>

<script setup lang="ts">
const props = defineProps<{ modelValue?: any }>()
</script>

<style scoped>
.note { color:#444 }
</style>
